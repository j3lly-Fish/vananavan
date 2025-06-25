from flask import Blueprint, jsonify, request
from src.models.user import User, UserRole, UserStatus, db
from src.models.driver import Driver
from src.models.rider import Rider
from src.models.booking import Booking, BookingStatus
from src.models.route import Route
from src.models.subscription import Subscription
from src.models.payment import Payment
from src.routes.auth import verify_token
from datetime import datetime, timedelta
from sqlalchemy import func

admin_bp = Blueprint('admin', __name__)

def require_admin(f):
    """Decorator to require admin authentication"""
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Authorization header required'}), 401
        
        try:
            token = auth_header.split(' ')[1]  # Bearer <token>
            user_id = verify_token(token)
            if not user_id:
                return jsonify({'error': 'Invalid token'}), 401
            
            user = User.find_by_id(user_id)
            if not user or user.role != UserRole.ADMIN:
                return jsonify({'error': 'Admin access required'}), 403
            
            request.current_user_id = user_id
            return f(*args, **kwargs)
        except:
            return jsonify({'error': 'Invalid authorization header'}), 401
    
    decorated_function.__name__ = f.__name__
    return decorated_function

@admin_bp.route('/dashboard', methods=['GET'])
@require_admin
def get_dashboard_stats():
    """Get admin dashboard statistics"""
    try:
        # User statistics
        total_users = User.query.count()
        active_users = User.query.filter_by(status=UserStatus.ACTIVE).count()
        total_drivers = User.query.filter_by(role=UserRole.DRIVER).count()
        total_riders_parents = User.query.filter_by(role=UserRole.RIDER).count()
        
        # Driver statistics
        active_drivers = Driver.query.filter_by(status='active').count()
        total_routes = Route.query.count()
        active_routes = Route.query.filter_by(status='active').count()
        
        # Booking statistics
        total_bookings = Booking.query.count()
        active_bookings = Booking.query.filter(
            Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED])
        ).count()
        completed_bookings = Booking.query.filter_by(status='completed').count()
        
        # Revenue statistics (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_revenue = Payment.calculate_revenue(start_date=thirty_days_ago)
        total_revenue = Payment.calculate_revenue()
        
        # Subscription statistics
        active_subscriptions = Subscription.query.filter_by(status='active').count()
        
        stats = {
            'users': {
                'total': total_users,
                'active': active_users,
                'drivers': total_drivers,
                'riders_parents': total_riders_parents
            },
            'drivers': {
                'total': total_drivers,
                'active': active_drivers
            },
            'routes': {
                'total': total_routes,
                'active': active_routes
            },
            'bookings': {
                'total': total_bookings,
                'active': active_bookings,
                'completed': completed_bookings
            },
            'revenue': {
                'last_30_days': recent_revenue,
                'total': total_revenue
            },
            'subscriptions': {
                'active': active_subscriptions
            }
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@require_admin
def get_all_users():
    """Get all users with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        role_filter = request.args.get('role')
        status_filter = request.args.get('status')
        search = request.args.get('search')
        
        query = User.query
        
        if role_filter:
            try:
                role = UserRole(role_filter)
                query = query.filter_by(role=role)
            except ValueError:
                return jsonify({'error': 'Invalid role filter'}), 400
        
        if status_filter:
            try:
                status = UserStatus(status_filter)
                query = query.filter_by(status=status)
            except ValueError:
                return jsonify({'error': 'Invalid status filter'}), 400
        
        if search:
            query = query.filter(
                (User.first_name.contains(search)) |
                (User.last_name.contains(search)) |
                (User.email.contains(search))
            )
        
        users = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'users': [user.to_dict() for user in users.items],
            'pagination': {
                'page': page,
                'pages': users.pages,
                'per_page': per_page,
                'total': users.total,
                'has_next': users.has_next,
                'has_prev': users.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@require_admin
def get_user_details(user_id):
    """Get detailed user information"""
    try:
        user = User.find_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user_data = user.to_dict()
        
        # Add role-specific data
        if user.role == UserRole.DRIVER and user.driver_profile:
            user_data['driver_profile'] = user.driver_profile.to_dict()
            user_data['routes'] = [route.to_dict() for route in user.driver_profile.routes]
        
        if user.role == UserRole.RIDER:
            user_data['rider_profiles'] = [rider.to_dict() for rider in user.rider_profiles]
        
        # Add subscription data
        if user.subscription:
            user_data['subscription'] = user.subscription.to_dict()
        
        return jsonify(user_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@require_admin
def update_user(user_id):
    """Update user information"""
    try:
        user = User.find_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update user fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        
        if 'last_name' in data:
            user.last_name = data['last_name']
        
        if 'phone' in data:
            user.phone = data['phone']
        
        if 'status' in data:
            try:
                user.status = UserStatus(data['status'])
            except ValueError:
                return jsonify({'error': 'Invalid status'}), 400
        
        if 'email_verified' in data:
            user.email_verified = data['email_verified']
        
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/password-reset', methods=['POST'])
@require_admin
def admin_reset_password(user_id):
    """Reset user password (admin only)"""
    try:
        user = User.find_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        new_password = data.get('password')
        
        if not new_password:
            return jsonify({'error': 'New password is required'}), 400
        
        user.set_password(new_password)
        user.reset_token = None
        user.reset_token_expires = None
        
        db.session.commit()
        
        return jsonify({'message': 'Password reset successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/bookings', methods=['GET'])
@require_admin
def get_all_bookings():
    """Get all bookings with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status_filter = request.args.get('status')
        
        query = Booking.query
        
        if status_filter:
            query = query.filter_by(status=status_filter)
        
        bookings = query.order_by(Booking.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'bookings': [booking.to_dict() for booking in bookings.items],
            'pagination': {
                'page': page,
                'pages': bookings.pages,
                'per_page': per_page,
                'total': bookings.total,
                'has_next': bookings.has_next,
                'has_prev': bookings.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/payments', methods=['GET'])
@require_admin
def get_all_payments():
    """Get all payments with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status_filter = request.args.get('status')
        
        query = Payment.query
        
        if status_filter:
            query = query.filter_by(status=status_filter)
        
        payments = query.order_by(Payment.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'payments': [payment.to_dict() for payment in payments.items],
            'pagination': {
                'page': page,
                'pages': payments.pages,
                'per_page': per_page,
                'total': payments.total,
                'has_next': payments.has_next,
                'has_prev': payments.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/subscriptions', methods=['GET'])
@require_admin
def get_all_subscriptions():
    """Get all subscriptions with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status_filter = request.args.get('status')
        
        query = Subscription.query
        
        if status_filter:
            query = query.filter_by(status=status_filter)
        
        subscriptions = query.order_by(Subscription.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'subscriptions': [sub.to_dict() for sub in subscriptions.items],
            'pagination': {
                'page': page,
                'pages': subscriptions.pages,
                'per_page': per_page,
                'total': subscriptions.total,
                'has_next': subscriptions.has_next,
                'has_prev': subscriptions.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/reports/revenue', methods=['GET'])
@require_admin
def get_revenue_report():
    """Get revenue report"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        start_dt = None
        end_dt = None
        
        if start_date:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        
        if end_date:
            end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        
        # Get successful payments within date range
        payments = Payment.find_successful_payments(start_dt, end_dt)
        total_revenue = Payment.calculate_revenue(start_dt, end_dt)
        
        # Group by month for chart data
        monthly_revenue = {}
        for payment in payments:
            month_key = payment.created_at.strftime('%Y-%m')
            if month_key not in monthly_revenue:
                monthly_revenue[month_key] = 0
            monthly_revenue[month_key] += float(payment.amount)
        
        return jsonify({
            'total_revenue': total_revenue,
            'total_payments': len(payments),
            'monthly_revenue': monthly_revenue,
            'payments': [payment.to_dict() for payment in payments[:100]]  # Limit to 100 for performance
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/system/cleanup', methods=['POST'])
@require_admin
def system_cleanup():
    """Perform system cleanup tasks"""
    try:
        # Clean up expired reset tokens
        expired_tokens = User.query.filter(
            User.reset_token_expires < datetime.utcnow()
        ).all()
        
        for user in expired_tokens:
            user.reset_token = None
            user.reset_token_expires = None
        
        # Clean up old unverified accounts (older than 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        unverified_users = User.query.filter(
            User.email_verified == False,
            User.created_at < thirty_days_ago
        ).all()
        
        cleaned_tokens = len(expired_tokens)
        cleaned_users = len(unverified_users)
        
        for user in unverified_users:
            db.session.delete(user)
        
        db.session.commit()
        
        return jsonify({
            'message': 'System cleanup completed',
            'expired_tokens_cleaned': cleaned_tokens,
            'unverified_users_cleaned': cleaned_users
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

