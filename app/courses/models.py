@staticmethod
def create_course_document(title, description, category, difficulty, instructor_id, instructor_name, thumbnail='', tags=None, estimated_hours=0):
    """Create a new course document structure"""
    if tags is None:
        tags = []
        
    return {
        'title': title,
        'description': description,
        'category': category,
        'difficulty': difficulty,
        'instructor_id': instructor_id,
        'instructor_name': instructor_name,
        'thumbnail': thumbnail,
        'tags': tags,
        'estimated_hours': estimated_hours,
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat(),
        'published': True,
        'enrolled_count': 0,
        'rating': 0.0,
        'rating_count': 0,
        'skills': []
    }

@staticmethod
def create_module_document(course_id, title, description, order):
    """Create a new module document structure"""
    return {
        'course_id': course_id,
        'title': title,
        'description': description,
        'order': order,
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat()
    }

@staticmethod
def create_lesson_document(course_id, module_id, title, description, content_type, content_url, order, duration_minutes=0):
    """Create a new lesson document structure"""
    return {
        'course_id': course_id,
        'module_id': module_id,
        'title': title,
        'description': description,
        'content_type': content_type,  # video, text, quiz, assignment
        'content_url': content_url,
        'order': order,
        'duration_minutes': duration_minutes,
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat(),
        'resources': []
    }

