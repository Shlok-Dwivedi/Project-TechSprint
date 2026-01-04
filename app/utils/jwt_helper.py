import jwt
from datetime import datetime, timedelta
import os

def create_access_token(user_id, email, role='student'):
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=int(os.getenv('JWT_EXPIRATION_HOURS', 24))),
        'iat': datetime.utcnow()
    }
    
    token = jwt.encode(
        payload,
        os.getenv('JWT_SECRET_KEY', 'jwt-secret-key'),
        algorithm=os.getenv('JWT_ALGORITHM', 'HS256')
    )
    
    return token

def decode_token(token):
    try:
        payload = jwt.decode(
            token,
            os.getenv('JWT_SECRET_KEY', 'jwt-secret-key'),
            algorithms=[os.getenv('JWT_ALGORITHM', 'HS256')]
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def refresh_token(old_token):
    payload = decode_token(old_token)
    if payload:
        return create_access_token(
            payload['user_id'],
            payload['email'],
            payload.get('role', 'student')
        )
    return None
