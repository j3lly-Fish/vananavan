from flask import Blueprint, jsonify, request
from src.models.user import User, UserRole, db
from src.models.driver import Driver, DriverStatus
from src.routes.auth import verify_token
from datetime import datetime
import json

driver_bp = Blueprint('driver', __name__)

from functools import wraps

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
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

@driver_bp.route('/', methods=['GET'])
def get_drivers():
    """Get all active drivers"""
    try:
        drivers = Driver.find_active_drivers()
        return jsonify([driver.to_dict() for driver in drivers]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@driver_bp.route('/<int:driver_id>', methods=['GET'])
def get_driver(driver_id):
    """Get specific driver by ID"""
    try:
        driver = Driver.query.get(driver_id)
        if not driver:
            return jsonify({'error': 'Driver not found'}), 404
        
        return jsonify(driver.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@driver_bp.route('/profile', methods=['GET'])
@require_auth
def get_driver_profile():
    """Get current driver's profile"""
    try:
        user = User.find_by_id(request.current_user_id)
        if not user or user.role != UserRole.DRIVER:
            return jsonify({'error': 'Access denied'}), 403
        
        driver = Driver.find_by_user_id(user.id)
        if not driver:
            return jsonify({'error': 'Driver profile not found'}), 404
        
        return jsonify(driver.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@driver_bp.route('/profile', methods=['PUT'])
@require_auth
def update_driver_profile():
    """Update current driver's profile"""
    try:
        user = User.find_by_id(request.current_user_id)
        if not user or user.role != UserRole.DRIVER:
            return jsonify({'error': 'Access denied'}), 403
        
        driver = Driver.find_by_user_id(user.id)
        if not driver:
            return jsonify({'error': 'Driver profile not found'}), 404
        
        data = request.get_json()
        
        # Update driver fields
        if 'license_number' in data:
            driver.license_number = data['license_number']
        if 'license_expiry' in data:
            driver.license_expiry = datetime.strptime(data['license_expiry'], '%Y-%m-%d').date()
        if 'vehicle_make' in data:
            driver.vehicle_make = data['vehicle_make']
        if 'vehicle_model' in data:
            driver.vehicle_model = data['vehicle_model']
        if 'vehicle_year' in data:
            driver.vehicle_year = data['vehicle_year']
        if 'vehicle_capacity' in data:
            driver.vehicle_capacity = data['vehicle_capacity']
        if 'vehicle_plate' in data:
            driver.vehicle_plate = data['vehicle_plate']
        if 'insurance_policy' in data:
            driver.insurance_policy = data['insurance_policy']
        if 'insurance_expiry' in data:
            driver.insurance_expiry = datetime.strptime(data['insurance_expiry'], '%Y-%m-%d').date()
        if 'service_areas' in data:
            driver.service_areas = json.dumps(data['service_areas']) if isinstance(data['service_areas'], list) else data['service_areas']
        if 'bio' in data:
            driver.bio = data['bio']
        if 'profile_image' in data:
            driver.profile_image = data['profile_image']
        
        # Update user fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone' in data:
            user.phone = data['phone']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'driver': driver.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@driver_bp.route('/search', methods=['GET'])
def search_drivers():
    """Search drivers based on criteria"""
    try:
        service_area = request.args.get('service_area')
        min_rating = request.args.get('min_rating', type=float)
        max_capacity = request.args.get('max_capacity', type=int)
        
        query = Driver.query.filter_by(status=DriverStatus.ACTIVE)
        
        if service_area:
            query = query.filter(Driver.service_areas.contains(service_area))
        
        if min_rating:
            query = query.filter(Driver.rating >= min_rating)
        
        if max_capacity:
            query = query.filter(Driver.vehicle_capacity <= max_capacity)
        
        drivers = query.all()
        return jsonify([driver.to_dict() for driver in drivers]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@driver_bp.route('/stats', methods=['GET'])
@require_auth
def get_driver_stats():
    """Get current driver's statistics"""
    try:
        user = User.find_by_id(request.current_user_id)
        if not user or user.role != UserRole.DRIVER:
            return jsonify({'error': 'Access denied'}), 403
        
        driver = Driver.find_by_user_id(user.id)
        if not driver:
            return jsonify({'error': 'Driver profile not found'}), 404
        
        # Get route count
        route_count = len(driver.routes)
        
        # Get total bookings (through routes)
        total_bookings = 0
        active_bookings = 0
        for route in driver.routes:
            total_bookings += len(route.bookings)
            active_bookings += route.current_bookings
        
        stats = {
            'total_routes': route_count,
            'total_bookings': total_bookings,
            'active_bookings': active_bookings,
            'rating': driver.rating,
            'total_ratings': driver.total_ratings,
            'vehicle_capacity': driver.vehicle_capacity
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@driver_bp.route('/rating', methods=['POST'])
@require_auth
def rate_driver():
    """Rate a driver (for riders/parents)"""
    try:
        data = request.get_json()
        driver_id = data.get('driver_id')
        rating = data.get('rating')
        
        if not driver_id or not rating:
            return jsonify({'error': 'Driver ID and rating are required'}), 400
        
        if not (1 <= rating <= 5):
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        
        driver = Driver.query.get(driver_id)
        if not driver:
            return jsonify({'error': 'Driver not found'}), 404
        
        # Update driver rating
        driver.update_rating(rating)
        db.session.commit()
        
        return jsonify({
            'message': 'Rating submitted successfully',
            'new_rating': driver.rating,
            'total_ratings': driver.total_ratings
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

