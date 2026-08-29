import os
import json
import numpy as np
from typing import List, Dict, Any, Optional

DEFAULT_MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
DEFAULT_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "books.csv")


class BookRecommender:
    """
    In-memory recommendation engine utilizing precomputed Cosine Similarity matrix
    and metadata indices for sub-millisecond response latency.
    """

    def __init__(self, models_dir: str = DEFAULT_MODELS_DIR, data_path: str = DEFAULT_DATA_PATH, auto_train: bool = True):
        self.models_dir = os.path.abspath(models_dir)
        self.data_path = os.path.abspath(data_path)
        self.similarity_matrix: Optional[np.ndarray] = None
        self.books: List[Dict[str, Any]] = []
        self.id_to_index: Dict[str, int] = {}
        self.index_to_book: Dict[int, Dict[str, Any]] = {}
        self.metadata: Dict[str, Any] = {}
        self._load_or_train(auto_train)

    def _load_or_train(self, auto_train: bool):
        sim_matrix_path = os.path.join(self.models_dir, "similarity_matrix.npy")
        books_json_path = os.path.join(self.models_dir, "books_cleaned.json")
        metadata_path = os.path.join(self.models_dir, "feature_metadata.json")

        if not (os.path.exists(sim_matrix_path) and os.path.exists(books_json_path)):
            if auto_train:
                print("[*] Precomputed model artifacts not found. Initiating model training...")
                from ml.prepare_model import prepare_model
                prepare_model(data_path=self.data_path, models_dir=self.models_dir)
            else:
                raise FileNotFoundError(f"Model artifacts missing in '{self.models_dir}'. Run ml/prepare_model.py first.")

        # Load matrix & books
        self.similarity_matrix = np.load(sim_matrix_path)
        with open(books_json_path, "r", encoding="utf-8") as f:
            self.books = json.load(f)

        if os.path.exists(metadata_path):
            with open(metadata_path, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)

        # Build index lookups
        self.id_to_index = {}
        self.index_to_book = {}
        for idx, book in enumerate(self.books):
            book_id = str(book["book_id"])
            self.id_to_index[book_id] = idx
            self.index_to_book[idx] = book

        print(f"[+] Loaded BookRecommender with {len(self.books)} books and matrix shape {self.similarity_matrix.shape}.")

    def get_book(self, book_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve book details by ID."""
        idx = self.id_to_index.get(str(book_id).strip())
        if idx is not None:
            return self.index_to_book[idx]
        return None

    def search_books(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Search catalog by title, author, genres, or keywords.
        """
        if not query or not query.strip():
            return []
        
        terms = query.strip().lower().split()
        results = []

        for book in self.books:
            searchable_text = f"{book.get('title', '')} {book.get('author', '')} {book.get('genres', '')} {book.get('description', '')}".lower()
            # Calculate match score based on term occurrences
            match_count = sum(1 for term in terms if term in searchable_text)
            if match_count > 0:
                # Prioritize title & author exact matches
                title_match = 2 if query.lower() in book.get('title', '').lower() else 0
                author_match = 1.5 if query.lower() in book.get('author', '').lower() else 0
                score = match_count + title_match + author_match
                results.append((score, book))

        # Sort by relevance score descending, then rating descending
        results.sort(key=lambda item: (item[0], item[1].get("rating", 0)), reverse=True)
        return [item[1] for item in results[:limit]]

    def get_recommendations(self, book_id: str, top_n: int = 5) -> List[Dict[str, Any]]:
        """
        Retrieve top-N cosine similarity recommendations for a given book ID.
        """
        book_id_str = str(book_id).strip()
        idx = self.id_to_index.get(book_id_str)
        if idx is None:
            return []

        if self.similarity_matrix is None:
            return []

        # Get cosine similarity scores row
        sim_scores = self.similarity_matrix[idx]
        # Sort indices by similarity descending
        ranked_indices = np.argsort(sim_scores)[::-1]

        recommendations = []
        for other_idx in ranked_indices:
            if other_idx == idx:
                continue  # Skip seed book itself
            
            score = float(sim_scores[other_idx])
            book_obj = self.index_to_book[other_idx].copy()
            book_obj["similarity_score"] = round(score, 4)
            book_obj["match_percentage"] = round(score * 100, 1)
            recommendations.append(book_obj)

            if len(recommendations) >= top_n:
                break

        return recommendations

    def get_popular_books(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Calculate weighted score (IMDb/Bayesian style) combining average rating and popularity.
        Formula: (v / (v + m)) * R + (m / (v + m)) * C
        """
        if not self.books:
            return []

        ratings = [b.get("rating", 0.0) for b in self.books]
        mean_rating = np.mean(ratings) if ratings else 4.0
        # 50th percentile of ratings count as threshold
        counts = [b.get("ratings_count", 0) for b in self.books]
        m = np.percentile(counts, 50) if counts else 1000

        def calculate_weighted_score(book: Dict[str, Any]) -> float:
            v = book.get("ratings_count", 0)
            r = book.get("rating", 0.0)
            if v + m == 0:
                return r
            return (v / (v + m)) * r + (m / (v + m)) * mean_rating

        sorted_books = sorted(self.books, key=calculate_weighted_score, reverse=True)
        return sorted_books[:limit]

    def get_paginated_books(self, page: int = 1, limit: int = 20, genre: Optional[str] = None, search: Optional[str] = None) -> Dict[str, Any]:
        """
        Retrieve filtered and paginated book records.
        """
        filtered_list = self.books

        if search and search.strip():
            filtered_list = self.search_books(search, limit=len(self.books))

        if genre and genre.strip() and genre.lower() != "all":
            target = genre.strip().lower()
            filtered_list = [
                b for b in filtered_list 
                if any(target in g.strip().lower() for g in b.get("genres", "").split(","))
            ]

        total = len(filtered_list)
        page = max(1, page)
        limit = max(1, min(limit, 100))
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_books = filtered_list[start_idx:end_idx]

        total_pages = (total + limit - 1) // limit if limit > 0 else 1

        return {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": total_pages,
            "books": paginated_books
        }

    def get_all_genres(self) -> List[str]:
        """Extract unique genre tags sorted by frequency."""
        genre_freq: Dict[str, int] = {}
        for book in self.books:
            genres = [g.strip() for g in str(book.get("genres", "")).split(",") if g.strip()]
            for g in genres:
                genre_freq[g] = genre_freq.get(g, 0) + 1
        
        sorted_genres = sorted(genre_freq.items(), key=lambda item: (-item[1], item[0]))
        return [g[0] for g in sorted_genres]

    def get_stats(self) -> Dict[str, Any]:
        """System health and metadata statistics."""
        return {
            "total_books": len(self.books),
            "similarity_matrix_shape": list(self.similarity_matrix.shape) if self.similarity_matrix is not None else None,
            "genres_count": len(self.get_all_genres()),
            "metadata": self.metadata
        }
