from flask import Blueprint, jsonify, request
from src.models.user import User, UserRole, db
from src.models.message import Message, MessageType, MessageStatus
from src.models.booking import Booking
from src.models.driver import Driver
from src.routes.auth import verify_token

message_bp = Blueprint('message', __name__)

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

@message_bp.route('/', methods=['GET'])
@require_auth
def get_my_messages():
    """Get current user's messages"""
    try:
        user = User.find_by_id(request.current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        messages = Message.find_user_messages(user.id)
        return jsonify([message.to_dict() for message in messages]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@message_bp.route('/unread', methods=['GET'])
@require_auth
def get_unread_messages():
    """Get current user's unread messages"""
    try:
        user = User.find_by_id(request.current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        messages = Message.find_unread_messages(user.id)
        return jsonify([message.to_dict() for message in messages]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@message_bp.route('/conversation/<int:other_user_id>', methods=['GET'])
@require_auth
def get_conversation(other_user_id):
    """Get conversation between current user and another user"""
    try:
        user = User.find_by_id(request.current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        other_user = User.find_by_id(other_user_id)
        if not other_user:
            return jsonify({'error': 'Other user not found'}), 404
        
        booking_id = request.args.get('booking_id', type=int)
        
        messages = Message.find_conversation(user.id, other_user_id, booking_id)
        return jsonify([message.to_dict() for message in messages]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@message_bp.route('/', methods=['POST'])
@require_auth
def send_message():
    """Send a new message"""
    try:
        user = User.find_by_id(request.current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['recipient_id', 'content']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Verify recipient exists
        recipient = User.find_by_id(data['recipient_id'])
        if not recipient:
            return jsonify({'error': 'Recipient not found'}), 404
        
        # Validate message type
        message_type = MessageType.DIRECT
        if 'message_type' in data:
            try:
                message_type = MessageType(data['message_type'])
            except ValueError:
                return jsonify({'error': 'Invalid message type'}), 400
        
        # Validate booking if provided
        booking_id = data.get('booking_id')
        if booking_id:
            booking = Booking.query.get(booking_id)
            if not booking:
                return jsonify({'error': 'Booking not found'}), 404
            
            # Check if user has access to this booking
            has_access = False
            if user.role == UserRole.RIDER:
                has_access = booking.rider.parent_user_id == user.id
            elif user.role == UserRole.DRIVER:
                driver = Driver.find_by_user_id(user.id)
                has_access = driver and booking.route.driver_id == driver.id
            
            if not has_access:
                return jsonify({'error': 'Access denied to booking'}), 403
        
        # Create new message
        message = Message(
            sender_id=user.id,
            recipient_id=data['recipient_id'],
            content=data['content'],
            message_type=message_type
        )
        
        # Set optional fields
        if 'subject' in data:
            message.subject = data['subject']
        
        if booking_id:
            message.booking_id = booking_id
        
        if 'is_emergency' in data:
            message.is_emergency = data['is_emergency']
            if message.is_emergency:
                message.message_type = MessageType.EMERGENCY
        
        if 'attachment_url' in data:
            message.attachment_url = data['attachment_url']
        
        if 'parent_message_id' in data:
            parent_message = Message.query.get(data['parent_message_id'])
            if parent_message:
                message.parent_message_id = data['parent_message_id']
        
        db.session.add(message)
        db.session.commit()
        
        return jsonify({
            'message': 'Message sent successfully',
            'message_data': message.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@message_bp.route('/<int:message_id>/read', methods=['POST'])
@require_auth
def mark_message_read(message_id):
    """Mark a message as read"""
    try:
        user = User.find_by_id(request.current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        message = Message.query.get(message_id)
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        # Check if user is the recipient
        if message.recipient_id != user.id:
            return jsonify({'error': 'Access denied'}), 403
        
        message.mark_as_read()
        db.session.commit()
        
        return jsonify({
            'message': 'Message marked as read',
            'message_data': message.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@message_bp.route('/broadcast', methods=['POST'])
@require_auth
def send_broadcast_message():
    """Send a broadcast message to multiple recipients (drivers only)"""
    try:
        user = User.find_by_id(request.current_user_id)
        if not user or user.role != UserRole.DRIVER:
            return jsonify({'error': 'Access denied - drivers only'}), 403
        
        driver = Driver.find_by_user_id(user.id)
        if not driver:
            return jsonify({'error': 'Driver profile not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['content', 'route_id']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Verify route belongs to driver
        from src.models.route import Route
        route = Route.query.get(data['route_id'])
        if not route or route.driver_id != driver.id:
            return jsonify({'error': 'Access denied to route'}), 403
        
        # Get all riders for this route
        recipients = []
        for booking in route.bookings:
            if booking.status in ['pending', 'confirmed'] and booking.rider.parent_user:
                recipients.append(booking.rider.parent_user)
        
        if not recipients:
            return jsonify({'error': 'No active riders found for this route'}), 400
        
        # Create broadcast messages
        messages_created = 0
        for recipient in recipients:
            message = Message(
                sender_id=user.id,
                recipient_id=recipient.id,
                content=data['content'],
                message_type=MessageType.BROADCAST
            )
            
            if 'subject' in data:
                message.subject = data['subject']
            
            if 'is_emergency' in data and data['is_emergency']:
                message.is_emergency = True
                message.message_type = MessageType.EMERGENCY
            
            db.session.add(message)
            messages_created += 1
        
        db.session.commit()
        
        return jsonify({
            'message': f'Broadcast message sent to {messages_created} recipients',
            'recipients_count': messages_created
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@message_bp.route('/emergency', methods=['GET'])
@require_auth
def get_emergency_messages():
    """Get emergency messages"""
    try:
        user = User.find_by_id(request.current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        messages = Message.find_emergency_messages(user.id)
        return jsonify([message.to_dict() for message in messages]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@message_bp.route('/<int:message_id>', methods=['DELETE'])
@require_auth
def delete_message(message_id):
    """Delete a message (sender only)"""
    try:
        user = User.find_by_id(request.current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        message = Message.query.get(message_id)
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        # Check if user is the sender
        if message.sender_id != user.id:
            return jsonify({'error': 'Access denied'}), 403
        
        db.session.delete(message)
        db.session.commit()
        
        return jsonify({'message': 'Message deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

