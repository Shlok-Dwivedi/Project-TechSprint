import google.generativeai as genai
import os
from datetime import datetime

genai.configure(api_key=os.getenv('GEMINI_API_KEY', 'demo-key'))

def generate_concept_explanation(concept, context, subject, difficulty='medium'):
    try:
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = f"""You are Clarix AI, an expert educational assistant specializing in {subject}.

**Concept**: {concept}
**Context**: {context}
**Difficulty Level**: {difficulty}

Provide a comprehensive explanation with the following structure:

1. **Concept Overview**: Brief introduction to the concept
2. **Step-by-Step Explanation**: Break down the concept into digestible steps
3. **Common Misconceptions**: Address typical misunderstandings
4. **Practical Example**: Provide a real-world or code example
5. **Key Takeaway**: Summarize in one sentence

Make the explanation clear, accurate, and appropriate for a {difficulty} level student."""
        
        response = model.generate_content(prompt)
        
        return {
            'concept_overview': extract_section(response.text, 'Concept Overview'),
            'step_by_step': extract_section(response.text, 'Step-by-Step Explanation'),
            'misconceptions': extract_section(response.text, 'Common Misconceptions'),
            'example': extract_section(response.text, 'Practical Example'),
            'key_takeaway': extract_section(response.text, 'Key Takeaway'),
            'full_text': response.text,
            'generated_at': datetime.utcnow()
        }
    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        return generate_fallback_explanation(concept, context)

def generate_chat_response(user_query, chat_history, user_context):
    try:
        model = genai.GenerativeModel('gemini-pro')
        
        history_text = "\n".join([
            f"{'User' if msg['role'] == 'user' else 'Clarix'}: {msg['content']}"
            for msg in chat_history[-5:]
        ])
        
        prompt = f"""You are Clarix AI, a helpful educational mentor.

**User Context**:
- Subject: {user_context.get('subject', 'General')}
- Topic: {user_context.get('topic', 'General')}
- Learning Intent: {user_context.get('intent', 'learning')}

**Previous Conversation**:
{history_text}

**Current Question**: {user_query}

Provide a helpful, encouraging response that:
1. Answers the question clearly
2. Suggests related concepts to explore
3. Encourages active learning
4. Is friendly and supportive

Keep your response concise but comprehensive."""
        
        response = model.generate_content(prompt)
        
        return {
            'response': response.text,
            'suggestions': extract_suggestions(response.text),
            'generated_at': datetime.utcnow()
        }
    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        return {
            'response': "I apologize, but I'm having trouble generating a response right now. Please try again.",
            'suggestions': [],
            'generated_at': datetime.utcnow()
        }

def analyze_student_explanation(student_explanation, correct_concept, subject):
    try:
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = f"""You are Clarix AI, an expert educational evaluator for {subject}.

**Correct Concept**: {correct_concept}
**Student's Explanation**: {student_explanation}

Analyze the student's explanation and provide:

1. **What the student understood correctly**: List key points they got right
2. **What is missing or weak**: Identify gaps in understanding
3. **How to improve**: Specific suggestions for better explanation
4. **Understanding Score**: Rate 0-100

Format your response as JSON with keys: understood_correctly, missing_points, improvement_suggestions, score"""
        
        response = model.generate_content(prompt)
        
        return {
            'analysis': response.text,
            'timestamp': datetime.utcnow()
        }
    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        return {
            'analysis': "Unable to analyze explanation at this time.",
            'timestamp': datetime.utcnow()
        }

def extract_section(text, section_name):
    try:
        start = text.find(f"**{section_name}**")
        if start == -1:
            return ""
        
        start = text.find(":", start) + 1
        end = text.find("**", start)
        
        if end == -1:
            return text[start:].strip()
        
        return text[start:end].strip()
    except:
        return ""

def extract_suggestions(text):
    suggestions = []
    lines = text.split('\n')
    
    for line in lines:
        if 'suggest' in line.lower() or 'explore' in line.lower():
            suggestions.append(line.strip())
    
    return suggestions[:3]

def generate_fallback_explanation(concept, context):
    return {
        'concept_overview': f"{concept} is an important concept in computer science.",
        'step_by_step': "Please refer to your textbook or course materials for detailed explanation.",
        'misconceptions': "Common mistakes will be covered in community explanations.",
        'example': "Check community explanations for practical examples.",
        'key_takeaway': f"Understanding {concept} is crucial for mastering this subject.",
        'full_text': f"Explanation for {concept} - AI temporarily unavailable.",
        'generated_at': datetime.utcnow()
    }
