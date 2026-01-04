from flask import Blueprint, request, jsonify
from app.auth.middleware import token_required
from app.utils.firestore import get_db
from app.utils.validators import validate_required_fields
from app.users.models import User
from datetime import datetime

users_bp = Blueprint('users', __name__)

@users_bp.route('/profile', methods=['GET'])
@token_required
def get_profile():
    user_id = request.user['user_id']
    db = get_db()
    
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()
    
    if not user_doc.exists:
        return jsonify({'error': 'User not found'}), 404
    
    user_data = user_doc.to_dict()
    safe_user = User.sanitize_user_response(user_data, user_id)
    
    return jsonify({'message': 'Profile retrieved successfully', 'user': safe_user}), 200

@users_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    user_id = request.user['user_id']
    data = request.get_json()
    
    db = get_db()
    user_ref = db.collection('users').document(user_id)
    
    allowed_fields = ['name', 'learning_intent', 'current_subject', 'current_topic', 'preferences']
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    
    if not update_data:
        return jsonify({'error': 'No valid fields to update'}), 400
    
    update_data['updated_at'] = datetime.utcnow()
    user_ref.update(update_data)
    
    return jsonify({'message': 'Profile updated successfully', 'updated_fields': list(update_data.keys())}), 200

@users_bp.route('/dashboard', methods=['GET'])
@token_required
def get_dashboard():
    user_id = request.user['user_id']
    db = get_db()
    
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()
    
    if not user_doc.exists:
        return jsonify({'error': 'User not found'}), 404
    
    user_data = user_doc.to_dict()
    
    recent_doubts = db.collection('doubts').where('user_id', '==', user_id).order_by('created_at', direction='DESCENDING').limit(5).stream()
    
    doubts_list = []
    for doubt in recent_doubts:
        doubt_data = doubt.to_dict()
        doubt_data['id'] = doubt.id
        doubts_list.append(doubt_data)
    
    unresolved_doubts = db.collection('doubts').where('user_id', '==', user_id).where('status', '==', 'unresolved').limit(10).stream()
    
    unresolved_list = []
    for doubt in unresolved_doubts:
        doubt_data = doubt.to_dict()
        doubt_data['id'] = doubt.id
        unresolved_list.append(doubt_data)
    
    study_tasks = user_data.get('study_tasks', [])
    
    suggested_concepts = db.collection('concepts').where('confusion_count', '>', 0).order_by('confusion_count', direction='DESCENDING').limit(5).stream()
    
    suggestions = []
    for concept in suggested_concepts:
        concept_data = concept.to_dict()
        concept_data['id'] = concept.id
        suggestions.append(concept_data)
    
    dashboard_data = {
        'user': User.sanitize_user_response(user_data, user_id),
        'last_studied_concept': user_data.get('last_studied_concept'),
        'recent_doubts': doubts_list,
        'unresolved_doubts': unresolved_list,
        'study_tasks': study_tasks,
        'suggested_concepts': suggestions,
        'stats': user_data.get('stats', {})
    }
    
    return jsonify({'message': 'Dashboard retrieved successfully', 'dashboard': dashboard_data}), 200

@users_bp.route('/learning-intent', methods=['POST'])
@token_required
@validate_required_fields(['intent'])
def set_learning_intent():
    user_id = request.user['user_id']
    data = request.get_json()
    intent = data.get('intent')
    
    valid_intents = ['stuck_on_concept', 'revision', 'help_others']
    if intent not in valid_intents:
        return jsonify({'error': 'Invalid intent', 'valid_intents': valid_intents}), 400
    
    db = get_db()
    user_ref = db.collection('users').document(user_id)
    user_ref.update({'learning_intent': intent, 'updated_at': datetime.utcnow()})
    
    return jsonify({'message': 'Learning intent set successfully', 'intent': intent}), 200
