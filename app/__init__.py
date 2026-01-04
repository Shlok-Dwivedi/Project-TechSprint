from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')
    
    allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})
    
    from app.utils.firestore import initialize_firebase
    initialize_firebase()
    
    from app.auth.routes import auth_bp
    from app.users.routes import users_bp
    from app.concepts.routes import concepts_bp
    from app.doubts.routes import doubts_bp
    from app.explanations.routes import explanations_bp
    from app.learning_path.routes import learning_path_bp
    from app.ai_mentor.routes import ai_mentor_bp
    from app.analytics.routes import analytics_bp
    from app.gamification.routes import gamification_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(users_bp, url_prefix='/api/v1/users')
    app.register_blueprint(concepts_bp, url_prefix='/api/v1/concepts')
    app.register_blueprint(doubts_bp, url_prefix='/api/v1/doubts')
    app.register_blueprint(explanations_bp, url_prefix='/api/v1/explanations')
    app.register_blueprint(learning_path_bp, url_prefix='/api/v1/learning-path')
    app.register_blueprint(ai_mentor_bp, url_prefix='/api/v1/ai')
    app.register_blueprint(analytics_bp, url_prefix='/api/v1/analytics')
    app.register_blueprint(gamification_bp, url_prefix='/api/v1/gamification')
    
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Clarix AI Backend is running'}, 200
    
    @app.route('/')
    def index():
        return send_from_directory('static', 'index.html')

    @app.route('/ai-mentor.html')
    def ai_mentor_page():
        return send_from_directory('static', 'ai-mentor.html')

    return app
