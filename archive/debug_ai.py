import google.generativeai as genai
import os

API_KEY = "AIzaSyCAzlWdVznQFUDxEMZynx2e-KocB9t5xgU"

print(f"Testing Gemini API with key: {API_KEY[:5]}...")

try:
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content("Hello, are you working?")
    print("Success! Response:")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
