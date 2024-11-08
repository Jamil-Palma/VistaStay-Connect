from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from nemoguardrails import RailsConfig, LLMRails
import re

# Load environment variables from .env
load_dotenv()

# Configure Guardrails
config = RailsConfig.from_path("./config")
rails = LLMRails(config)

# Initialize FastAPI application
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Permitir el origen de tu aplicación React
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permitir todos los encabezados
)

# Define request model
class UUIDRequest(BaseModel):
    uuid: str

# Character limit per file
CHARACTER_LIMIT = 4000

# Function to clean URLs and specific headers
def clean_content(text):
    # Remove lines containing URLs or any "URL:" header
    text = re.sub(r'URL:.*\n?', '', text)  # Remove lines starting with "URL:"
    text = re.sub(r'http[s]?://\S+', '', text)  # Remove actual URLs
    return text.strip()  # Remove extra whitespace

# Endpoint to process each file in the UUID folder individually
@app.post("/generate_hotel_info/")
async def generate_hotel_info(request: UUIDRequest):
    # Set folder path based on UUID
    folder_path = os.path.join("data", request.uuid)
    
    # Check if the folder exists
    if not os.path.exists(folder_path):
        raise HTTPException(status_code=404, detail="Folder not found")

    # Initialize a list to store responses for each file
    file_responses = []

    # Iterate through all .txt files in the folder
    for filename in os.listdir(folder_path):
        if filename.endswith(".txt"):
            file_path = os.path.join(folder_path, filename)
            try:
                # Read and clean content of each .txt file
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    # Clean the content to remove URLs
                    content = clean_content(content)
                    
                    # Limit content to 4000 characters
                    truncated_content = content[:CHARACTER_LIMIT]

                    # Send content to Guardrails for processing
                    response = await rails.generate_async(messages=[{
                        "role": "user",
                        "content": truncated_content
                    }])

                    # Append the response for this file to the results
                    file_responses.append({
                        "filename": filename,
                        "response": response["content"]
                    })
                    
            except Exception as e:
                print(f"Error reading {file_path}: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error reading {file_path}")

    # Return all responses as a list of results, one for each file
    return {"responses": file_responses}