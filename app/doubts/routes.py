from flask import Blueprint, request, jsonify
from app.auth.middleware import token_required
from app.utils.firestore import get_db
from app.utils.validators import validate_pagination, validate_required_fields
from app.doubts.models import Doubt
from datetime import datetime

doubts_bp = Blueprint('doubts', __name__)

@doubts_bp.route('/', methods=['GET'])
@token_required
def get_doubts_feed():
    db = get_db()
    
    subject = request.args.get('subject')
    topic = request.args.get('topic')
    status = request.args.get('status')
    sort_by = request.args.get('sort_by', 'created_at')
    page, limit = validate_pagination()
    
    query = db.collection('doubts')
    
    if subject:
        query = query.where('subject', '==', subject)
    if topic:
        query = query.where('topic', '==', topic)
    if status:
        query = query.where('status', '==', status)
    
    if sort_by == 'helpful_count':
        query = query.order_by('helpful_count', direction='DESCENDING')
    elif sort_by == 'clarity_rating':
        query = query.order_by('clarity_rating', direction='ASCENDING')
    else:
        query = query.order_by('created_at', direction='DESCENDING')
    
    offset = (page - 1) * limit
    doubts = query.offset(offset).limit(limit).stream()
    
    doubts_list = []
    for doubt in doubts:
        doubt_data = doubt.to_dict()
        doubt_data['id'] = doubt.id
        
        user_doc = db.collection('users').document(doubt_data['user_id']).get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            doubt_data['user'] = {
                'name': user_data.get('name'),
                'profile_picture': user_data.get('profile_picture')
            }
        
        doubts_list.append(doubt_data)
    
    return jsonify({'message': 'Doubts retrieved successfully', 'doubts': doubts_list, 'page': page, 'limit': limit}), 200

@doubts_bp.route('/<doubt_id>', methods=['GET'])
@token_required
def get_doubt_detail(doubt_id):
    db = get_db()
    
    doubt_ref = db.collection('doubts').document(doubt_id)
    doubt_doc = doubt_ref.get()
    
    if not doubt_doc.exists:
        return jsonify({'error': 'Doubt not found'}), 404
    
    doubt_data = doubt_doc.to_dict()
    doubt_data['id'] = doubt_id
    
    user_doc = db.collection('users').document(doubt_data['user_id']).get()
    if user_doc.exists:
        user_data = user_doc.to_dict()
        doubt_data['user'] = {
            'name': user_data.get('name'),
            'profile_picture': user_data.get('profile_picture')
        }
    
    ai_explanation = db.collection('ai_explanations').where('doubt_id', '==', doubt_id).limit(1).stream()
    
    ai_exp = None
    for exp in ai_explanation:
        ai_exp = exp.to_dict()
        ai_exp['id'] = exp.id
    
    community_explanations = db.collection('explanations').where('doubt_id', '==', doubt_id).order_by('clarity_score', direction='DESCENDING').stream()
    
    community_list = []
    for exp in community_explanations:
        exp_data = exp.to_dict()
        exp_data['id'] = exp.id
        
        contributor_doc = db.collection('users').document(exp_data['user_id']).get()
        if contributor_doc.exists:
            contributor_data = contributor_doc.to_dict()
            exp_data['contributor'] = {
                'name': contributor_data.get('name'),
                'profile_picture': contributor_data.get('profile_picture'),
                'reliability_score': contributor_data.get('stats', {}).get('reliability_score', 0)
            }
        
        community_list.append(exp_data)
    
    return jsonify({'message': 'Doubt details retrieved successfully', 'doubt': doubt_data, 'ai_explanation': ai_exp, 'community_explanations': community_list}), 200

@doubts_bp.route('/', methods=['POST'])
@token_required
@validate_required_fields(['title', 'description', 'subject', 'topic'])
def create_doubt():
    data = request.get_json()
    user_id = request.user['user_id']
    
    db = get_db()
    
    doubt_data = Doubt.create_doubt_dict(
        user_id=user_id,
        concept_id=data.get('concept_id'),
        title=data['title'],
        description=data['description'],
        subject=data['subject'],
        topic=data['topic']
    )
    
    doubt_ref = db.collection('doubts').document()
    doubt_ref.set(doubt_data)
    
    from app.ai_mentor.gemini_client import generate_concept_explanation
    
    try:
        ai_explanation = generate_concept_explanation(
            concept=data['title'],
            context=data['description'],
            subject=data['subject']
        )
        
        ai_exp_ref = db.collection('ai_explanations').document()
        ai_exp_ref.set({
            'doubt_id': doubt_ref.id,
            'explanation': ai_explanation,
            'created_at': datetime.utcnow()
        })
    except Exception as e:
        print(f"AI explanation generation failed: {str(e)}")
    
    return jsonify({'message': 'Doubt created successfully', 'doubt_id': doubt_ref.id}), 201
