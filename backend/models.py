from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict


class BookBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(..., alias="id", description="Book unique identifier")
    book_id: str = Field(..., description="Canonical book ID string")
    title: str = Field(..., description="Title of the book")
    author: str = Field(..., description="Author(s) name")
    genres: Optional[str] = Field(None, description="Comma-separated genres or categories")
    rating: Optional[float] = Field(default=0.0, description="Average rating")
    ratings_count: Optional[int] = Field(default=0, description="Number of user ratings")
    publication_year: Optional[int] = Field(default=None, description="Year of publication")
    image_url: Optional[str] = Field(default="", description="Cover image URL")
    description: Optional[str] = Field(default="", description="Synopsis or summary")


class BookDetail(BookBase):
    matrix_index: Optional[int] = None


class RecommendationItem(BookBase):
    similarity_score: float = Field(..., description="Cosine similarity score between 0.0 and 1.0")
    match_percentage: float = Field(..., description="Cosine similarity score formatted as percentage")


class PaginatedBooksResponse(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int
    books: List[BookBase]


class SearchResponse(BaseModel):
    query: str
    count: int
    results: List[BookBase]


class RecommendationResponse(BaseModel):
    book_id: str
    source_book: Optional[BookBase] = None
    recommendations: List[RecommendationItem]


class PopularBooksResponse(BaseModel):
    count: int
    popular_books: List[BookBase]


class SystemStatsResponse(BaseModel):
    status: str
    total_books: int
    similarity_matrix_shape: Optional[List[int]] = None
    genres_count: int
    genres: List[str]
    metadata: Dict[str, Any]
