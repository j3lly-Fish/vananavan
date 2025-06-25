from src.models.user import db
from datetime import datetime
import enum

class RouteStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    FULL = "full"

class Route(db.Model):
    __tablename__ = 'routes'
    
    id = db.Column(db.Integer, primary_key=True)
    driver_id = db.Column(db.Integer, db.ForeignKey('drivers.id'), nullable=False)
    route_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    pickup_locations = db.Column(db.Text)  # JSON string of pickup locations
    dropoff_locations = db.Column(db.Text)  # JSON string of dropoff locations
    schedule = db.Column(db.Text)  # JSON string of schedule patterns
    price_per_day = db.Column(db.Numeric(10, 2))
    price_per_week = db.Column(db.Numeric(10, 2))
    price_per_month = db.Column(db.Numeric(10, 2))
    capacity = db.Column(db.Integer, nullable=False)
    current_bookings = db.Column(db.Integer, default=0)
    special_requirements = db.Column(db.Text)
    status = db.Column(db.Enum(RouteStatus), nullable=False, default=RouteStatus.ACTIVE)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    bookings = db.relationship('Booking', backref='route', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Route {self.route_name}>'

    def to_dict(self):
        """Convert route to dictionary"""
        return {
            'id': self.id,
            'driver_id': self.driver_id,
            'route_name': self.route_name,
            'description': self.description,
            'pickup_locations': self.pickup_locations,
            'dropoff_locations': self.dropoff_locations,
            'schedule': self.schedule,
            'price_per_day': float(self.price_per_day) if self.price_per_day else None,
            'price_per_week': float(self.price_per_week) if self.price_per_week else None,
            'price_per_month': float(self.price_per_month) if self.price_per_month else None,
            'capacity': self.capacity,
            'current_bookings': self.current_bookings,
            'available_spots': self.capacity - self.current_bookings,
            'special_requirements': self.special_requirements,
            'status': self.status.value,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'driver': self.driver.to_dict() if self.driver else None
        }

    def is_available(self):
        """Check if route has available spots"""
        return self.current_bookings < self.capacity and self.status == RouteStatus.ACTIVE

    def add_booking(self):
        """Add a booking to this route"""
        if self.is_available():
            self.current_bookings += 1
            if self.current_bookings >= self.capacity:
                self.status = RouteStatus.FULL
            return True
        return False

    def remove_booking(self):
        """Remove a booking from this route"""
        if self.current_bookings > 0:
            self.current_bookings -= 1
            if self.status == RouteStatus.FULL:
                self.status = RouteStatus.ACTIVE

    @classmethod
    def find_by_driver(cls, driver_id):
        """Find routes by driver ID"""
        return cls.query.filter_by(driver_id=driver_id).all()

    @classmethod
    def find_available_routes(cls):
        """Find all available routes"""
        return cls.query.filter(
            cls.status == RouteStatus.ACTIVE,
            cls.current_bookings < cls.capacity
        ).all()

    @classmethod
    def search_routes(cls, search_params):
        """Search routes based on parameters"""
        query = cls.query.filter(cls.status == RouteStatus.ACTIVE)
        
        if search_params.get('pickup_area'):
            query = query.filter(cls.pickup_locations.contains(search_params['pickup_area']))
        
        if search_params.get('dropoff_area'):
            query = query.filter(cls.dropoff_locations.contains(search_params['dropoff_area']))
        
        if search_params.get('max_price'):
            query = query.filter(cls.price_per_day <= search_params['max_price'])
        
        return query.all()

