from src.models.user import db
from datetime import datetime
import enum

class BookingStatus(enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class BookingType(enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    rider_id = db.Column(db.Integer, db.ForeignKey('riders.id'), nullable=False)
    route_id = db.Column(db.Integer, db.ForeignKey('routes.id'), nullable=False)
    booking_type = db.Column(db.Enum(BookingType), nullable=False, default=BookingType.DAILY)
    status = db.Column(db.Enum(BookingStatus), nullable=False, default=BookingStatus.PENDING)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    pickup_time = db.Column(db.Time)
    dropoff_time = db.Column(db.Time)
    pickup_location = db.Column(db.Text)
    dropoff_location = db.Column(db.Text)
    special_instructions = db.Column(db.Text)
    total_amount = db.Column(db.Numeric(10, 2))
    payment_status = db.Column(db.String(20), default='pending')
    payment_id = db.Column(db.String(100))  # External payment processor ID
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    messages = db.relationship('Message', backref='booking', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Booking {self.id}>'

    def to_dict(self):
        """Convert booking to dictionary"""
        return {
            'id': self.id,
            'rider_id': self.rider_id,
            'route_id': self.route_id,
            'booking_type': self.booking_type.value,
            'status': self.status.value,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'pickup_time': self.pickup_time.strftime('%H:%M') if self.pickup_time else None,
            'dropoff_time': self.dropoff_time.strftime('%H:%M') if self.dropoff_time else None,
            'pickup_location': self.pickup_location,
            'dropoff_location': self.dropoff_location,
            'special_instructions': self.special_instructions,
            'total_amount': float(self.total_amount) if self.total_amount else None,
            'payment_status': self.payment_status,
            'payment_id': self.payment_id,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'rider': self.rider.to_dict() if self.rider else None,
            'route': self.route.to_dict() if self.route else None
        }

    def confirm_booking(self):
        """Confirm the booking"""
        if self.status == BookingStatus.PENDING:
            self.status = BookingStatus.CONFIRMED
            return True
        return False

    def cancel_booking(self):
        """Cancel the booking"""
        if self.status in [BookingStatus.PENDING, BookingStatus.CONFIRMED]:
            self.status = BookingStatus.CANCELLED
            return True
        return False

    def complete_booking(self):
        """Mark booking as completed"""
        if self.status == BookingStatus.CONFIRMED:
            self.status = BookingStatus.COMPLETED
            return True
        return False

    @classmethod
    def find_by_rider(cls, rider_id):
        """Find bookings by rider ID"""
        return cls.query.filter_by(rider_id=rider_id).all()

    @classmethod
    def find_by_route(cls, route_id):
        """Find bookings by route ID"""
        return cls.query.filter_by(route_id=route_id).all()

    @classmethod
    def find_by_driver(cls, driver_id):
        """Find bookings by driver ID through route relationship"""
        from src.models.route import Route
        return cls.query.join(Route).filter(Route.driver_id == driver_id).all()

    @classmethod
    def find_active_bookings(cls):
        """Find all active bookings"""
        return cls.query.filter(
            cls.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED])
        ).all()

