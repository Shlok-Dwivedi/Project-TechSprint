from flask import Blueprint, request, jsonify
from app.auth.middleware import token_required
from app.utils.firestore import get_db
from app.utils.validators import validate_required_fields
from app.explanations.models import Explanation
from datetime import datetime

explanations_bp = Blueprint('explanations', __name__)

@explanations_bp.route('/', methods=['POST'])
@token_required
@validate_required_fields(['doubt_id', 'content', 'analogy'])
def create_explanation():
    data = request.get_json()
    user_id = request.user['user_id']
    
    db = get_db()
    
    doubt_ref = db.collection('doubts').document(data['doubt_id'])
    doubt_doc = doubt_ref.get()
    
    if not doubt_doc.exists:
        return jsonify({'error': 'Doubt not found'}), 404
    
    explanation_data = Explanation.create_explanation_dict(
        user_id=user_id,
        doubt_id=data['doubt_id'],
        content=data['content'],
        analogy=data['analogy'],
        depth_level=data.get('depth_level', 'medium')
    )
    
    explanation_ref = db.collection('explanations').document()
    explanation_ref.set(explanation_data)
    
    doubt_data = doubt_doc.to_dict()
    doubt_ref.update({'explanation_count': doubt_data.get('explanation_count', 0) + 1})
    
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()
    if user_doc.exists:
        stats = user_doc.to_dict().get('stats', {})
        stats['explanations_contributed'] = stats.get('explanations_contributed', 0) + 1
        user_ref.update({'stats': stats})
    
    return jsonify({'message': 'Explanation created successfully', 'explanation_id': explanation_ref.id}), 201

@explanations_bp.route('/<explanation_id>/vote', methods=['POST'])
@token_required
@validate_required_fields(['vote_type'])
def vote_explanation(explanation_id):
    data = request.get_json()
    user_id = request.user['user_id']
    vote_type = data['vote_type']
    
    valid_votes = ['helpful', 'confusing', 'misleading']
    if vote_type not in valid_votes:
        return jsonify({'error': 'Invalid vote type', 'valid_types': valid_votes}), 400
    
    db = get_db()
    
    explanation_ref = db.collection('explanations').document(explanation_id)
    explanation_doc = explanation_ref.get()
    
    if not explanation_doc.exists:
        return jsonify({'error': 'Explanation not found'}), 404
    
    explanation_data = explanation_doc.to_dict()
    
    vote_ref = db.collection('explanation_votes').where('user_id', '==', user_id).where('explanation_id', '==', explanation_id).limit(1).stream()
    
    existing_vote = None
    for vote in vote_ref:
        existing_vote = vote
    
    if existing_vote:
        return jsonify({'error': 'You have already voted on this explanation'}), 400
    
    vote_doc_ref = db.collection('explanation_votes').document()
    vote_doc_ref.set({
        'user_id': user_id,
        'explanation_id': explanation_id,
        'vote_type': vote_type,
        'created_at': datetime.utcnow()
    })
    
    vote_field = f"{vote_type}_votes"
    explanation_ref.update({vote_field: explanation_data.get(vote_field, 0) + 1})
    
    helpful = explanation_data.get('helpful_votes', 0) + (1 if vote_type == 'helpful' else 0)
    confusing = explanation_data.get('confusing_votes', 0) + (1 if vote_type == 'confusing' else 0)
    misleading = explanation_data.get('misleading_votes', 0) + (1 if vote_type == 'misleading' else 0)
    
    total_votes = helpful + confusing + misleading
    
    if total_votes > 0:
        clarity_score = (helpful - confusing - (misleading * 2)) / total_votes * 100
        
        if misleading > helpful:
            confidence = 'misleading'
        elif helpful >= 10 and clarity_score > 80:
            confidence = 'highly_reliable'
        elif helpful >= 5 and clarity_score > 60:
            confidence = 'reliable'
        else:
            confidence = 'unverified'
        
        explanation_ref.update({'clarity_score': clarity_score, 'confidence_label': confidence})
    
    return jsonify({'message': 'Vote recorded successfully', 'vote_type': vote_type}), 200