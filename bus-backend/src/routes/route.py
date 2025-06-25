from flask import Blueprint, jsonify, request
from src.models.user import User, UserRole, db
from src.models.driver import Driver
from src.models.route import Route, RouteStatus
from src.routes.auth import verify_token
from decimal import Decimal
import json

route_bp = Blueprint('route', __name__)

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

@route_bp.route('/', methods=['GET'])
def get_routes():
    """Get all available routes"""
    try:
        routes = Route.find_available_routes()
        return jsonify([route.to_dict() for route in routes]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@route_bp.route('/<int:route_id>', methods=['GET'])
def get_route(route_id):
    """Get specific route by ID"""
    try:
        route = Route.query.get(route_id)
        if not route:
            return jsonify({'error': 'Route not found'}), 404
        
        return jsonify(route.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@route_bp.route('/driver/<int:driver_id>', methods=['GET'])
def get_driver_routes(driver_id):
    """Get all routes for a specific driver"""
    try:
        routes = Route.find_by_driver(driver_id)
        return jsonify([route.to_dict() for route in routes]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@route_bp.route('/my-routes', methods=['GET'])
@require_auth
def get_my_routes():
    """Get current driver's routes"""
    try:
        user = User.find_by_id(request.current_user_id)
        if not user or user.role != UserRole.DRIVER:
            return jsonify({'error': 'Access denied'}), 403
        
        driver = Driver.find_by_user_id(user.id)
        if not driver:
            return jsonify({'error': 'Driver profile not found'}), 404
        
        routes = Route.find_by_driver(driver.id)
        return jsonify([route.to_dict() for route in routes]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@route_bp.route('/', methods=['POST'])
@require_auth
def create_route():
    """Create a new route (drivers only)"""
    try:
        user = User.find_by_id(request.current_user_id)
        if not user or user.role != UserRole.DRIVER:
            return jsonify({'error': 'Access denied'}), 403
        
        driver = Driver.find_by_user_id(user.id)
        if not driver:
            return jsonify({'error': 'Driver profile not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['route_name', 'capacity']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create new route
        route = Route(
            driver_id=driver.id,
            route_name=data['route_name'],
            description=data.get('description', ''),
            capacity=data['capacity']
        )
        
        # Set optional fields
        if 'pickup_locations' in data:
            route.pickup_locations = json.dumps(data['pickup_locations']) if isinstance(data['pickup_locations'], list) else data['pickup_locations']
        
        if 'dropoff_locations' in data:
            route.dropoff_locations = json.dumps(data['dropoff_locations']) if isinstance(data['dropoff_locations'], list) else data['dropoff_locations']
        
        if 'schedule' in data:
            route.schedule = json.dumps(data['schedule']) if isinstance(data['schedule'], dict) else data['schedule']
        
        if 'price_per_day' in data:
            route.price_per_day = Decimal(str(data['price_per_day']))
        
        if 'price_per_week' in data:
            route.price_per_week = Decimal(str(data['price_per_week']))
        
        if 'price_per_month' in data:
            route.price_per_month = Decimal(str(data['price_per_month']))
        
        if 'special_requirements' in data:
            route.special_requirements = data['special_requirements']
        
        db.session.add(route)
        db.session.commit()
        
        return jsonify({
            'message': 'Route created successfully',
            'route': route.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@route_bp.route('/<int:route_id>', methods=['PUT'])
@require_auth
def update_route(route_id):
    """Update a route (route owner only)"""
    try:
        user = User.find_by_id(request.current_user_id)
        if not user or user.role != UserRole.DRIVER:
            return jsonify({'error': 'Access denied'}), 403
        
        driver = Driver.find_by_user_id(user.id)
        if not driver:
            return jsonify({'error': 'Driver profile not found'}), 404
        
        route = Route.query.get(route_id)
        if not route:
            return jsonify({'error': 'Route not found'}), 404
        
        if route.driver_id != driver.id:
            return jsonify({'error': 'Access denied - not route owner'}), 403
        
        data = request.get_json()
        
        # Update route fields
        if 'route_name' in data:
            route.route_name = data['route_name']
        
        if 'description' in data:
            route.description = data['description']
        
        if 'pickup_locations' in data:
            route.pickup_locations = json.dumps(data['pickup_locations']) if isinstance(data['pickup_locations'], list) else data['pickup_locations']
        
        if 'dropoff_locations' in data:
            route.dropoff_locations = json.dumps(data['dropoff_locations']) if isinstance(data['dropoff_locations'], list) else data['dropoff_locations']
        
        if 'schedule' in data:
            route.schedule = json.dumps(data['schedule']) if isinstance(data['schedule'], dict) else data['schedule']
        
        if 'price_per_day' in data:
            route.price_per_day = Decimal(str(data['price_per_day']))
        
        if 'price_per_week' in data:
            route.price_per_week = Decimal(str(data['price_per_week']))
        
        if 'price_per_month' in data:
            route.price_per_month = Decimal(str(data['price_per_month']))
        
        if 'capacity' in data:
            route.capacity = data['capacity']
        
        if 'special_requirements' in data:
            route.special_requirements = data['special_requirements']
        
        if 'status' in data:
            try:
                route.status = RouteStatus(data['status'])
            except ValueError:
                return jsonify({'error': 'Invalid status'}), 400
        
        db.session.commit()
        
        return jsonify({
            'message': 'Route updated successfully',
            'route': route.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@route_bp.route('/<int:route_id>', methods=['DELETE'])
@require_auth
def delete_route(route_id):
    """Delete a route (route owner only)"""
    try:
        user = User.find_by_id(request.current_user_id)
        if not user or user.role != UserRole.DRIVER:
            return jsonify({'error': 'Access denied'}), 403
        
        driver = Driver.find_by_user_id(user.id)
        if not driver:
            return jsonify({'error': 'Driver profile not found'}), 404
        
        route = Route.query.get(route_id)
        if not route:
            return jsonify({'error': 'Route not found'}), 404
        
        if route.driver_id != driver.id:
            return jsonify({'error': 'Access denied - not route owner'}), 403
        
        # Check if route has active bookings
        if route.current_bookings > 0:
            return jsonify({'error': 'Cannot delete route with active bookings'}), 400
        
        db.session.delete(route)
        db.session.commit()
        
        return jsonify({'message': 'Route deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@route_bp.route('/search', methods=['GET'])
def search_routes():
    """Search routes based on criteria"""
    try:
        pickup_area = request.args.get('pickup_area')
        dropoff_area = request.args.get('dropoff_area')
        max_price = request.args.get('max_price', type=float)
        
        search_params = {}
        if pickup_area:
            search_params['pickup_area'] = pickup_area
        if dropoff_area:
            search_params['dropoff_area'] = dropoff_area
        if max_price:
            search_params['max_price'] = max_price
        
        routes = Route.search_routes(search_params)
        return jsonify([route.to_dict() for route in routes]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@route_bp.route('/<int:route_id>/availability', methods=['GET'])
def check_route_availability(route_id):
    """Check if route has available spots"""
    try:
        route = Route.query.get(route_id)
        if not route:
            return jsonify({'error': 'Route not found'}), 404
        
        return jsonify({
            'available': route.is_available(),
            'capacity': route.capacity,
            'current_bookings': route.current_bookings,
            'available_spots': route.capacity - route.current_bookings,
            'status': route.status.value
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

