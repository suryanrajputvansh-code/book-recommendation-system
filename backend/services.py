import os
from typing import Dict, Any, List, Optional
from ml.recommender import BookRecommender
from backend.config import settings


class RecommenderService:
    """
    Singleton service managing recommender lifecycle and data normalization.
    """
    _instance: Optional["RecommenderService"] = None

    def __init__(self):
        self.recommender = BookRecommender(
            models_dir=settings.MODELS_DIR,
            data_path=settings.DATASET_PATH,
            auto_train=True
        )

    @classmethod
    def get_instance(cls) -> "RecommenderService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _normalize_book(self, book_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure standard 'id' and 'book_id' fields exist."""
        if not book_dict:
            return {}
        book = book_dict.copy()
        b_id = str(book.get("book_id", book.get("id", "")))
        book["id"] = b_id
        book["book_id"] = b_id
        return book

    def get_book_by_id(self, book_id: str) -> Optional[Dict[str, Any]]:
        book = self.recommender.get_book(book_id)
        if book:
            return self._normalize_book(book)
        return None

    def get_books(self, page: int = 1, limit: int = 20, genre: Optional[str] = None, search: Optional[str] = None) -> Dict[str, Any]:
        data = self.recommender.get_paginated_books(page=page, limit=limit, genre=genre, search=search)
        data["books"] = [self._normalize_book(b) for b in data["books"]]
        return data

    def search_books(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        raw_results = self.recommender.search_books(query, limit=limit)
        return [self._normalize_book(b) for b in raw_results]

    def get_recommendations(self, book_id: str, top_n: int = 5) -> Dict[str, Any]:
        source = self.get_book_by_id(book_id)
        if not source:
            return {"book_id": str(book_id), "source_book": None, "recommendations": []}

        raw_recs = self.recommender.get_recommendations(book_id, top_n=top_n)
        formatted_recs = [self._normalize_book(b) for b in raw_recs]
        return {
            "book_id": str(book_id),
            "source_book": source,
            "recommendations": formatted_recs
        }

    def get_popular_books(self, limit: int = 10) -> List[Dict[str, Any]]:
        raw_popular = self.recommender.get_popular_books(limit=limit)
        return [self._normalize_book(b) for b in raw_popular]

    def get_genres(self) -> List[str]:
        return self.recommender.get_all_genres()

    def get_stats(self) -> Dict[str, Any]:
        stats = self.recommender.get_stats()
        stats["status"] = "healthy"
        stats["genres"] = self.get_genres()
        return stats
