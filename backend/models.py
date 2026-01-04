from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime
import json

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    avatar = db.Column(db.String(255))
    reputation = db.Column(db.Integer, default=0)
    expertise = db.Column(db.Enum('Beginner', 'Intermediate', 'Expert', name='expertise_enum'), default='Beginner')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    topics = db.relationship('Topic', backref='user', lazy=True)
    posts = db.relationship('CommunityPost', backref='author', lazy=True)
    chat_messages = db.relationship('ChatMessage', backref='user', lazy=True)
    leetcode_stats = db.relationship('LeetCodeStats', backref='user', uselist=False)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'avatar': self.avatar,
            'reputation': self.reputation,
            'expertise': self.expertise
        }

class Topic(db.Model):
    __tablename__ = 'topics'

    id = db.Column(db.String(50), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    status = db.Column(db.Enum('Weak', 'Mastered', 'In Progress', name='status_enum'), default='Weak')
    progress = db.Column(db.Integer, default=0)
    total = db.Column(db.Integer, default=0)
    icon = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'status': self.status,
            'progress': self.progress,
            'total': self.total,
            'icon': self.icon
        }

class CommunityPost(db.Model):
    __tablename__ = 'community_posts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    topic_id = db.Column(db.String(50), db.ForeignKey('topics.id'))
    title = db.Column(db.String(300), nullable=False)
    code = db.Column(db.Text, nullable=False)
    language = db.Column(db.String(50), nullable=False)
    ai_relevance = db.Column(db.Integer, default=0)  # 0-100
    weighted_score = db.Column(db.Float, default=0.0)
    ai_warning = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'topicId': self.topic_id,
            'author': {
                'name': self.author.name,
                'avatar': self.author.avatar,
                'expertise': self.author.expertise
            },
            'title': self.title,
            'code': self.code,
            'language': self.language,
            'aiRelevance': self.ai_relevance,
            'weightedScore': self.weighted_score,
            'aiWarning': self.ai_warning,
            'timestamp': self.created_at.isoformat()
        }

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    role = db.Column(db.Enum('user', 'model', name='role_enum'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(500))
    video_url = db.Column(db.String(500))
    is_generating = db.Column(db.Boolean, default=False)
    status_text = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'role': self.role,
            'text': self.text,
            'imageUrl': self.image_url,
            'videoUrl': self.video_url,
            'isGenerating': self.is_generating,
            'statusText': self.status_text
        }

class LeetCodeStats(db.Model):
    __tablename__ = 'leetcode_stats'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    username = db.Column(db.String(100), nullable=False)
    total_solved = db.Column(db.Integer, default=0)
    ranking = db.Column(db.Integer, default=0)
    topic_skills = db.Column(db.Text)  # JSON string
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def get_topic_skills(self):
        return json.loads(self.topic_skills) if self.topic_skills else []

    def set_topic_skills(self, skills):
        self.topic_skills = json.dumps(skills)

    def to_dict(self):
        return {
            'username': self.username,
            'totalSolved': self.total_solved,
            'ranking': self.ranking,
            'topicSkills': self.get_topic_skills()
        }
