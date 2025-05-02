from openai import OpenAI
import os
from dotenv import load_dotenv
import json



# Load environment variables
load_dotenv()

MODEL = "chatgpt-4o-latest"

client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY')
)

SYSTEM_PROMPT = """
You are an ai assistant that can help with a variety of tasks.
"""

def chat_response(user_message):
    try:
        messages = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            }
        ]
        
        if user_message:
            messages.append({
                "role": "user",
                "content": user_message
            })
            
        completion = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.9,
            presence_penalty=0.2,
            frequency_penalty=0.2
        )

        response = completion.choices[0].message.content
        print(response)

        return {
            "success": True,
            "data": {
                "response": response
            }
        }

    except Exception as e:
        return {
            "success": False,
            "error": "Failed to generate posts",
            "details": str(e)
        }

# Make sure the function is available for import
__all__ = ['chat_response']