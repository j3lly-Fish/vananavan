from src.models.user import db
from datetime import datetime
import enum

class MessageType(enum.Enum):
    DIRECT = "direct"
    BROADCAST = "broadcast"
    SYSTEM = "system"
    EMERGENCY = "emergency"

class MessageStatus(enum.Enum):
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"

class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'))  # Optional, for booking-related messages
    message_type = db.Column(db.Enum(MessageType), nullable=False, default=MessageType.DIRECT)
    subject = db.Column(db.String(200))
    content = db.Column(db.Text, nullable=False)
    status = db.Column(db.Enum(MessageStatus), nullable=False, default=MessageStatus.SENT)
    is_emergency = db.Column(db.Boolean, default=False)
    attachment_url = db.Column(db.String(500))  # URL to attached file
    parent_message_id = db.Column(db.Integer, db.ForeignKey('messages.id'))  # For threaded conversations
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    read_at = db.Column(db.DateTime)
    
    # Self-referential relationship for threaded messages
    replies = db.relationship('Message', backref=db.backref('parent_message', remote_side=[id]), cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Message {self.id}>'

    def to_dict(self):
        """Convert message to dictionary"""
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'recipient_id': self.recipient_id,
            'booking_id': self.booking_id,
            'message_type': self.message_type.value,
            'subject': self.subject,
            'content': self.content,
            'status': self.status.value,
            'is_emergency': self.is_emergency,
            'attachment_url': self.attachment_url,
            'parent_message_id': self.parent_message_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'sender': self.sender.to_dict() if self.sender else None,
            'recipient': self.recipient.to_dict() if self.recipient else None,
            'booking': self.booking.to_dict() if self.booking else None
        }

    def mark_as_read(self):
        """Mark message as read"""
        if self.status != MessageStatus.READ:
            self.status = MessageStatus.READ
            self.read_at = datetime.utcnow()

    def mark_as_delivered(self):
        """Mark message as delivered"""
        if self.status == MessageStatus.SENT:
            self.status = MessageStatus.DELIVERED

    @classmethod
    def find_conversation(cls, user1_id, user2_id, booking_id=None):
        """Find conversation between two users"""
        query = cls.query.filter(
            ((cls.sender_id == user1_id) & (cls.recipient_id == user2_id)) |
            ((cls.sender_id == user2_id) & (cls.recipient_id == user1_id))
        )
        
        if booking_id:
            query = query.filter_by(booking_id=booking_id)
        
        return query.order_by(cls.created_at).all()

    @classmethod
    def find_user_messages(cls, user_id):
        """Find all messages for a user (sent and received)"""
        return cls.query.filter(
            (cls.sender_id == user_id) | (cls.recipient_id == user_id)
        ).order_by(cls.created_at.desc()).all()

    @classmethod
    def find_unread_messages(cls, user_id):
        """Find unread messages for a user"""
        return cls.query.filter(
            cls.recipient_id == user_id,
            cls.status != MessageStatus.READ
        ).order_by(cls.created_at.desc()).all()

    @classmethod
    def find_emergency_messages(cls, user_id=None):
        """Find emergency messages"""
        query = cls.query.filter_by(is_emergency=True)
        if user_id:
            query = query.filter(
                (cls.sender_id == user_id) | (cls.recipient_id == user_id)
            )
        return query.order_by(cls.created_at.desc()).all()

