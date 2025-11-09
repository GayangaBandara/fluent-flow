from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Google Gemini client
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash-exp")

# In-memory chat history (in production, use a proper database)
chat_history = []

# System prompt for the chatbot
SYSTEM_PROMPT = """You are a helpful, friendly AI chatbot that provides accurate and engaging conversations. 
You are knowledgeable, patient, and adapt your communication style to match the user's level. 
Keep responses concise but informative, and always be respectful and helpful."""

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Chatbot API is running"})

@app.route("/chat", methods=["POST"])
def chat():
    """Main chat endpoint that handles user messages and returns AI responses"""
    try:
        # Get user message from request
        data = request.get_json()
        user_message = data.get("message", "").strip()
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400
        
        logger.info(f"Received message: {user_message}")
        
        # Add user message to history
        chat_history.append({"role": "user", "content": user_message})
        
        # Limit chat history to last 20 messages to manage token usage
        if len(chat_history) > 20:
            chat_history.pop(0)
        
        # Prepare conversation history for Gemini API
        conversation = SYSTEM_PROMPT + "\n\n"
        for msg in chat_history:
            if msg["role"] == "user":
                conversation += f"User: {msg['content']}\n"
            elif msg["role"] == "assistant":
                conversation += f"Assistant: {msg['content']}\n"
        conversation += f"User: {user_message}\nAssistant:"

        # Call Google Gemini API
        logger.info("Calling Google Gemini API...")
        response = model.generate_content(conversation)

        # Extract the response
        bot_response = response.text
        
        # Add bot response to history
        chat_history.append({"role": "assistant", "content": bot_response})
        
        logger.info(f"Generated response: {bot_response}")
        
        return jsonify({
            "reply": bot_response,
            "success": True
        })
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            "error": f"Failed to generate response: {str(e)}",
            "success": False
        }), 500

@app.route("/clear-history", methods=["POST"])
def clear_history():
    """Clear chat history endpoint"""
    global chat_history
    chat_history = []
    return jsonify({"message": "Chat history cleared", "success": True})

@app.route("/get-history", methods=["GET"])
def get_history():
    """Get current chat history"""
    return jsonify({
        "history": chat_history,
        "count": len(chat_history)
    })

if __name__ == "__main__":
    # Check if API key is provided
    if not os.getenv("GEMINI_API_KEY"):
        logger.error("GEMINI_API_KEY environment variable is not set!")
        logger.error("Please create a .env file with your Google Gemini API key")
        exit(1)

    logger.info("Starting Chatbot Flask API...")
    logger.info("API will be available at http://127.0.0.1:5000")
    logger.info("Endpoints: /health, /chat, /clear-history, /get-history")

    # Run the app
    app.run(host="0.0.0.0", port=5000, debug=True)