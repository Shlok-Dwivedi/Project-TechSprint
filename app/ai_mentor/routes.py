from flask import Blueprint, request, jsonify
from app.auth.middleware import token_required
from app.utils.firestore import get_db
from app.utils.validators import validate_required_fields
from app.ai_mentor.gemini_client import generate_concept_explanation, generate_chat_response, analyze_student_explanation
from datetime import datetime

ai_mentor_bp = Blueprint('ai_mentor', __name__)

@ai_mentor_bp.route('/explain', methods=['POST'])
@token_required
@validate_required_fields(['concept', 'subject'])
def explain_concept():
    data = request.get_json()
    user_id = request.user['user_id']
    
    explanation = generate_concept_explanation(
        concept=data['concept'],
        context=data.get('context', ''),
        subject=data['subject'],
        difficulty=data.get('difficulty', 'medium')
    )
    
    db = get_db()
    ai_exp_ref = db.collection('ai_explanations').document()
    ai_exp_ref.set({
        'user_id': user_id,
        'concept': data['concept'],
        'subject': data['subject'],
        'explanation': explanation,
        'created_at': datetime.utcnow()
    })
    
    return jsonify({'message': 'Explanation generated successfully', 'explanation': explanation}), 200

@ai_mentor_bp.route('/chat', methods=['POST'])
@token_required
@validate_required_fields(['message'])
def chat():
    data = request.get_json()
    user_id = request.user['user_id']
    user_message = data['message']
    
    db = get_db()
    
    session_id = data.get('session_id')
    
    if not session_id:
        session_ref = db.collection('chat_sessions').document()
        session_ref.set({
            'user_id': user_id,
            'created_at': datetime.utcnow(),
            'messages': []
        })
        session_id = session_ref.id
    
    session_doc = db.collection('chat_sessions').document(session_id).get()
    
    if not session_doc.exists:
        return jsonify({'error': 'Session not found'}), 404
    
    session_data = session_doc.to_dict()
    chat_history = session_data.get('messages', [])
    
    user_doc = db.collection('users').document(user_id).get()
    user_context = {}
    if user_doc.exists:
        user_data = user_doc.to_dict()
        user_context = {
            'subject': user_data.get('current_subject'),
            'topic': user_data.get('current_topic'),
            'intent': user_data.get('learning_intent')
        }
    
    ai_response = generate_chat_response(user_message, chat_history, user_context)
    
    chat_history.append({
        'role': 'user',
        'content': user_message,
        'timestamp': datetime.utcnow()
    })
    
    chat_history.append({
        'role': 'assistant',
        'content': ai_response['response'],
        'suggestions': ai_response.get('suggestions', []),
        'timestamp': datetime.utcnow()
    })
    
    db.collection('chat_sessions').document(session_id).update({
        'messages': chat_history,
        'updated_at': datetime.utcnow()
    })
    
    return jsonify({
        'message': 'Response generated',
        'session_id': session_id,
        'response': ai_response['response'],
        'suggestions': ai_response.get('suggestions', [])
    }), 200

@ai_mentor_bp.route('/analyze-explanation', methods=['POST'])
@token_required
@validate_required_fields(['student_explanation', 'concept', 'subject'])
def analyze_explanation():
    data = request.get_json()
    user_id = request.user['user_id']
    
    analysis = analyze_student_explanation(
        student_explanation=data['student_explanation'],
        correct_concept=data['concept'],
        subject=data['subject']
    )
    
    db = get_db()
    analysis_ref = db.collection('explanation_analyses').document()
    analysis_ref.set({
        'user_id': user_id,
        'concept': data['concept'],
        'student_explanation': data['student_explanation'],
        'analysis': analysis,
        'created_at': datetime.utcnow()
    })
    
    return jsonify({'message': 'Explanation analyzed', 'analysis': analysis}), 200

@ai_mentor_bp.route('/chat-history', methods=['GET'])
@token_required
def get_chat_history():
    user_id = request.user['user_id']
    db = get_db()
    
    sessions = db.collection('chat_sessions').where('user_id', '==', user_id).order_by('created_at', direction='DESCENDING').limit(10).stream()
    
    sessions_list = []
    for session in sessions:
        session_data = session.to_dict()
        session_data['id'] = session.id
        messages = session_data.get('messages', [])
        session_data['last_message'] = messages[-1] if messages else None
        session_data['message_count'] = len(messages)
        del session_data['messages']
        sessions_list.append(session_data)
    
    return jsonify({'message': 'Chat history retrieved', 'sessions': sessions_list}), 200

@ai_mentor_bp.route('/chat-session/<session_id>', methods=['GET'])
@token_required
def get_chat_session(session_id):
    user_id = request.user['user_id']
    db = get_db()
    
    session_doc = db.collection('chat_sessions').document(session_id).get()
    
    if not session_doc.exists:
        return jsonify({'error': 'Session not found'}), 404
    
    session_data = session_doc.to_dict()
    
    if session_data['user_id'] != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    session_data['id'] = session_id
    
    return jsonify({'message': 'Session retrieved', 'session': session_data}), 200
