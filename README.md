# Project-TechSprint
Clarix AI
Understanding, verified by AI
Overview
Clarix AI is a student-first learning platform designed to solve one of the biggest problems in education:
students study a lot, but still don’t truly understand concepts.
Instead of acting as a tutor app, chatbot, or course platform, Clarix AI focuses on conceptual clarity by combining:
Verified AI explanations for correctness
Peer (student) explanations for relatability
Active learning through “explain-it-back”
Intelligent task-based revision
Clarix AI is built for students, by students, with AI used as a validator and guide, not a replacement for thinking.
Problem Statement
Existing EdTech platforms:
Focus heavily on content delivery, not comprehension
Assume one explanation fits all learners
Encourage passive consumption (videos, notes, lectures)
Do not track or fix why a student is confused
Fail to connect learning across subjects
As a result, students often:
Memorize without understanding
Carry misconceptions across topics
Struggle during exams, vivas, and interviews
Solution
Clarix AI addresses this by restructuring how doubts are resolved.
When a student asks a doubt, Clarix AI intentionally separates correctness from perspective using a dual-window model:
Clarix AI (Verified Explanation)
Provides a structured, accurate, AI-validated explanation
Highlights common misconceptions
Establishes conceptual boundaries
Community Explanations (Student Perspectives)
Shows multiple student-written explanations
Uses analogies and simplified reasoning
Displays AI confidence labels to flag risky or misleading content
This separation ensures trust, transparency, and clarity.
Key Features
Dual-Window Doubt Resolution
AI explanation for correctness
Community explanations for relatability
User freely switches between both
Explain-It-Back Learning
Students must explain concepts in their own words
AI highlights gaps and weak reasoning
Encourages active understanding, not memorization
Confusion Tracking
Tracks repeated misunderstandings
Detects explanations that cause downstream confusion
Gradually suppresses misleading content
Cross-Subject Knowledge Bridging
Reuses concepts a student already understands
Connects ideas across subjects (e.g., DSA ↔ OS)
Reduces cognitive load
Task-Based Revision (Google Tasks)
AI suggests revision tasks based on learning gaps
Students can track study consistency
Encourages follow-through after understanding
Student Proof of Understanding
Clarity score based on peer validation
Contribution history
Concept strength overview
What Clarix AI Is NOT
Not a tutor marketplace
Not a chatbot-based Q&A app
Not a video course platform
Not syllabus dumping
Clarix AI is a thinking-first learning system.
Tech Stack
Frontend
Next.js
Clean, minimal UI focused on reading and thinking
Authentication & Realtime Data
Firebase Authentication
Firebase Firestore
Backend & Intelligence
Google Cloud Functions
Explanation scoring and moderation
Confusion tracking logic
AI orchestration
AI
Gemini AI
Used for:
Concept consistency checks
Explanation validation
Doubt replay
Cross-subject knowledge mapping
AI never replaces students; it supports and verifies them.
Architecture Overview
User submits a doubt or explanation
Firebase stores raw data
Google Cloud Functions process and analyze content
Gemini AI validates conceptual consistency
Explanations are ranked and labeled
UI updates in real time
This creates a self-correcting learning system.
UX Philosophy
One clear purpose per screen
Minimal cognitive load
No distractions or infinite feeds
No AI hype or chatbot theatrics
Learning happens through interaction, not scrolling
Why Clarix AI Matters
Helps average students, not just toppers
Encourages learning by explaining
Makes peer learning safe and structured
Scales naturally without tutors
Aligns with real academic workflows
