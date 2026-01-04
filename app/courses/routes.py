from flask import Blueprint, request, jsonify, current_app
from app.auth.middleware import token_required, role_required
from app.utils.firestore import get_firestore_client
from app.courses.models import CourseModel
from datetime import datetime

courses_bp = Blueprint('courses', __name__)

@courses_bp.route('/', methods=['GET'])
@token_required
def get_courses(current_user):
    """Get all courses with optional filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 20, type=int)
        category = request.args.get('category', None)
        difficulty = request.args.get('difficulty', None)
        search = request.args.get('search', None)
        
        db = get_firestore_client()
        query = db.collection('courses')
        
        # Apply filters
        if category:
            query = query.where('category', '==', category)
        if difficulty:
            query = query.where('difficulty', '==', difficulty)
        
        courses_ref = query.order_by('created_at', direction='DESCENDING').limit(page_size).stream()
        
        courses = []
        for doc in courses_ref:
            course_data = doc.to_dict()
            course_data['id'] = doc.id
            
            # Apply search filter if provided
            if search:
                if search.lower() not in course_data.get('title', '').lower() and \
                   search.lower() not in course_data.get('description', '').lower():
                    continue
            
            courses.append(course_data)
        
        return jsonify({
            'courses': courses,
            'page': page,
            'page_size': page_size,
            'total': len(courses)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get courses error: {str(e)}")
        return jsonify({'error': 'Failed to fetch courses'}), 500

@courses_bp.route('/<course_id>', methods=['GET'])
@token_required
def get_course(current_user, course_id):
    """Get single course details"""
    try:
        db = get_firestore_client()
        course_doc = db.collection('courses').document(course_id).get()
        
        if not course_doc.exists:
            return jsonify({'error': 'Course not found'}), 404
        
        course_data = course_doc.to_dict()
        course_data['id'] = course_id
        
        # Get modules for this course
        modules_ref = db.collection('modules').where('course_id', '==', course_id).order_by('order').stream()
        modules = []
        
        for module_doc in modules_ref:
            module_data = module_doc.to_dict()
            module_data['id'] = module_doc.id
            
            # Get lessons for this module
            lessons_ref = db.collection('lessons').where('module_id', '==', module_doc.id).order_by('order').stream()
            lessons = []
            
            for lesson_doc in lessons_ref:
                lesson_data = lesson_doc.to_dict()
                lesson_data['id'] = lesson_doc.id
                lessons.append(lesson_data)
            
            module_data['lessons'] = lessons
            modules.append(module_data)
        
        course_data['modules'] = modules
        
        # Get user's progress for this course
        progress_doc = db.collection('progress').document(f"{current_user['uid']}_{course_id}").get()
        if progress_doc.exists:
            course_data['user_progress'] = progress_doc.to_dict()
        
        return jsonify({
            'course': course_data
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get course error: {str(e)}")
        return jsonify({'error': 'Failed to fetch course'}), 500

@courses_bp.route('/', methods=['POST'])
@token_required
@role_required(['admin', 'mentor'])
def create_course(current_user):
    """Create a new course (admin/mentor only)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'description', 'category', 'difficulty']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        course_data = CourseModel.create_course_document(
            title=data['title'],
            description=data['description'],
            category=data['category'],
            difficulty=data['difficulty'],
            instructor_id=current_user['uid'],
            instructor_name=current_user['name'],
            thumbnail=data.get('thumbnail', ''),
            tags=data.get('tags', []),
            estimated_hours=data.get('estimated_hours', 0)
        )
        
        db = get_firestore_client()
        course_ref = db.collection('courses').document()
        course_ref.set(course_data)
        
        course_data['id'] = course_ref.id
        
        return jsonify({
            'message': 'Course created successfully',
            'course': course_data
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"Create course error: {str(e)}")
        return jsonify({'error': 'Failed to create course'}), 500

@courses_bp.route('/<course_id>/enroll', methods=['POST'])
@token_required
def enroll_course(current_user, course_id):
    """Enroll user in a course"""
    try:
        db = get_firestore_client()
        
        # Check if course exists
        course_doc = db.collection('courses').document(course_id).get()
        if not course_doc.exists:
            return jsonify({'error': 'Course not found'}), 404
        
        # Check if already enrolled
        progress_id = f"{current_user['uid']}_{course_id}"
        progress_doc = db.collection('progress').document(progress_id).get()
        
        if progress_doc.exists:
            return jsonify({'error': 'Already enrolled in this course'}), 400
        
        # Create progress document
        progress_data = {
            'user_id': current_user['uid'],
            'course_id': course_id,
            'enrolled_at': datetime.utcnow().isoformat(),
            'status': 'in_progress',
            'completed_lessons': [],
            'completed_modules': [],
            'progress_percentage': 0,
            'time_spent': 0,
            'last_accessed': datetime.utcnow().isoformat()
        }
        
        db.collection('progress').document(progress_id).set(progress_data)
        
        # Update user stats
        user_ref = db.collection('users').document(current_user['uid'])
        user_ref.update({
            'stats.courses_enrolled': current_user.get('stats', {}).get('courses_enrolled', 0) + 1,
            'updated_at': datetime.utcnow().isoformat()
        })
        
        # Update course enrollment count
        course_ref = db.collection('courses').document(course_id)
        course_data = course_doc.to_dict()
        course_ref.update({
            'enrolled_count': course_data.get('enrolled_count', 0) + 1
        })
        
        return jsonify({
            'message': 'Enrolled successfully',
            'progress': progress_data
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"Enroll course error: {str(e)}")
        return jsonify({'error': 'Failed to enroll in course'}), 500

@courses_bp.route('/<course_id>/progress', methods=['GET'])
@token_required
def get_course_progress(current_user, course_id):
    """Get user's progress for a course"""
    try:
        db = get_firestore_client()
        progress_id = f"{current_user['uid']}_{course_id}"
        progress_doc = db.collection('progress').document(progress_id).get()
        
        if not progress_doc.exists:
            return jsonify({'error': 'Not enrolled in this course'}), 404
        
        progress_data = progress_doc.to_dict()
        progress_data['id'] = progress_id
        
        return jsonify({
            'progress': progress_data
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get progress error: {str(e)}")
        return jsonify({'error': 'Failed to fetch progress'}), 500

@courses_bp.route('/lessons/<lesson_id>/complete', methods=['POST'])
@token_required
def complete_lesson(current_user, lesson_id):
    """Mark a lesson as completed"""
    try:
        data = request.get_json()
        time_spent = data.get('time_spent', 0)
        
        db = get_firestore_client()
        
        # Get lesson details
        lesson_doc = db.collection('lessons').document(lesson_id).get()
        if not lesson_doc.exists:
            return jsonify({'error': 'Lesson not found'}), 404
        
        lesson_data = lesson_doc.to_dict()
        course_id = lesson_data['course_id']
        module_id = lesson_data['module_id']
        
        # Update progress
        progress_id = f"{current_user['uid']}_{course_id}"
        progress_ref = db.collection('progress').document(progress_id)
        progress_doc = progress_ref.get()
        
        if not progress_doc.exists:
            return jsonify({'error': 'Not enrolled in this course'}), 404
        
        progress_data = progress_doc.to_dict()
        completed_lessons = progress_data.get('completed_lessons', [])
        
        if lesson_id not in completed_lessons:
            completed_lessons.append(lesson_id)
            
            # Calculate new progress percentage
            total_lessons = db.collection('lessons').where('course_id', '==', course_id).stream()
            total_count = sum(1 for _ in total_lessons)
            progress_percentage = (len(completed_lessons) / total_count * 100) if total_count > 0 else 0
            
            update_data = {
                'completed_lessons': completed_lessons,
                'progress_percentage': progress_percentage,
                'time_spent': progress_data.get('time_spent', 0) + time_spent,
                'last_accessed': datetime.utcnow().isoformat()
            }
            
            # Check if all lessons in module are completed
            module_lessons = db.collection('lessons').where('module_id', '==', module_id).stream()
            module_lesson_ids = [doc.id for doc in module_lessons]
            
            if all(lid in completed_lessons for lid in module_lesson_ids):
                completed_modules = progress_data.get('completed_modules', [])
                if module_id not in completed_modules:
                    completed_modules.append(module_id)
                    update_data['completed_modules'] = completed_modules
            
            # Check if course is completed
            if progress_percentage == 100:
                update_data['status'] = 'completed'
                update_data['completed_at'] = datetime.utcnow().isoformat()

                # Update user stats
            user_ref = db.collection('users').document(current_user['uid'])
            user_ref.update({
                'stats.courses_completed': current_user.get('stats', {}).get('courses_completed', 0) + 1
            })

            