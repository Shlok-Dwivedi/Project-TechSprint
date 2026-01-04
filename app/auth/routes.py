from flask import Blueprint, request, jsonify
from app.auth.middleware import verify_firebase_token
from app.utils.jwt_helper import create_access_token, refresh_token
from app.utils.firestore import get_db
from app.utils.validators import validate_required_fields
from app import db
from app.models import User
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
@validate_required_fields(['email', 'password', 'name'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'User already exists'}), 400

    # Create new user
    user = User(email=email, name=name)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role
    )

    return jsonify({
        'message': 'User created successfully',
        'access_token': access_token,
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'role': user.role
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
@validate_required_fields(['email', 'password'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401

    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()

    access_token = create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role
    )

    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'role': user.role
        }
    }), 200

@auth_bp.route('/google-signin', methods=['POST'])
@validate_required_fields(['id_token'])
def google_signin():
    data = request.get_json()
    id_token = data.get('id_token')

    firebase_user = verify_firebase_token(id_token)

    if not firebase_user:
        return jsonify({'error': 'Invalid Firebase token'}), 401

    db = get_db()
    user_id = firebase_user['uid']
    email = firebase_user.get('email')
    name = firebase_user.get('name', email.split('@')[0])

    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        user_data = {
            'email': email,
            'name': name,
            'role': 'student',
            'profile_picture': firebase_user.get('picture'),
            'learning_intent': None,
            'subjects': [],
            'created_at': datetime.utcnow(),
            'last_login': datetime.utcnow(),
            'stats': {
                'concepts_mastered': 0,
                'doubts_resolved': 0,
                'explanations_contributed': 0,
                'clarity_score': 0,
                'reliability_score': 0
            }
        }
        user_ref.set(user_data)
        is_new_user = True
    else:
        user_ref.update({'last_login': datetime.utcnow()})
        user_data = user_doc.to_dict()
        is_new_user = False

    access_token = create_access_token(
        user_id=user_id,
        email=email,
        role=user_data.get('role', 'student')
    )

    return jsonify({
        'message': 'Sign in successful',
        'is_new_user': is_new_user,
        'access_token': access_token,
        'user': {
            'id': user_id,
            'email': email,
            'name': name,
            'role': user_data.get('role', 'student'),
            'profile_picture': user_data.get('profile_picture')
        }
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    data = request.get_json()
    old_token = data.get('token')

    if not old_token:
        return jsonify({'error': 'Token is required'}), 400

    new_token = refresh_token(old_token)

    if not new_token:
        return jsonify({'error': 'Invalid or expired token'}), 401

    return jsonify({
        'message': 'Token refreshed successfully',
        'access_token': new_token
    }), 200
