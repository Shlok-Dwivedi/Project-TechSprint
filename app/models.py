from app import db
from flask_bcrypt import Bcrypt
from datetime import datetime

bcrypt = Bcrypt()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default='student')
    profile_picture = db.Column(db.String(255))
    learning_intent = db.Column(db.Text)
    current_subject = db.Column(db.String(100))
    current_topic = db.Column(db.String(100))
    subjects = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, default=datetime.utcnow)
    stats = db.Column(db.JSON, default=dict)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'profile_picture': self.profile_picture,
            'learning_intent': self.learning_intent,
            'current_subject': self.current_subject,
            'current_topic': self.current_topic,
            'subjects': self.subjects,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'stats': self.stats
        }
