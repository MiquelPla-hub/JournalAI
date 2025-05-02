from flask import Flask, jsonify, request
from flask_cors import CORS
from openai_api import chat_response
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    user_message = request.json.get('message')
    response = chat_response(user_message)
    return jsonify(response)  # if it's a Pydantic model



if __name__ == '__main__':
    app.run(port=5000,debug=True)
