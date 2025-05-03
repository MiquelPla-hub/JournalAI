from openai import OpenAI
import os
from dotenv import load_dotenv
from pydantic import BaseModel
import json

# Load environment variables
load_dotenv()

MODEL = "gpt-4o"

client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY')
)

SYSTEM_PROMPT = """
You're a supportive and friendly mental-health assistant inside a journaling app.
You need to act like a buddy explaining you their life, but in the backend evaluate the mental health.
Your job is to respond like a buddy who listens, understands, and provides supportive tips.
Extract mental-health insights from the user's message in the following strict JSON format:

{
  "response": <friendly supportive response with brief tips>,
  "mood": <one of: "happy", "sad", "angry", "neutral","surprise","critical depression">,
  "mood_response": <a sentence related with the mood of the message, if critical(crisis_flag) you can say to contact the mental health office>,
  "keywords": [keywords of the conversation that may indicate the state of the user],
  "energy": <one of: "high", "medium", "low">,
  "energy level":< num from 1 to 10>,
  "cognitive_patterns": [cognitive patterns of the user],
  "relationships": [relationships of the user, if not mentioned put "not mentioned"]
  "crisis_flag": <true or false>
}

Only return the JSON. Do not include explanations, comments, or any additional text.
"""


class ResearchPaperExtraction(BaseModel):
    response: str
    mood: str
    mood_response: str
    keywords: str
    energy: str
    energy_level: int
    cognitive_patterns: str
    crisis_flag: bool

def chat_response(user_message):
    try:
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ]

        completion = client.responses.parse(
            model=MODEL,
            input=messages,
            text_format=ResearchPaperExtraction
        )

        response = completion.output_parsed
        print(response)
        return {
            "success": True,
            "data": response.dict()
        }

    except Exception as e:
        return {
            "success": False,
            "error": "Failed to analyze journal entry",
            "details": str(e)
        }

# Make sure the function is available for import
__all__ = ['chat_response']
