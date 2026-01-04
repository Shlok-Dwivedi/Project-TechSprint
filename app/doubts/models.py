from datetime import datetime

class Doubt:
    @staticmethod
    def create_doubt_dict(user_id, concept_id, title, description, subject, topic):
        return {
            'user_id': user_id,
            'concept_id': concept_id,
            'title': title,
            'description': description,
            'subject': subject,
            'topic': topic,
            'status': 'unresolved',
            'clarity_rating': 0.0,
            'helpful_count': 0,
            'explanation_count': 0,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'resolved_at': None
        }