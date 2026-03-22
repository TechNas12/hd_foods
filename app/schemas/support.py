from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional
from app.schemas.user import UserSummary
from app.schemas.product import ProductSummary


# ─────────────────────────────────────────────
# REVIEW SCHEMAS
# ─────────────────────────────────────────────
VALID_RATINGS = {1, 2, 3, 4, 5}


class ReviewBase(BaseModel):
    rating:  int
    comment: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, v: int) -> int:
        if v not in VALID_RATINGS:
            raise ValueError("Rating must be between 1 and 5")
        return v

    @field_validator("comment")
    @classmethod
    def validate_comment(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = v.strip()
            if len(v) < 10:
                raise ValueError("Comment must be at least 10 characters")
            if len(v) > 1000:
                raise ValueError("Comment cannot exceed 1000 characters")
            # Basic profanity/spam guard — extend this list as needed
            spam_patterns = ["http://", "https://", "www.", "click here", "buy now"]
            v_lower = v.lower()
            for pattern in spam_patterns:
                if pattern in v_lower:
                    raise ValueError("Review comments cannot contain links or spam")
        return v


class ReviewCreate(ReviewBase):
    product_id: int


class ReviewUpdate(BaseModel):
    rating:  Optional[int] = None
    comment: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v not in VALID_RATINGS:
            raise ValueError("Rating must be between 1 and 5")
        return v

    @field_validator("comment")
    @classmethod
    def validate_comment(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = v.strip()
            if len(v) < 10:
                raise ValueError("Comment must be at least 10 characters")
            if len(v) > 1000:
                raise ValueError("Comment cannot exceed 1000 characters")
        return v


class ReviewResponse(ReviewBase):
    id:         int
    product_id: int
    user_id:    Optional[int] = None
    user:       Optional[UserSummary] = None
    created_at: datetime
    is_deleted: bool = False
    deleted_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# Lightweight version — embedded inside ProductResponse
class ReviewSummary(BaseModel):
    id:         int
    rating:     int
    comment:    Optional[str] = None
    user:       Optional[UserSummary] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────
# ENQUIRY TICKET SCHEMAS
# ─────────────────────────────────────────────
VALID_TICKET_STATUSES = {"Open", "In Progress", "Resolved", "Closed"}

VALID_SUBJECTS = {
    "Order Issue",
    "Payment Problem",
    "Wrong Item Delivered",
    "Damaged Product",
    "Refund Request",
    "Delivery Delay",
    "Product Quality",
    "General Enquiry",
    "Other",
}


class EnquiryTicketBase(BaseModel):
    subject: str
    message: str

    @field_validator("subject")
    @classmethod
    def validate_subject(cls, v: str) -> str:
        v = v.strip()
        if v not in VALID_SUBJECTS:
            raise ValueError(
                f"Invalid subject. Must be one of: "
                f"{', '.join(sorted(VALID_SUBJECTS))}"
            )
        return v

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 20:
            raise ValueError("Message must be at least 20 characters")
        if len(v) > 2000:
            raise ValueError("Message cannot exceed 2000 characters")
        return v


class EnquiryTicketCreate(EnquiryTicketBase):
    order_id: Optional[int] = None   # Optional — user may link to a specific order


class EnquiryTicketUpdate(BaseModel):
    """Only the message can be updated by the user — subject is locked after creation"""
    message: Optional[str] = None

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = v.strip()
            if len(v) < 20:
                raise ValueError("Message must be at least 20 characters")
            if len(v) > 2000:
                raise ValueError("Message cannot exceed 2000 characters")
        return v


class TicketStatusUpdate(BaseModel):
    """Admin only — update ticket resolution status"""
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in VALID_TICKET_STATUSES:
            raise ValueError(
                f"Invalid status. Must be one of: "
                f"{', '.join(sorted(VALID_TICKET_STATUSES))}"
            )
        return v


class EnquiryTicketResponse(EnquiryTicketBase):
    id:         int
    user_id:    Optional[int] = None
    order_id:   Optional[int] = None
    status:     str
    user:       Optional[UserSummary] = None
    created_at: datetime
    is_deleted: bool = False
    deleted_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# Lightweight — for listing tickets in dashboard
class EnquiryTicketSummary(BaseModel):
    id:         int
    subject:    str
    status:     str
    order_id:   Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}