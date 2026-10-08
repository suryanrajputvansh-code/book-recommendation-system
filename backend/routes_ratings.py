from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Path, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from backend.database import get_db, Rating, User
from backend.auth import get_current_user, get_optional_current_user
from backend.services import RecommenderService

router = APIRouter(prefix="/api", tags=["Ratings & Personalization"])


class RatingPayload(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Star rating from 1 to 5")


class RatingResponse(BaseModel):
    book_id: str
    average: float
    count: int
    user_rating: Optional[int] = None


class UserRatingItem(BaseModel):
    id: int
    book_id: str
    rating: int
    created_at: datetime
    updated_at: datetime


def calculate_blended_rating(book_id: str, db: Session) -> tuple[float, int]:
    service = RecommenderService.get_instance()
    book = service.get_book_by_id(book_id)
    if not book:
        return (0.0, 0)

    csv_rating = float(book.get("rating", 0.0))
    csv_count = int(book.get("ratings_count", 0))

    user_stats = db.query(
        func.avg(Rating.rating).label("avg_rating"),
        func.count(Rating.id).label("total_count")
    ).filter(Rating.book_id == str(book_id)).first()

    user_avg = float(user_stats.avg_rating) if user_stats and user_stats.avg_rating else 0.0
    user_count = int(user_stats.total_count) if user_stats and user_stats.total_count else 0

    if user_count == 0:
        return (csv_rating, csv_count)

    # Blend CSV rating and user ratings with Bayesian weighting
    total_count = csv_count + user_count
    blended_avg = ((csv_rating * csv_count) + (user_avg * user_count)) / total_count
    return (round(blended_avg, 2), total_count)


@router.put("/books/{book_id}/rating", response_model=RatingResponse)
def upsert_rating(
    payload: RatingPayload,
    book_id: str = Path(..., description="ID of book to rate"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RecommenderService.get_instance()
    book = service.get_book_by_id(book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with ID '{book_id}' was not found in catalog."
        )

    book_id_str = str(book_id)
    existing_rating = db.query(Rating).filter(
        Rating.user_id == current_user.id,
        Rating.book_id == book_id_str
    ).first()

    if existing_rating:
        existing_rating.rating = payload.rating
        existing_rating.updated_at = datetime.utcnow()
    else:
        new_rating = Rating(
            user_id=current_user.id,
            book_id=book_id_str,
            rating=payload.rating
        )
        db.add(new_rating)

    db.commit()

    avg_val, cnt_val = calculate_blended_rating(book_id_str, db)
    return {
        "book_id": book_id_str,
        "average": avg_val,
        "count": cnt_val,
        "user_rating": payload.rating
    }


@router.delete("/books/{book_id}/rating", response_model=RatingResponse)
def delete_rating(
    book_id: str = Path(..., description="ID of book to remove rating from"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RecommenderService.get_instance()
    book = service.get_book_by_id(book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with ID '{book_id}' was not found."
        )

    book_id_str = str(book_id)
    existing_rating = db.query(Rating).filter(
        Rating.user_id == current_user.id,
        Rating.book_id == book_id_str
    ).first()

    if existing_rating:
        db.delete(existing_rating)
        db.commit()

    avg_val, cnt_val = calculate_blended_rating(book_id_str, db)
    return {
        "book_id": book_id_str,
        "average": avg_val,
        "count": cnt_val,
        "user_rating": None
    }


@router.get("/books/{book_id}/rating", response_model=RatingResponse)
def get_book_rating(
    book_id: str = Path(..., description="Book ID"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    service = RecommenderService.get_instance()
    book = service.get_book_by_id(book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with ID '{book_id}' was not found."
        )

    book_id_str = str(book_id)
    avg_val, cnt_val = calculate_blended_rating(book_id_str, db)

    user_val = None
    if current_user:
        r = db.query(Rating).filter(
            Rating.user_id == current_user.id,
            Rating.book_id == book_id_str
        ).first()
        if r:
            user_val = r.rating

    return {
        "book_id": book_id_str,
        "average": avg_val,
        "count": cnt_val,
        "user_rating": user_val
    }


@router.get("/me/ratings", response_model=List[UserRatingItem])
def get_my_ratings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ratings = db.query(Rating).filter(Rating.user_id == current_user.id).order_by(Rating.updated_at.desc()).all()
    return ratings


@router.get("/recommendations/personalized")
def get_personalized_recommendations(
    limit: int = Query(6, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_ratings = db.query(Rating).filter(Rating.user_id == current_user.id).all()
    if len(user_ratings) < 3:
        return {
            "eligible": False,
            "min_ratings_required": 3,
            "current_ratings_count": len(user_ratings),
            "recommendations": []
        }

    user_ratings_dict = {str(r.book_id): r.rating for r in user_ratings}
    service = RecommenderService.get_instance()
    recs = service.recommender.get_personalized_recommendations(user_ratings_dict, limit=limit)
    formatted_recs = [service._normalize_book(b) for b in recs]

    return {
        "eligible": True,
        "min_ratings_required": 3,
        "current_ratings_count": len(user_ratings),
        "recommendations": formatted_recs
    }
