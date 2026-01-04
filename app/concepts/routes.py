from flask import Blueprint, request, jsonify
from app.auth.middleware import token_required
from app.utils.firestore import get_db
from app.utils.validators import validate_pagination, validate_required_fields
from app.concepts.models import Concept
from datetime import datetime

concepts_bp = Blueprint('concepts', __name__)

@concepts_bp.route('/', methods=['GET'])
@token_required
def get_concepts():
    db = get_db()
    
    subject = request.args.get('subject')
    topic = request.args.get('topic')
    difficulty = request.args.get('difficulty')
    sort_by = request.args.get('sort_by', 'confusion_count')
    page, limit = validate_pagination()
    
    query = db.collection('concepts')
    
    if subject:
        query = query.where('subject', '==', subject)
    if topic:
        query = query.where('topic', '==', topic)
    if difficulty:
        query = query.where('difficulty', '==', difficulty)
    
    if sort_by == 'confusion_count':
        query = query.order_by('confusion_count', direction='DESCENDING')
    elif sort_by == 'clarity_rating':
        query = query.order_by('clarity_rating', direction='ASCENDING')
    else:
        query = query.order_by('created_at', direction='DESCENDING')
    
    offset = (page - 1) * limit
    concepts = query.offset(offset).limit(limit).stream()
    
    concepts_list = []
    for concept in concepts:
        concept_data = concept.to_dict()
        concept_data['id'] = concept.id
        concepts_list.append(concept_data)
    
    return jsonify({'message': 'Concepts retrieved successfully', 'concepts': concepts_list, 'page': page, 'limit': limit, 'count': len(concepts_list)}), 200

@concepts_bp.route('/<concept_id>', methods=['GET'])
@token_required
def get_concept_detail(concept_id):
    db = get_db()
    
    concept_ref = db.collection('concepts').document(concept_id)
    concept_doc = concept_ref.get()
    
    if not concept_doc.exists:
        return jsonify({'error': 'Concept not found'}), 404
    
    concept_data = concept_doc.to_dict()
    concept_data['id'] = concept_id
    
    doubts = db.collection('doubts').where('concept_id', '==', concept_id).order_by('created_at', direction='DESCENDING').limit(10).stream()
    
    doubts_list = []
    for doubt in doubts:
        doubt_data = doubt.to_dict()
        doubt_data['id'] = doubt.id
        doubts_list.append(doubt_data)
    
    return jsonify({'message': 'Concept details retrieved successfully', 'concept': concept_data, 'related_doubts': doubts_list}), 200

@concepts_bp.route('/', methods=['POST'])
@token_required
@validate_required_fields(['title', 'subject', 'topic', 'description'])
def create_concept():
    data = request.get_json()
    user_id = request.user['user_id']
    
    db = get_db()
    
    concept_data = Concept.create_concept_dict(
        title=data['title'],
        subject=data['subject'],
        topic=data['topic'],
        description=data['description'],
        difficulty=data.get('difficulty', 'medium')
    )
    
    concept_data['created_by'] = user_id
    concept_data['tags'] = data.get('tags', [])
    
    concept_ref = db.collection('concepts').document()
    concept_ref.set(concept_data)
    
    return jsonify({'message': 'Concept created successfully', 'concept_id': concept_ref.id, 'concept': concept_data}), 201

@concepts_bp.route('/subjects', methods=['GET'])
@token_required
def get_subjects():
    subjects_list = [
        {'name': 'DSA', 'display_name': 'Data Structures & Algorithms'},
        {'name': 'OS', 'display_name': 'Operating Systems'},
        {'name': 'DBMS', 'display_name': 'Database Management Systems'},
        {'name': 'CN', 'display_name': 'Computer Networks'},
        {'name': 'OOP', 'display_name': 'Object Oriented Programming'},
        {'name': 'SE', 'display_name': 'Software Engineering'}
    ]
    
    return jsonify({'message': 'Subjects retrieved successfully', 'subjects': subjects_list}), 200
