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
Your job is to respond like a buddy who listens, understands and gives support.
You also need to extract mental-health related information to evaluate the mental state of the user.
Extract meaningful insights from the user's message in the following JSON format:

{
  "response": <your response acting like a supportive buddy, giving some tips>,
  "mood": <positive|negative|neutral>,
  "keywords": <keywords to detect the mood like "anxious", "overwhelmed", "tired", etc>,
  "energy": <high|medium|low>,
  "cognitive_patterns": <patterns like "rumination", "self-doubt", etc>,
  "social_context": <social status,if not mentioned put "not mentioned">,
  "crisis_flag": <boolean that indicated if critical case like suicide or autoregressive, false or true>
}

Only return the JSON. Do not include any explanation, comments, or extra text.
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
