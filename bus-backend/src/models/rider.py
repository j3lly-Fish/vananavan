from src.models.user import db
from datetime import datetime
import enum

class RiderStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class Rider(db.Model):
    __tablename__ = 'riders'
    
    id = db.Column(db.Integer, primary_key=True)
    parent_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    student_name = db.Column(db.String(100), nullable=False)
    school = db.Column(db.String(100), nullable=False)
    grade = db.Column(db.String(20))
    date_of_birth = db.Column(db.Date)
    special_needs = db.Column(db.Text)
    medical_conditions = db.Column(db.Text)
    emergency_contact_name = db.Column(db.String(100))
    emergency_contact_phone = db.Column(db.String(20))
    emergency_contact_relationship = db.Column(db.String(50))
    pickup_address = db.Column(db.Text)
    dropoff_address = db.Column(db.Text)
    status = db.Column(db.Enum(RiderStatus), nullable=False, default=RiderStatus.ACTIVE)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    bookings = db.relationship('Booking', backref='rider', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Rider {self.student_name}>'

    def to_dict(self):
        """Convert rider to dictionary"""
        return {
            'id': self.id,
            'parent_user_id': self.parent_user_id,
            'student_name': self.student_name,
            'school': self.school,
            'grade': self.grade,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'special_needs': self.special_needs,
            'medical_conditions': self.medical_conditions,
            'emergency_contact_name': self.emergency_contact_name,
            'emergency_contact_phone': self.emergency_contact_phone,
            'emergency_contact_relationship': self.emergency_contact_relationship,
            'pickup_address': self.pickup_address,
            'dropoff_address': self.dropoff_address,
            'status': self.status.value,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'parent_user': self.parent_user.to_dict() if self.parent_user else None
        }

    @classmethod
    def find_by_parent(cls, parent_user_id):
        """Find riders by parent user ID"""
        return cls.query.filter_by(parent_user_id=parent_user_id).all()

    @classmethod
    def find_by_school(cls, school):
        """Find riders by school"""
        return cls.query.filter_by(school=school).all()

    @classmethod
    def find_active_riders(cls):
        """Find all active riders"""
        return cls.query.filter_by(status=RiderStatus.ACTIVE).all()

