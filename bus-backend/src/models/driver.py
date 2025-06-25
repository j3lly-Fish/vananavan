from src.models.user import db
from datetime import datetime
import enum

class DriverStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class Driver(db.Model):
    __tablename__ = 'drivers'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    license_number = db.Column(db.String(50), unique=True, nullable=False)
    license_expiry = db.Column(db.Date, nullable=False)
    vehicle_make = db.Column(db.String(50))
    vehicle_model = db.Column(db.String(50))
    vehicle_year = db.Column(db.Integer)
    vehicle_capacity = db.Column(db.Integer, nullable=False, default=1)
    vehicle_plate = db.Column(db.String(20))
    insurance_policy = db.Column(db.String(100))
    insurance_expiry = db.Column(db.Date)
    service_areas = db.Column(db.Text)  # JSON string of service areas
    bio = db.Column(db.Text)
    profile_image = db.Column(db.String(255))
    rating = db.Column(db.Float, default=0.0)
    total_ratings = db.Column(db.Integer, default=0)
    status = db.Column(db.Enum(DriverStatus), nullable=False, default=DriverStatus.ACTIVE)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    routes = db.relationship('Route', backref='driver', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Driver {self.license_number}>'

    def to_dict(self):
        """Convert driver to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'license_number': self.license_number,
            'license_expiry': self.license_expiry.isoformat() if self.license_expiry else None,
            'vehicle_make': self.vehicle_make,
            'vehicle_model': self.vehicle_model,
            'vehicle_year': self.vehicle_year,
            'vehicle_capacity': self.vehicle_capacity,
            'vehicle_plate': self.vehicle_plate,
            'insurance_policy': self.insurance_policy,
            'insurance_expiry': self.insurance_expiry.isoformat() if self.insurance_expiry else None,
            'service_areas': self.service_areas,
            'bio': self.bio,
            'profile_image': self.profile_image,
            'rating': self.rating,
            'total_ratings': self.total_ratings,
            'status': self.status.value,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'user': self.user.to_dict() if self.user else None
        }

    def update_rating(self, new_rating):
        """Update driver rating with new rating"""
        if self.total_ratings == 0:
            self.rating = new_rating
            self.total_ratings = 1
        else:
            total_score = self.rating * self.total_ratings
            total_score += new_rating
            self.total_ratings += 1
            self.rating = total_score / self.total_ratings

    @classmethod
    def find_by_user_id(cls, user_id):
        """Find driver by user ID"""
        return cls.query.filter_by(user_id=user_id).first()

    @classmethod
    def find_active_drivers(cls):
        """Find all active drivers"""
        return cls.query.filter_by(status=DriverStatus.ACTIVE).all()

