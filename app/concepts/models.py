from datetime import datetime

class Concept:
    @staticmethod
    def create_concept_dict(title, subject, topic, description, difficulty='medium'):
        return {
            'title': title,
            'subject': subject,
            'topic': topic,
            'description': description,
            'difficulty': difficulty,
            'confusion_count': 0,
            'clarity_rating': 0.0,
            'exam_relevance': 0,
            'tags': [],
            'related_concepts': [],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
