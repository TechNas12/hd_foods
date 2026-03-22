from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.database import get_db
from app.dependencies import get_current_active_user, require_admin
from app import models
from app.schemas.support import (
    ReviewCreate, ReviewUpdate, ReviewResponse,
    EnquiryTicketCreate, EnquiryTicketUpdate,
    EnquiryTicketResponse, EnquiryTicketSummary,
    TicketStatusUpdate,
)

router = APIRouter(
    prefix="/support",
    tags=["Support"],
)


# ── Reviews ──────────────────────────────────

@router.post("/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    # One review per user per product
    existing = db.query(models.Review).filter(
        models.Review.product_id == payload.product_id,
        models.Review.user_id    == current_user.id,
        models.Review.is_deleted == False,
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="You have already reviewed this product"
        )

    review = models.Review(**payload.model_dump(), user_id=current_user.id)
    db.add(review)

    # Update product rating and review count
    product = db.query(models.Product).filter(
        models.Product.id == payload.product_id
    ).first()
    if product:
        total                 = (product.rating * product.reviews_count) + payload.rating
        product.reviews_count += 1
        product.rating        = round(total / product.reviews_count, 1)

    db.commit()
    db.refresh(review)
    return review


@router.get("/reviews/product/{product_id}", response_model=list[ReviewResponse])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    return db.query(models.Review).filter(
        models.Review.product_id == product_id,
        models.Review.is_deleted == False,
    ).order_by(models.Review.created_at.desc()).all()


@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    review = db.query(models.Review).filter(
        models.Review.id      == review_id,
        models.Review.user_id == current_user.id,
    ).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    review.is_deleted = True
    review.deleted_at = datetime.now(timezone.utc)
    db.commit()


# ── Enquiry Tickets ───────────────────────────

@router.post("/tickets", response_model=EnquiryTicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(
    payload: EnquiryTicketCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    ticket = models.EnquiryTicket(**payload.model_dump(), user_id=current_user.id)
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.get("/tickets/my", response_model=list[EnquiryTicketSummary])
def get_my_tickets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    return db.query(models.EnquiryTicket).filter(
        models.EnquiryTicket.user_id    == current_user.id,
        models.EnquiryTicket.is_deleted == False,
    ).order_by(models.EnquiryTicket.created_at.desc()).all()


@router.get("/tickets/my/{ticket_id}", response_model=EnquiryTicketResponse)
def get_my_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    ticket = db.query(models.EnquiryTicket).filter(
        models.EnquiryTicket.id         == ticket_id,
        models.EnquiryTicket.user_id    == current_user.id,
        models.EnquiryTicket.is_deleted == False,
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


# ── Admin only ───────────────────────────────

@router.get("/tickets", response_model=list[EnquiryTicketSummary])
def list_all_tickets(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    return db.query(models.EnquiryTicket).filter(
        models.EnquiryTicket.is_deleted == False
    ).order_by(models.EnquiryTicket.created_at.desc()).all()


@router.patch("/tickets/{ticket_id}/status", response_model=EnquiryTicketResponse)
def update_ticket_status(
    ticket_id: int,
    payload: TicketStatusUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    ticket = db.query(models.EnquiryTicket).filter(
        models.EnquiryTicket.id == ticket_id
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.status = payload.status
    db.commit()
    db.refresh(ticket)
    return ticket