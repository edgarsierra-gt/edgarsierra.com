import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from google.cloud.firestore_v1.async_client import AsyncClient

from limiter import limiter
from models import ContactRequest, SuccessResponse
from services.firestore import get_firestore_client, save_message

router = APIRouter(prefix="/contact", tags=["contact"])
logger = logging.getLogger(__name__)


def _get_client_ip(request: Request) -> str:
    """Read real client IP from X-Forwarded-For (Cloud Run LB) or fallback."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host or "unknown"  # type: ignore[union-attr]


@router.post("", response_model=SuccessResponse)
@limiter.limit("3/hour")
async def contact(
    request: Request,
    body: ContactRequest,
    db: AsyncClient = Depends(get_firestore_client),
) -> SuccessResponse:
    # Honeypot check — silent drop for bots
    if body.website:
        return SuccessResponse()

    ip = _get_client_ip(request)

    try:
        await save_message(
            db,
            {
                "name": body.name,
                "email": body.email,
                "message": body.message,
                "ip": ip,
            },
        )
    except Exception:
        logger.exception("Firestore write failed")
        raise HTTPException(status_code=503, detail="Error al enviar el mensaje.")

    return SuccessResponse(message="Mensaje recibido. Te respondo pronto.")
