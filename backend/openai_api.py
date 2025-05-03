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
Your job is to respond like a buddy who listens, understands, and provides supportive tips.
Extract mental-health insights from the user's message in the following strict JSON format:

{
  "response": <friendly supportive response with brief tips>,
  "mood": <one of: "positive", "negative", "neutral">,
  "keywords": [up to 3 from: "anxious", "overwhelmed", "tired", "sad", "depressed", "angry", "stressed", "hopeless", "calm", "relieved", "motivated", "grateful"],
  "energy": <one of: "high", "medium", "low">,
  "cognitive_patterns": [up to 2 from: "rumination", "self-doubt", "catastrophizing", "black-and-white thinking", "overgeneralization", "mind reading", "perfectionism"],
  "crisis_flag": <true or false>
}

Only return the JSON. Do not include explanations, comments, or any additional text.
"""


class ResearchPaperExtraction(BaseModel):
    response: str
    mood: str
    keywords: list[str]
    energy: str
    cognitive_patterns: list[str]
    social_context: str
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
