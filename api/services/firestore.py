import logging

from google.cloud import firestore
from google.cloud.firestore_v1.async_client import AsyncClient

logger = logging.getLogger(__name__)

_client: AsyncClient | None = None


def get_firestore_client() -> AsyncClient:
    """
    FastAPI dependency: returns a singleton Firestore async client.
    Uses ADC in local dev; uses the Cloud Run service account in production.
    """
    global _client
    if _client is None:
        _client = firestore.AsyncClient()
    return _client


async def save_message(client: AsyncClient, data: dict) -> str:
    """
    Save a contact message to Firestore collection 'messages'.
    Returns the auto-generated document ID.
    """
    doc_ref = client.collection("messages").document()
    await doc_ref.set({**data, "createdAt": firestore.SERVER_TIMESTAMP})
    return doc_ref.id
