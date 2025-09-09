# from motor.motor_asyncio import AsyncIOMotorClient
# import os

# # Get environment variables with defaults
# MONGO_USERNAME = os.getenv("MONGO_USERNAME", "root")
# MONGO_PASSWORD = os.getenv("MONGO_PASSWORD", "password")
# MONGO_HOST = os.getenv("MONGO_HOST", "mongodb")
# MONGO_PORT = int(os.getenv("MONGO_PORT", 27017))

# # Construct MongoDB URI
# MONGO_URI = f"mongodb://{MONGO_USERNAME}:{MONGO_PASSWORD}@{MONGO_HOST}:{MONGO_PORT}/"

# # Initialize async client
# client = AsyncIOMotorClient(MONGO_URI)

# # Database instance
# db = client["ocr-db"]

# # ✅ Match your actual collections
# users_collection = db["users"]
# files_collection = db["files"]
# texts_collection = db["extracted_texts"]
# logs_collection = db["llm_logs"]
from motor.motor_asyncio import AsyncIOMotorClient
import os

# Get environment variables with defaults
MONGO_HOST = os.getenv("MONGO_HOST", "localhost")
MONGO_PORT = int(os.getenv("MONGO_PORT", 27017))

# Construct MongoDB URI without authentication
MONGO_URI = f"mongodb://{MONGO_HOST}:{MONGO_PORT}/"

# Initialize async client
client = AsyncIOMotorClient(MONGO_URI)

# Database instance
db = client["ocr-db"]

# ✅ Match your actual collections
users_collection = db["users"]
files_collection = db["files"]
texts_collection = db["extracted_texts"]
logs_collection = db["llm_logs"]
