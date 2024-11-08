import os
from dotenv import load_dotenv, find_dotenv

def load_env():
    _ = load_dotenv(find_dotenv())

def get_duckduckgo_api_key():
    load_env()
    return os.getenv("DUCKDUCKGO_API_KEY")
