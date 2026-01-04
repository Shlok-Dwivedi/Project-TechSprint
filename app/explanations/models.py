from datetime import datetime

class Explanation:
    @staticmethod
    def create_explanation_dict(user_id, doubt_id, content, analogy, depth_level='medium'):
        return {
            'user_id': user_id,
            'doubt_id': doubt_id,
            'content': content,
            'analogy': analogy,
            'depth_level': depth_level,
            'clarity_score': 0.0,
            'confidence_label': 'unverified',
            'helpful_votes': 0,
            'confusing_votes': 0,
            'misleading_votes': 0,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }