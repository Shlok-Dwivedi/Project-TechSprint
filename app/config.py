import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('FLASK_ENV') == 'development'
    
    FIREBASE_PROJECT_ID = os.getenv('FIREBASE_PROJECT_ID')
    FIREBASE_CREDENTIALS = {
        'type': 'service_account',
        'project_id': os.getenv('FIREBASE_PROJECT_ID'),
        'private_key_id': os.getenv('FIREBASE_PRIVATE_KEY_ID'),
        'private_key': os.getenv('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n'),
        'client_email': os.getenv('FIREBASE_CLIENT_EMAIL'),
        'client_id': os.getenv('FIREBASE_CLIENT_ID'),
        'auth_uri': os.getenv('FIREBASE_AUTH_URI', 'https://accounts.google.com/o/oauth2/auth'),
        'token_uri': os.getenv('FIREBASE_TOKEN_URI', 'https://oauth2.googleapis.com/token'),
        'auth_provider_x509_cert_url': os.getenv('FIREBASE_AUTH_PROVIDER_CERT_URL', 'https://www.googleapis.com/oauth2/v1/certs'),
        'client_x509_cert_url': os.getenv('FIREBASE_CLIENT_CERT_URL')
    }
    
    GCS_BUCKET_NAME = os.getenv('GCS_BUCKET_NAME', 'clarix-ai-storage')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
    JWT_EXPIRATION_HOURS = int(os.getenv('JWT_EXPIRATION_HOURS', 24))
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=JWT_EXPIRATION_HOURS)
    
    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100
