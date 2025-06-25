from flask import Blueprint, jsonify, request
from src.models.user import User, UserRole, db
from src.models.rider import Rider, RiderStatus
from src.routes.auth import verify_token
from datetime import datetime

rider_bp = Blueprint('rider', __name__)

def require_auth(f):
    """Decorator to require authentication"""
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Authorization header required'}), 401
        
        try:
            token = auth_header.split(' ')[1]  # Bearer <token>
            user_id = verify_token(token)
            if not user_id:
                return jsonify({'error': 'Invalid token'}), 401
            
            request.current_user_id = user_id
            return f(*args, **kwargs)
        except:
            return jsonify({'error': 'Invalid authorization header'}), 401
    
    decorated_function.__name__ = f.__name__
    return decorated_function

@rider_bp.route('/', methods=['GET'])
@require_auth
def get_my_riders():
    """Get current user's riders (for parents)"""
    try:
        user = User.find_by_id(request.current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        riders = Rider.find_by_parent(user.id)
        return jsonify([rider.to_dict() for rider in riders]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@rider_bp.route('/<int:rider_id>', methods=['GET'])
@require_auth
def get_rider(rider_id):
    """Get specific rider by ID"""
    try:
        rider = Rider.query.get(rider_id)
        if not rider:
            return jsonify({'error': 'Rider not found'}), 404
        
        # Check if user has access to this rider
        user = User.find_by_id(request.current_user_id)
        if user.role == UserRole.RIDER and rider.parent_user_id != user.id:
            return jsonify({'error': 'Access denied'}), 403
        
        return jsonify(rider.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@rider_bp.route('/', methods=['POST'])
@require_auth
def create_rider():
    """Create a new rider profile"""
    try:
        user = User.find_by_id(request.current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['student_name', 'school']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create new rider
        rider = Rider(
            parent_user_id=user.id,
            student_name=data['student_name'],
            school=data['school']
        )
        
        # Set optional fields
        if 'grade' in data:
            rider.grade = data['grade']
        
        if 'date_of_birth' in data:
            rider.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        
        if 'special_needs' in data:
            rider.special_needs = data['special_needs']
        
        if 'medical_conditions' in data:
            rider.medical_conditions = data['medical_conditions']
        
        if 'emergency_contact_name' in data:
            rider.emergency_contact_name = data['emergency_contact_name']
        
        if 'emergency_contact_phone' in data:
            rider.emergency_contact_phone = data['emergency_contact_phone']
        
        if 'emergency_contact_relationship' in data:
            rider.emergency_contact_relationship = data['emergency_contact_relationship']
        
        if 'pickup_address' in data:
            rider.pickup_address = data['pickup_address']
        
        if 'dropoff_address' in data:
            rider.dropoff_address = data['dropoff_address']
        
        db.session.add(rider)
        db.session.commit()
        
        return jsonify({
            'message': 'Rider profile created successfully',
            'rider': rider.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@rider_bp.route('/<int:rider_id>', methods=['PUT'])
@require_auth
def update_rider(rider_id):
    """Update a rider profile"""
    try:
        rider = Rider.query.get(rider_id)
        if not rider:
            return jsonify({'error': 'Rider not found'}), 404
        
        # Check if user has access to this rider
        user = User.find_by_id(request.current_user_id)
        if user.role == UserRole.RIDER and rider.parent_user_id != user.id:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        
        # Update rider fields
        if 'student_name' in data:
            rider.student_name = data['student_name']
        
        if 'school' in data:
            rider.school = data['school']
        
        if 'grade' in data:
            rider.grade = data['grade']
        
        if 'date_of_birth' in data:
            rider.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        
        if 'special_needs' in data:
            rider.special_needs = data['special_needs']
        
        if 'medical_conditions' in data:
            rider.medical_conditions = data['medical_conditions']
        
        if 'emergency_contact_name' in data:
            rider.emergency_contact_name = data['emergency_contact_name']
        
        if 'emergency_contact_phone' in data:
            rider.emergency_contact_phone = data['emergency_contact_phone']
        
        if 'emergency_contact_relationship' in data:
            rider.emergency_contact_relationship = data['emergency_contact_relationship']
        
        if 'pickup_address' in data:
            rider.pickup_address = data['pickup_address']
        
        if 'dropoff_address' in data:
            rider.dropoff_address = data['dropoff_address']
        
        if 'status' in data:
            try:
                rider.status = RiderStatus(data['status'])
            except ValueError:
                return jsonify({'error': 'Invalid status'}), 400
        
        db.session.commit()
        
        return jsonify({
            'message': 'Rider profile updated successfully',
            'rider': rider.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@rider_bp.route('/<int:rider_id>', methods=['DELETE'])
@require_auth
def delete_rider(rider_id):
    """Delete a rider profile"""
    try:
        rider = Rider.query.get(rider_id)
        if not rider:
            return jsonify({'error': 'Rider not found'}), 404
        
        # Check if user has access to this rider
        user = User.find_by_id(request.current_user_id)
        if user.role == UserRole.RIDER and rider.parent_user_id != user.id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Check if rider has active bookings
        active_bookings = [booking for booking in rider.bookings if booking.status in ['pending', 'confirmed']]
        if active_bookings:
            return jsonify({'error': 'Cannot delete rider with active bookings'}), 400
        
        db.session.delete(rider)
        db.session.commit()
        
        return jsonify({'message': 'Rider profile deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@rider_bp.route('/school/<school_name>', methods=['GET'])
def get_riders_by_school(school_name):
    """Get riders by school (for drivers/admins)"""
    try:
        riders = Rider.find_by_school(school_name)
        return jsonify([rider.to_dict() for rider in riders]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@rider_bp.route('/<int:rider_id>/bookings', methods=['GET'])
@require_auth
def get_rider_bookings(rider_id):
    """Get bookings for a specific rider"""
    try:
        rider = Rider.query.get(rider_id)
        if not rider:
            return jsonify({'error': 'Rider not found'}), 404
        
        # Check if user has access to this rider
        user = User.find_by_id(request.current_user_id)
        if user.role == UserRole.RIDER and rider.parent_user_id != user.id:
            return jsonify({'error': 'Access denied'}), 403
        
        bookings = [booking.to_dict() for booking in rider.bookings]
        return jsonify(bookings), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

