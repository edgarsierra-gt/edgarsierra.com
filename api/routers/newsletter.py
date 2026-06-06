import logging

import httpx
from fastapi import APIRouter, HTTPException, Request

from limiter import limiter
from models import NewsletterSubscribeRequest, SuccessResponse
from services.beehiiv import subscribe_email

router = APIRouter(prefix="/newsletter", tags=["newsletter"])
logger = logging.getLogger(__name__)


@router.post("/subscribe", response_model=SuccessResponse)
@limiter.limit("5/minute")
async def subscribe(
    request: Request,
    body: NewsletterSubscribeRequest,
) -> SuccessResponse:
    # Honeypot check — silent drop for bots
    if body.website:
        return SuccessResponse()

    try:
        await subscribe_email(body.email)
    except httpx.HTTPStatusError as exc:
        status = exc.response.status_code
        # 409 = already subscribed — treat as success
        if status == 409:
            return SuccessResponse(message="Ya estás suscrito.")
        logger.error("Beehiiv error status=%s", status)
        raise HTTPException(
            status_code=503, detail="Error al procesar la suscripción."
        )
    except httpx.TimeoutException:
        logger.error("Beehiiv timeout")
        raise HTTPException(
            status_code=503, detail="Error al procesar la suscripción."
        )

    return SuccessResponse(message="¡Listo! Revisá tu correo para confirmar.")
