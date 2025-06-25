from flask import Blueprint, jsonify, request
from src.models.user import User, UserRole, db
from src.models.rider import Rider
from src.models.route import Route
from src.models.booking import Booking, BookingStatus, BookingType
from src.models.driver import Driver
from src.routes.auth import verify_token
from datetime import datetime, time
from decimal import Decimal

booking_bp = Blueprint('booking', __name__)

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

@booking_bp.route('/', methods=['GET'])
@require_auth
def get_my_bookings():
    """Get current user's bookings"""
    try:
        user = User.find_by_id(request.current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        bookings = []
        
        if user.role == UserRole.RIDER:
            # Get bookings for all riders under this parent
            riders = Rider.find_by_parent(user.id)
            for rider in riders:
                bookings.extend(rider.bookings)
        
        elif user.role == UserRole.DRIVER:
            # Get bookings for all routes owned by this driver
            driver = Driver.find_by_user_id(user.id)
            if driver:
                bookings = Booking.find_by_driver(driver.id)
        
        return jsonify([booking.to_dict() for booking in bookings]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/<int:booking_id>', methods=['GET'])
@require_auth
def get_booking(booking_id):
    """Get specific booking by ID"""
    try:
        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        # Check if user has access to this booking
        user = User.find_by_id(request.current_user_id)
        has_access = False
        
        if user.role == UserRole.RIDER:
            # Check if booking belongs to user's rider
            has_access = booking.rider.parent_user_id == user.id
        elif user.role == UserRole.DRIVER:
            # Check if booking is for driver's route
            driver = Driver.find_by_user_id(user.id)
            has_access = driver and booking.route.driver_id == driver.id
        elif user.role == UserRole.ADMIN:
            has_access = True
        
        if not has_access:
            return jsonify({'error': 'Access denied'}), 403
        
        return jsonify(booking.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/', methods=['POST'])
@require_auth
def create_booking():
    """Create a new booking"""
    try:
        user = User.find_by_id(request.current_user_id)
        if not user or user.role != UserRole.RIDER:
            return jsonify({'error': 'Access denied - riders only'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['rider_id', 'route_id', 'start_date', 'booking_type']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Verify rider belongs to user
        rider = Rider.query.get(data['rider_id'])
        if not rider or rider.parent_user_id != user.id:
            return jsonify({'error': 'Invalid rider'}), 400
        
        # Verify route exists and is available
        route = Route.query.get(data['route_id'])
        if not route:
            return jsonify({'error': 'Route not found'}), 404
        
        if not route.is_available():
            return jsonify({'error': 'Route is not available'}), 400
        
        # Validate booking type
        try:
            booking_type = BookingType(data['booking_type'])
        except ValueError:
            return jsonify({'error': 'Invalid booking type'}), 400
        
        # Calculate total amount based on booking type
        total_amount = Decimal('0.00')
        if booking_type == BookingType.DAILY and route.price_per_day:
            total_amount = route.price_per_day
        elif booking_type == BookingType.WEEKLY and route.price_per_week:
            total_amount = route.price_per_week
        elif booking_type == BookingType.MONTHLY and route.price_per_month:
            total_amount = route.price_per_month
        
        # Create new booking
        booking = Booking(
            rider_id=data['rider_id'],
            route_id=data['route_id'],
            booking_type=booking_type,
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
            total_amount=total_amount
        )
        
        # Set optional fields
        if 'end_date' in data:
            booking.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        
        if 'pickup_time' in data:
            booking.pickup_time = datetime.strptime(data['pickup_time'], '%H:%M').time()
        
        if 'dropoff_time' in data:
            booking.dropoff_time = datetime.strptime(data['dropoff_time'], '%H:%M').time()
        
        if 'pickup_location' in data:
            booking.pickup_location = data['pickup_location']
        
        if 'dropoff_location' in data:
            booking.dropoff_location = data['dropoff_location']
        
        if 'special_instructions' in data:
            booking.special_instructions = data['special_instructions']
        
        # Add booking to route
        if route.add_booking():
            db.session.add(booking)
            db.session.commit()
            
            return jsonify({
                'message': 'Booking created successfully',
                'booking': booking.to_dict()
            }), 201
        else:
            return jsonify({'error': 'Route is full'}), 400
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/<int:booking_id>', methods=['PUT'])
@require_auth
def update_booking(booking_id):
    """Update a booking"""
    try:
        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        # Check if user has access to this booking
        user = User.find_by_id(request.current_user_id)
        has_access = False
        
        if user.role == UserRole.RIDER:
            has_access = booking.rider.parent_user_id == user.id
        elif user.role == UserRole.DRIVER:
            driver = Driver.find_by_user_id(user.id)
            has_access = driver and booking.route.driver_id == driver.id
        elif user.role == UserRole.ADMIN:
            has_access = True
        
        if not has_access:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        
        # Update booking fields
        if 'pickup_time' in data:
            booking.pickup_time = datetime.strptime(data['pickup_time'], '%H:%M').time()
        
        if 'dropoff_time' in data:
            booking.dropoff_time = datetime.strptime(data['dropoff_time'], '%H:%M').time()
        
        if 'pickup_location' in data:
            booking.pickup_location = data['pickup_location']
        
        if 'dropoff_location' in data:
            booking.dropoff_location = data['dropoff_location']
        
        if 'special_instructions' in data:
            booking.special_instructions = data['special_instructions']
        
        if 'notes' in data:
            booking.notes = data['notes']
        
        # Only allow status changes by drivers or admins
        if 'status' in data and user.role in [UserRole.DRIVER, UserRole.ADMIN]:
            try:
                new_status = BookingStatus(data['status'])
                booking.status = new_status
            except ValueError:
                return jsonify({'error': 'Invalid status'}), 400
        
        db.session.commit()
        
        return jsonify({
            'message': 'Booking updated successfully',
            'booking': booking.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/<int:booking_id>/confirm', methods=['POST'])
@require_auth
def confirm_booking(booking_id):
    """Confirm a booking (drivers only)"""
    try:
        user = User.find_by_id(request.current_user_id)
        if not user or user.role != UserRole.DRIVER:
            return jsonify({'error': 'Access denied - drivers only'}), 403
        
        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        # Check if booking is for driver's route
        driver = Driver.find_by_user_id(user.id)
        if not driver or booking.route.driver_id != driver.id:
            return jsonify({'error': 'Access denied'}), 403
        
        if booking.confirm_booking():
            db.session.commit()
            return jsonify({
                'message': 'Booking confirmed successfully',
                'booking': booking.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Cannot confirm booking'}), 400
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/<int:booking_id>/cancel', methods=['POST'])
@require_auth
def cancel_booking(booking_id):
    """Cancel a booking"""
    try:
        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        # Check if user has access to this booking
        user = User.find_by_id(request.current_user_id)
        has_access = False
        
        if user.role == UserRole.RIDER:
            has_access = booking.rider.parent_user_id == user.id
        elif user.role == UserRole.DRIVER:
            driver = Driver.find_by_user_id(user.id)
            has_access = driver and booking.route.driver_id == driver.id
        elif user.role == UserRole.ADMIN:
            has_access = True
        
        if not has_access:
            return jsonify({'error': 'Access denied'}), 403
        
        if booking.cancel_booking():
            # Remove booking from route count
            booking.route.remove_booking()
            db.session.commit()
            
            return jsonify({
                'message': 'Booking cancelled successfully',
                'booking': booking.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Cannot cancel booking'}), 400
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/<int:booking_id>/complete', methods=['POST'])
@require_auth
def complete_booking(booking_id):
    """Mark booking as completed (drivers only)"""
    try:
        user = User.find_by_id(request.current_user_id)
        if not user or user.role != UserRole.DRIVER:
            return jsonify({'error': 'Access denied - drivers only'}), 403
        
        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        # Check if booking is for driver's route
        driver = Driver.find_by_user_id(user.id)
        if not driver or booking.route.driver_id != driver.id:
            return jsonify({'error': 'Access denied'}), 403
        
        if booking.complete_booking():
            db.session.commit()
            return jsonify({
                'message': 'Booking completed successfully',
                'booking': booking.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Cannot complete booking'}), 400
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/route/<int:route_id>', methods=['GET'])
@require_auth
def get_route_bookings(route_id):
    """Get all bookings for a specific route"""
    try:
        user = User.find_by_id(request.current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        route = Route.query.get(route_id)
        if not route:
            return jsonify({'error': 'Route not found'}), 404
        
        # Check access permissions
        has_access = False
        if user.role == UserRole.DRIVER:
            driver = Driver.find_by_user_id(user.id)
            has_access = driver and route.driver_id == driver.id
        elif user.role == UserRole.ADMIN:
            has_access = True
        
        if not has_access:
            return jsonify({'error': 'Access denied'}), 403
        
        bookings = Booking.find_by_route(route_id)
        return jsonify([booking.to_dict() for booking in bookings]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

