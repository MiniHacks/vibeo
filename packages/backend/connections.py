import os

from firebase_admin import credentials, firestore, initialize_app
from chromadb import Client as chroma_client
from chromadb.config import Settings

from backend.constants import FILE_DIR

cred = credentials.Certificate(
    {
        "type": "service_account",
        "project_id": os.environ["FIREBASE_PROJECT_ID"],
        "private_key": os.environ["FIREBASE_AUTH_SECRET"].replace("\\n", "\n"),
        "client_email": os.environ["FIREBASE_CLIENT_EMAIL"],
        "token_uri": "https://oauth2.googleapis.com/token",
    }
)
initialize_app(cred)

db = firestore.client()
db_client = chroma_client(
    Settings(chroma_db_impl="duckdb+parquet", persist_directory=str(FILE_DIR))
)
collection = db_client.get_or_create_collection("transcripts")
