from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from src.models.user import User, UserRole, UserStatus, db
from src.models.driver import Driver
from src.models.subscription import Subscription, SubscriptionPlan
import jwt
import datetime
import os

auth_bp = Blueprint('auth', __name__)

def generate_token(user_id):
    """Generate JWT token for user"""
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    return jwt.encode(payload, os.environ.get('JWT_SECRET_KEY', 'asdf#FGSgvasgf$5$WGT'), algorithm='HS256')

def verify_token(token):
    """Verify JWT token and return user ID"""
    try:
        payload = jwt.decode(token, os.environ.get('JWT_SECRET_KEY', 'asdf#FGSgvasgf$5$WGT'), algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name', 'role']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if user already exists
        if User.find_by_email(data['email']):
            return jsonify({'error': 'User with this email already exists'}), 400
        
        # Validate role
        try:
            role = UserRole(data['role'])
        except ValueError:
            return jsonify({'error': 'Invalid role'}), 400
        
        # Create new user
        user = User(
            email=data['email'].lower().strip(),
            first_name=data['first_name'].strip(),
            last_name=data['last_name'].strip(),
            phone=data.get('phone', '').strip(),
            role=role
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.flush()  # Get user ID
        
        # Create driver profile if role is driver
        if role == UserRole.DRIVER:
            driver = Driver(
                user_id=user.id,
                license_number=data.get('license_number', ''),
                license_expiry=datetime.datetime.strptime(data.get('license_expiry', '2025-12-31'), '%Y-%m-%d').date(),
                vehicle_capacity=data.get('vehicle_capacity', 1)
            )
            db.session.add(driver)
        
        # Create basic subscription for all users
        subscription = Subscription(
            user_id=user.id,
            plan_type=SubscriptionPlan.BASIC,
            amount=29.99
        )
        db.session.add(subscription)
        
        db.session.commit()
        
        # Generate token
        token = generate_token(user.id)
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'token': token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user = User.find_by_email(data['email'].lower().strip())
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Check password
        if not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Check if user is active
        if user.status != UserStatus.ACTIVE:
            return jsonify({'error': 'Account is not active'}), 403
        
        # Update last login
        user.last_login = datetime.datetime.utcnow()
        db.session.commit()
        
        # Generate token
        token = generate_token(user.id)
        
        # Get additional profile data based on role
        profile_data = {}
        if user.role == UserRole.DRIVER and user.driver_profile:
            profile_data['driver'] = user.driver_profile.to_dict()
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'token': token,
            'profile': profile_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/verify-token', methods=['POST'])
def verify_user_token():
    """Verify JWT token"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'Token is required'}), 400
        
        user_id = verify_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        user = User.find_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get additional profile data based on role
        profile_data = {}
        if user.role == UserRole.DRIVER and user.driver_profile:
            profile_data['driver'] = user.driver_profile.to_dict()
        
        return jsonify({
            'valid': True,
            'user': user.to_dict(),
            'profile': profile_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Request password reset"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        user = User.find_by_email(email.lower().strip())
        if not user:
            # Don't reveal if email exists or not
            return jsonify({'message': 'If the email exists, a reset link has been sent'}), 200
        
        # Generate reset token (in production, this should be sent via email)
        reset_token = generate_token(user.id)
        user.reset_token = reset_token
        user.reset_token_expires = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        
        db.session.commit()
        
        return jsonify({
            'message': 'If the email exists, a reset link has been sent',
            'reset_token': reset_token  # TODO: Send this token via email in production
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password with token"""
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('password')
        
        if not token or not new_password:
            return jsonify({'error': 'Token and new password are required'}), 400
        
        user_id = verify_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid or expired reset token'}), 401
        
        user = User.find_by_id(user_id)
        if not user or user.reset_token != token:
            return jsonify({'error': 'Invalid reset token'}), 401
        
        if user.reset_token_expires and user.reset_token_expires < datetime.datetime.utcnow():
            return jsonify({'error': 'Reset token has expired'}), 401
        
        # Reset password
        user.set_password(new_password)
        user.reset_token = None
        user.reset_token_expires = None
        
        db.session.commit()
        
        return jsonify({'message': 'Password reset successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

