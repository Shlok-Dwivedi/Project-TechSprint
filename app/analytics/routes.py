from flask import Blueprint, request, jsonify
from app.auth.middleware import token_required
from app.utils.firestore import get_db
from datetime import datetime, timedelta

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/track-event', methods=['POST'])
@token_required
def track_event():
    user_id = request.user['user_id']
    data = request.get_json()
    
    event_type = data.get('event_type')
    event_data = data.get('event_data', {})
    
    db = get_db()
    
    event_ref = db.collection('analytics_events').document()
    event_ref.set({
        'user_id': user_id,
        'event_type': event_type,
        'event_data': event_data,
        'timestamp': datetime.utcnow()
    })
    
    return jsonify({'message': 'Event tracked successfully', 'event_id': event_ref.id}), 201

@analytics_bp.route('/user-analytics', methods=['GET'])
@token_required
def get_user_analytics():
    user_id = request.user['user_id']
    db = get_db()
    
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    events = db.collection('analytics_events').where('user_id', '==', user_id).where('timestamp', '>=', thirty_days_ago).stream()
    
    event_counts = {}
    daily_activity = {}
    
    for event in events:
        event_data = event.to_dict()
        event_type = event_data['event_type']
        timestamp = event_data['timestamp']
        
        event_counts[event_type] = event_counts.get(event_type, 0) + 1
        
        date_key = timestamp.strftime('%Y-%m-%d')
        daily_activity[date_key] = daily_activity.get(date_key, 0) + 1
    
    user_doc = db.collection('users').document(user_id).get()
    user_stats = {}
    if user_doc.exists:
        user_stats = user_doc.to_dict().get('stats', {})
    
    return jsonify({
        'message': 'Analytics retrieved successfully',
        'event_counts': event_counts,
        'daily_activity': daily_activity,
        'user_stats': user_stats,
        'period': '30_days'
    }), 200

@analytics_bp.route('/concept-mastery', methods=['GET'])
@token_required
def get_concept_mastery():
    user_id = request.user['user_id']
    db = get_db()
    
    doubts = db.collection('doubts').where('user_id', '==', user_id).where('status', '==', 'resolved').stream()
    
    subject_mastery = {}
    
    for doubt in doubts:
        doubt_data = doubt.to_dict()
        subject = doubt_data.get('subject')
        
        if subject not in subject_mastery:
            subject_mastery[subject] = {
                'resolved_doubts': 0,
                'topics': set()
            }
        
        subject_mastery[subject]['resolved_doubts'] += 1
        subject_mastery[subject]['topics'].add(doubt_data.get('topic'))
    
    for subject in subject_mastery:
        subject_mastery[subject]['topics'] = list(subject_mastery[subject]['topics'])
        subject_mastery[subject]['topics_count'] = len(subject_mastery[subject]['topics'])
    
    return jsonify({'message': 'Concept mastery retrieved', 'subject_mastery': subject_mastery}), 200

@analytics_bp.route('/study-time', methods=['POST'])
@token_required
def log_study_time():
    user_id = request.user['user_id']
    data = request.get_json()
    
    minutes = data.get('minutes', 0)
    subject = data.get('subject')
    
    db = get_db()
    
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()
    
    if user_doc.exists:
        stats = user_doc.to_dict().get('stats', {})
        stats['total_study_time_minutes'] = stats.get('total_study_time_minutes', 0) + minutes
        user_ref.update({'stats': stats})
    
    session_ref = db.collection('study_sessions').document()
    session_ref.set({
        'user_id': user_id,
        'subject': subject,
        'minutes': minutes,
        'timestamp': datetime.utcnow()
    })
    
    return jsonify({'message': 'Study time logged successfully', 'minutes': minutes}), 200
