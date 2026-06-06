import logging

import httpx

from config import settings

logger = logging.getLogger(__name__)

BEEHIIV_BASE = "https://api.beehiiv.com/v2"


async def subscribe_email(email: str) -> dict:
    """
    Proxy subscription to Beehiiv API v2.
    Returns the parsed JSON response on success.
    Raises httpx.HTTPStatusError on 4xx/5xx from Beehiiv.
    NOTE: BEEHIIV_API_KEY is never logged.
    """
    url = f"{BEEHIIV_BASE}/publications/{settings.beehiiv_publication_id}/subscriptions"
    headers = {"Authorization": f"Bearer {settings.beehiiv_api_key}"}
    payload = {
        "email": email,
        "reactivate_existing": False,
        "send_welcome_email": True,
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
