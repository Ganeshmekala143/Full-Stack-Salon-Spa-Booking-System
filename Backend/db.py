import os
import pymongo
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "your url...")

try:
    client = pymongo.MongoClient(MONGO_URI)
    # Check the connection
    client.admin.command('ping')
    print("MongoDB connection established successfully.")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    client = None

# Using 'salon_spa_db' as our database name
db = client.get_database("salon_spa_db") if client is not None else None
