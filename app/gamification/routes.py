from flask import Blueprint, request, jsonify
from app.auth.middleware import token_required
from app.utils.firestore import get_db
from datetime import datetime, timedelta

gamification_bp = Blueprint('gamification', __name__)

BADGES = {
    'first_doubt': {'name': 'Curious Mind', 'description': 'Posted your first doubt', 'icon': '🤔'},
    'first_explanation': {'name': 'Helpful Helper', 'description': 'Gave your first explanation', 'icon': '💡'},
    'streak_7': {'name': 'Week Warrior', 'description': '7-day learning streak', 'icon': '🔥'},
    'doubts_resolved_10': {'name': 'Problem Solver', 'description': 'Resolved 10 doubts', 'icon': '✅'},
    'explanations_50_helpful': {'name': 'Community Champion', 'description': 'Received 50 helpful votes', 'icon': '⭐'},
    'concept_master': {'name': 'Concept Master', 'description': 'Mastered 20 concepts', 'icon': '🎓'}
}

@gamification_bp.route('/badges', methods=['GET'])
@token_required
def get_badges():
    return jsonify({'message': 'Badges retrieved successfully', 'badges': BADGES}), 200

@gamification_bp.route('/my-badges', methods=['GET'])
@token_required
def get_my_badges():
    user_id = request.user['user_id']
    db = get_db()
    
    user_doc = db.collection('users').document(user_id).get()
    
    if not user_doc.exists:
        return jsonify({'error': 'User not found'}), 404
    
    user_data = user_doc.to_dict()
    earned_badges = user_data.get('badges', [])
    
    badge_details = []
    for badge_id in earned_badges:
        if badge_id in BADGES:
            badge_info = BADGES[badge_id].copy()
            badge_info['id'] = badge_id
            badge_details.append(badge_info)
    
    return jsonify({'message': 'Your badges retrieved successfully', 'badges': badge_details, 'count': len(badge_details)}), 200

@gamification_bp.route('/check-badges', methods=['POST'])
@token_required
def check_and_award_badges():
    user_id = request.user['user_id']
    db = get_db()
    
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()
    
    if not user_doc.exists:
        return jsonify({'error': 'User not found'}), 404
    
    user_data = user_doc.to_dict()
    stats = user_data.get('stats', {})
    current_badges = user_data.get('badges', [])
    new_badges = []
    
    if 'first_doubt' not in current_badges:
        doubts_count = len(list(db.collection('doubts').where('user_id', '==', user_id).limit(1).stream()))
        if doubts_count > 0:
            current_badges.append('first_doubt')
            new_badges.append(BADGES['first_doubt'])
    
    if 'first_explanation' not in current_badges:
        explanations_count = len(list(db.collection('explanations').where('user_id', '==', user_id).limit(1).stream()))
        if explanations_count > 0:
            current_badges.append('first_explanation')
            new_badges.append(BADGES['first_explanation'])
    
    if 'doubts_resolved_10' not in current_badges:
        if stats.get('doubts_resolved', 0) >= 10:
            current_badges.append('doubts_resolved_10')
            new_badges.append(BADGES['doubts_resolved_10'])
    
    if 'explanations_50_helpful' not in current_badges:
        if stats.get('helpful_votes', 0) >= 50:
            current_badges.append('explanations_50_helpful')
            new_badges.append(BADGES['explanations_50_helpful'])
    
    if 'concept_master' not in current_badges:
        if stats.get('concepts_mastered', 0) >= 20:
            current_badges.append('concept_master')
            new_badges.append(BADGES['concept_master'])
    
    if new_badges:
        user_ref.update({'badges': current_badges})
    
    return jsonify({'message': 'Badge check completed', 'new_badges': new_badges, 'total_badges': len(current_badges)}), 200

@gamification_bp.route('/streak', methods=['GET'])
@token_required
def get_streak():
    user_id = request.user['user_id']
    db = get_db()
    
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    events = db.collection('analytics_events').where('user_id', '==', user_id).where('timestamp', '>=', thirty_days_ago).order_by('timestamp', direction='DESCENDING').stream()
    
    active_dates = set()
    for event in events:
        event_data = event.to_dict()
        date_key = event_data['timestamp'].strftime('%Y-%m-%d')
        active_dates.add(date_key)
    
    current_streak = 0
    today = datetime.utcnow().date()
    
    for i in range(30):
        check_date = today - timedelta(days=i)
        date_str = check_date.strftime('%Y-%m-%d')
        
        if date_str in active_dates:
            current_streak += 1
        else:
            break
    
    user_doc = db.collection('users').document(user_id).get()
    max_streak = current_streak
    if user_doc.exists:
        stats = user_doc.to_dict().get('stats', {})
        max_streak = max(current_streak, stats.get('max_streak', 0))
        
        if current_streak > stats.get('streak_days', 0):
            db.collection('users').document(user_id).update({
                'stats.streak_days': current_streak,
                'stats.max_streak': max_streak
            })
    
    return jsonify({'message': 'Streak retrieved successfully', 'current_streak': current_streak, 'max_streak': max_streak}), 200

@gamification_bp.route('/leaderboard', methods=['GET'])
@token_required
def get_leaderboard():
    db = get_db()
    leaderboard_type = request.args.get('type', 'helpful_votes')
    
    users = db.collection('users').stream()
    
    user_scores = []
    for user in users:
        user_data = user.to_dict()
        stats = user_data.get('stats', {})
        
        score = stats.get(leaderboard_type, 0)
        
        user_scores.append({
            'user_id': user.id,
            'name': user_data.get('name'),
            'profile_picture': user_data.get('profile_picture'),
            'score': score,
            'badges_count': len(user_data.get('badges', []))
        })
    
    user_scores.sort(key=lambda x: x['score'], reverse=True)
    
    return jsonify({'message': 'Leaderboard retrieved successfully', 'leaderboard_type': leaderboard_type, 'leaders': user_scores[:50]}), 200