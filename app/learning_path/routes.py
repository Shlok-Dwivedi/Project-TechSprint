from flask import Blueprint, request, jsonify
from app.auth.middleware import token_required
from app.utils.firestore import get_db
from datetime import datetime

learning_path_bp = Blueprint('learning_path', __name__)

@learning_path_bp.route('/generate', methods=['POST'])
@token_required
def generate_learning_path():
    user_id = request.user['user_id']
    db = get_db()
    
    user_confusion = db.collection('user_confusion').where('user_id', '==', user_id).order_by('marked_at', direction='DESCENDING').stream()
    
    confused_concepts = []
    for confusion in user_confusion:
        confusion_data = confusion.to_dict()
        concept_id = confusion_data.get('concept_id')
        
        concept_doc = db.collection('concepts').document(concept_id).get()
        if concept_doc.exists:
            concept_data = concept_doc.to_dict()
            concept_data['id'] = concept_id
            confused_concepts.append(concept_data)
    
    resolved_doubts = db.collection('doubts').where('user_id', '==', user_id).where('status', '==', 'resolved').stream()
    
    strong_topics = set()
    for doubt in resolved_doubts:
        doubt_data = doubt.to_dict()
        strong_topics.add(doubt_data.get('topic'))
    
    study_tasks = []
    
    for concept in confused_concepts[:5]:
        study_tasks.append({
            'type': 'revise',
            'concept_id': concept['id'],
            'concept_title': concept['title'],
            'subject': concept['subject'],
            'priority': 'high',
            'estimated_time_minutes': 30,
            'status': 'pending'
        })
    
    learning_path_ref = db.collection('learning_paths').document()
    learning_path_ref.set({
        'user_id': user_id,
        'confused_concepts': [c['id'] for c in confused_concepts],
        'strong_topics': list(strong_topics),
        'study_tasks': study_tasks,
        'generated_at': datetime.utcnow(),
        'status': 'active'
    })
    
    return jsonify({
        'message': 'Learning path generated successfully',
        'learning_path_id': learning_path_ref.id,
        'confused_concepts': confused_concepts,
        'strong_topics': list(strong_topics),
        'study_tasks': study_tasks
    }), 200

@learning_path_bp.route('/current', methods=['GET'])
@token_required
def get_current_learning_path():
    user_id = request.user['user_id']
    db = get_db()
    
    learning_path = db.collection('learning_paths').where('user_id', '==', user_id).where('status', '==', 'active').order_by('generated_at', direction='DESCENDING').limit(1).stream()
    
    path_data = None
    for path in learning_path:
        path_data = path.to_dict()
        path_data['id'] = path.id
    
    if not path_data:
        return jsonify({'message': 'No active learning path found'}), 404
    
    return jsonify({'message': 'Learning path retrieved successfully', 'learning_path': path_data}), 200
