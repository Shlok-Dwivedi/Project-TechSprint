import os
from google.genai import GoogleGenAI

def get_gemini_client():
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set")
    return GoogleGenAI(apiKey=api_key)
