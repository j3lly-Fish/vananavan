from src.models.user import db
from datetime import datetime
import enum

class PaymentStatus(enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class PaymentType(enum.Enum):
    SUBSCRIPTION = "subscription"
    BOOKING = "booking"
    ONE_TIME = "one_time"

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    subscription_id = db.Column(db.Integer, db.ForeignKey('subscriptions.id'))
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    payment_type = db.Column(db.Enum(PaymentType), nullable=False)
    status = db.Column(db.Enum(PaymentStatus), nullable=False, default=PaymentStatus.PENDING)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(3), default='USD')
    stripe_payment_intent_id = db.Column(db.String(100))  # Stripe Payment Intent ID
    stripe_charge_id = db.Column(db.String(100))  # Stripe Charge ID
    payment_method = db.Column(db.String(50))  # card, bank_transfer, etc.
    description = db.Column(db.String(500))
    payment_metadata = db.Column(db.Text)  # JSON string for additional data
    failure_reason = db.Column(db.String(500))
    refund_amount = db.Column(db.Numeric(10, 2), default=0.00)
    refund_reason = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    processed_at = db.Column(db.DateTime)

    def __repr__(self):
        return f'<Payment {self.id}>'

    def to_dict(self):
        """Convert payment to dictionary"""
        return {
            'id': self.id,
            'subscription_id': self.subscription_id,
            'booking_id': self.booking_id,
            'user_id': self.user_id,
            'payment_type': self.payment_type.value,
            'status': self.status.value,
            'amount': float(self.amount) if self.amount else None,
            'currency': self.currency,
            'stripe_payment_intent_id': self.stripe_payment_intent_id,
            'stripe_charge_id': self.stripe_charge_id,
            'payment_method': self.payment_method,
            'description': self.description,
            'payment_metadata': self.payment_metadata,
            'failure_reason': self.failure_reason,
            'refund_amount': float(self.refund_amount) if self.refund_amount else None,
            'refund_reason': self.refund_reason,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'user': self.user.to_dict() if self.user else None
        }

    def mark_as_succeeded(self):
        """Mark payment as succeeded"""
        self.status = PaymentStatus.SUCCEEDED
        self.processed_at = datetime.utcnow()

    def mark_as_failed(self, reason=None):
        """Mark payment as failed"""
        self.status = PaymentStatus.FAILED
        self.failure_reason = reason
        self.processed_at = datetime.utcnow()

    def process_refund(self, amount, reason=None):
        """Process a refund for this payment"""
        if self.status == PaymentStatus.SUCCEEDED:
            refund_amount = min(amount, self.amount - self.refund_amount)
            self.refund_amount += refund_amount
            self.refund_reason = reason
            
            if self.refund_amount >= self.amount:
                self.status = PaymentStatus.REFUNDED
            
            return refund_amount
        return 0

    @classmethod
    def find_by_user(cls, user_id):
        """Find payments by user ID"""
        return cls.query.filter_by(user_id=user_id).order_by(cls.created_at.desc()).all()

    @classmethod
    def find_by_subscription(cls, subscription_id):
        """Find payments by subscription ID"""
        return cls.query.filter_by(subscription_id=subscription_id).order_by(cls.created_at.desc()).all()

    @classmethod
    def find_by_booking(cls, booking_id):
        """Find payments by booking ID"""
        return cls.query.filter_by(booking_id=booking_id).order_by(cls.created_at.desc()).all()

    @classmethod
    def find_successful_payments(cls, start_date=None, end_date=None):
        """Find successful payments within date range"""
        query = cls.query.filter_by(status=PaymentStatus.SUCCEEDED)
        
        if start_date:
            query = query.filter(cls.created_at >= start_date)
        if end_date:
            query = query.filter(cls.created_at <= end_date)
        
        return query.order_by(cls.created_at.desc()).all()

    @classmethod
    def calculate_revenue(cls, start_date=None, end_date=None):
        """Calculate total revenue within date range"""
        query = cls.query.filter_by(status=PaymentStatus.SUCCEEDED)
        
        if start_date:
            query = query.filter(cls.created_at >= start_date)
        if end_date:
            query = query.filter(cls.created_at <= end_date)
        
        total = query.with_entities(db.func.sum(cls.amount)).scalar()
        return float(total) if total else 0.0

