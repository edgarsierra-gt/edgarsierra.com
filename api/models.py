from pydantic import BaseModel, EmailStr, Field


class ContactRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    message: str = Field(..., min_length=1, max_length=5000)
    website: str = ""  # honeypot — plausible autofill name for bots


class NewsletterSubscribeRequest(BaseModel):
    email: EmailStr
    website: str = ""  # honeypot


class SuccessResponse(BaseModel):
    success: bool = True
    message: str = ""
