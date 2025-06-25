from src.models.user import db
from datetime import datetime, timedelta
import enum

class SubscriptionPlan(enum.Enum):
    BASIC = "basic"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"

class SubscriptionStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    CANCELLED = "cancelled"
    PAST_DUE = "past_due"
    TRIALING = "trialing"

class BillingCycle(enum.Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"

class Subscription(db.Model):
    __tablename__ = 'subscriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    plan_type = db.Column(db.Enum(SubscriptionPlan), nullable=False, default=SubscriptionPlan.BASIC)
    status = db.Column(db.Enum(SubscriptionStatus), nullable=False, default=SubscriptionStatus.ACTIVE)
    billing_cycle = db.Column(db.Enum(BillingCycle), nullable=False, default=BillingCycle.MONTHLY)
    start_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    end_date = db.Column(db.DateTime)
    trial_end_date = db.Column(db.DateTime)
    next_billing_date = db.Column(db.DateTime)
    amount = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    currency = db.Column(db.String(3), default='USD')
    stripe_subscription_id = db.Column(db.String(100))  # Stripe subscription ID
    stripe_customer_id = db.Column(db.String(100))  # Stripe customer ID
    payment_method_id = db.Column(db.String(100))  # Stripe payment method ID
    billing_address = db.Column(db.Text)  # JSON string of billing address
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    payments = db.relationship('Payment', backref='subscription', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Subscription {self.id}>'

    def to_dict(self):
        """Convert subscription to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'plan_type': self.plan_type.value,
            'status': self.status.value,
            'billing_cycle': self.billing_cycle.value,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'trial_end_date': self.trial_end_date.isoformat() if self.trial_end_date else None,
            'next_billing_date': self.next_billing_date.isoformat() if self.next_billing_date else None,
            'amount': float(self.amount) if self.amount else None,
            'currency': self.currency,
            'stripe_subscription_id': self.stripe_subscription_id,
            'stripe_customer_id': self.stripe_customer_id,
            'payment_method_id': self.payment_method_id,
            'billing_address': self.billing_address,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'user': self.user.to_dict() if self.user else None
        }

    def is_active(self):
        """Check if subscription is active"""
        return self.status == SubscriptionStatus.ACTIVE

    def is_trial(self):
        """Check if subscription is in trial period"""
        return (self.status == SubscriptionStatus.TRIALING and 
                self.trial_end_date and 
                self.trial_end_date > datetime.utcnow())

    def cancel_subscription(self):
        """Cancel the subscription"""
        self.status = SubscriptionStatus.CANCELLED
        self.end_date = datetime.utcnow()

    def reactivate_subscription(self):
        """Reactivate a cancelled subscription"""
        if self.status == SubscriptionStatus.CANCELLED:
            self.status = SubscriptionStatus.ACTIVE
            self.end_date = None
            # Calculate next billing date based on billing cycle
            if self.billing_cycle == BillingCycle.MONTHLY:
                self.next_billing_date = datetime.utcnow() + timedelta(days=30)
            else:  # YEARLY
                self.next_billing_date = datetime.utcnow() + timedelta(days=365)

    def upgrade_plan(self, new_plan):
        """Upgrade subscription plan"""
        self.plan_type = new_plan
        # Update amount based on new plan (this would typically come from a pricing table)
        plan_prices = {
            SubscriptionPlan.BASIC: 29.99,
            SubscriptionPlan.PREMIUM: 59.99,
            SubscriptionPlan.ENTERPRISE: 99.99
        }
        self.amount = plan_prices.get(new_plan, 29.99)

    @classmethod
    def find_by_user(cls, user_id):
        """Find subscription by user ID"""
        return cls.query.filter_by(user_id=user_id).first()

    @classmethod
    def find_active_subscriptions(cls):
        """Find all active subscriptions"""
        return cls.query.filter_by(status=SubscriptionStatus.ACTIVE).all()

    @classmethod
    def find_expiring_trials(cls, days_ahead=7):
        """Find trials expiring within specified days"""
        cutoff_date = datetime.utcnow() + timedelta(days=days_ahead)
        return cls.query.filter(
            cls.status == SubscriptionStatus.TRIALING,
            cls.trial_end_date <= cutoff_date
        ).all()

