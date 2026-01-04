from datetime import datetime

class User:
    @staticmethod
    def create_user_dict(email, name, role='student', profile_picture=None):
        return {
            'email': email,
            'name': name,
            'role': role,
            'profile_picture': profile_picture,
            'learning_intent': None,
            'current_subject': None,
            'current_topic': None,
            'subjects': [],
            'created_at': datetime.utcnow(),
            'last_login': datetime.utcnow(),
            'stats': {
                'concepts_mastered': 0,
                'doubts_resolved': 0,
                'explanations_contributed': 0,
                'clarity_score': 0.0,
                'reliability_score': 0.0,
                'helpful_votes': 0,
                'streak_days': 0,
                'total_study_time_minutes': 0
            },
            'preferences': {
                'difficulty_level': 'medium',
                'learning_style': 'visual',
                'notification_enabled': True
            },
            'badges': [],
            'study_tasks': []
        }
    
    @staticmethod
    def sanitize_user_response(user_data, user_id=None):
        safe_user = {
            'id': user_id,
            'email': user_data.get('email'),
            'name': user_data.get('name'),
            'role': user_data.get('role'),
            'profile_picture': user_data.get('profile_picture'),
            'learning_intent': user_data.get('learning_intent'),
            'current_subject': user_data.get('current_subject'),
            'current_topic': user_data.get('current_topic'),
            'subjects': user_data.get('subjects', []),
            'stats': user_data.get('stats', {}),
            'badges': user_data.get('badges', []),
            'created_at': user_data.get('created_at')
        }
        return safe_user