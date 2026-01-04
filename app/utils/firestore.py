import firebase_admin
from firebase_admin import credentials, firestore
import os

db = None

def initialize_firebase():
    global db

    if not firebase_admin._apps:
        try:
            # Use the JSON file directly instead of environment variables
            cred_path = os.path.expanduser('~/Downloads/project-techsprint-firebase-adminsdk-fbsvc-a63d0025a0.json')
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            db = firestore.client()
            print("✅ Firebase initialized successfully")
        except Exception as e:
            print(f"❌ Firebase initialization error: {str(e)}")
            firebase_admin.initialize_app()
            db = firestore.client()
    else:
        db = firestore.client()

    return db

def get_db():
    global db
    if db is None:
        db = initialize_firebase()
    return db
