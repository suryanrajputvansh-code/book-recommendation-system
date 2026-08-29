import os
import sys
import json
import argparse
import datetime
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib

DEFAULT_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "books.csv")
DEFAULT_MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")


def clean_text(text: str) -> str:
    """Normalize text by replacing special characters and excessive whitespace."""
    if not isinstance(text, str):
        return ""
    return " ".join(text.strip().split())


def create_feature_soup(row: pd.Series) -> str:
    """
    Combines weighted text features into a single metadata soup for similarity vectorization.
    We assign higher weight to genres and authors so that books in the same series, genre,
    or by the same author rank highly, while matching thematic descriptions.
    """
    title = str(row.get("title", ""))
    author = str(row.get("author", ""))
    genres = str(row.get("genres", ""))
    description = str(row.get("description", ""))

    # Normalize components
    title_clean = clean_text(title)
    author_clean = clean_text(author)
    genres_clean = clean_text(genres).replace(",", " ")
    description_clean = clean_text(description)

    # Weighted composition
    # Repeat author twice, genres 3 times to boost thematic & author affinity
    soup = f"{genres_clean} {genres_clean} {genres_clean} {author_clean} {author_clean} {title_clean} {description_clean}"
    return soup.lower()


def prepare_model(data_path: str = DEFAULT_DATA_PATH, models_dir: str = DEFAULT_MODELS_DIR) -> dict:
    """
    Cleans dataset, engineers features, computes cosine similarity matrix, and exports artifacts.
    """
    data_path = os.path.abspath(data_path)
    models_dir = os.path.abspath(models_dir)

    print(f"[*] Starting ML model preparation...")
    print(f"[*] Reading dataset from: {data_path}")

    if not os.path.exists(data_path):
        raise FileNotFoundError(
            f"Dataset not found at '{data_path}'. Please ensure 'data/books.csv' is present."
        )

    # Load dataset
    df = pd.read_csv(data_path, dtype=str)
    total_raw_rows = len(df)
    print(f"[*] Loaded {total_raw_rows} raw book records.")

    # 1. Data Cleaning
    # Drop rows without book_id or title
    df = df.dropna(subset=["book_id", "title"]).copy()
    df["book_id"] = df["book_id"].astype(str).str.strip()
    df["title"] = df["title"].astype(str).str.strip()
    df = df.drop_duplicates(subset=["book_id"]).copy()

    # Fill missing optional fields
    df["author"] = df["author"].fillna("Unknown Author").astype(str).str.strip()
    df["genres"] = df["genres"].fillna("General").astype(str).str.strip()
    df["description"] = df["description"].fillna("").astype(str).str.strip()
    df["image_url"] = df["image_url"].fillna("").astype(str).str.strip()

    # Numerical type conversions
    df["rating"] = pd.to_numeric(df["rating"], errors="coerce").fillna(4.0).astype(float)
    df["ratings_count"] = pd.to_numeric(df["ratings_count"], errors="coerce").fillna(0).astype(int)
    df["publication_year"] = pd.to_numeric(df["publication_year"], errors="coerce").fillna(2000).astype(int)

    # Reset index for consistent positional matrix mapping
    df = df.reset_index(drop=True)
    df["matrix_index"] = df.index

    # 2. Feature Engineering & Vectorization
    print("[*] Generating combined feature soups...")
    df["feature_soup"] = df.apply(create_feature_soup, axis=1)

    print("[*] Fitting TF-IDF Vectorizer...")
    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        min_df=1,
        sublinear_tf=True
    )
    tfidf_matrix = vectorizer.fit_transform(df["feature_soup"])
    vocab_size = len(vectorizer.vocabulary_)
    print(f"[*] TF-IDF Matrix shape: {tfidf_matrix.shape} (Vocabulary size: {vocab_size})")

    # 3. Cosine Similarity Computation
    print("[*] Computing pairwise Cosine Similarity matrix...")
    similarity_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)

    # 4. Save Artifacts to models/
    os.makedirs(models_dir, exist_ok=True)
    sim_matrix_path = os.path.join(models_dir, "similarity_matrix.npy")
    books_json_path = os.path.join(models_dir, "books_cleaned.json")
    vectorizer_path = os.path.join(models_dir, "tfidf_vectorizer.joblib")
    metadata_path = os.path.join(models_dir, "feature_metadata.json")

    np.save(sim_matrix_path, similarity_matrix.astype(np.float32))
    
    # Save cleaned books as JSON
    books_list = df.drop(columns=["feature_soup"]).to_dict(orient="records")
    with open(books_json_path, "w", encoding="utf-8") as f:
        json.dump(books_list, f, indent=2, ensure_ascii=False)

    joblib.dump(vectorizer, vectorizer_path)

    metadata = {
        "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "total_books": len(df),
        "vocabulary_size": vocab_size,
        "features": ["genres", "author", "title", "description"],
        "matrix_shape": list(similarity_matrix.shape)
    }
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"[+] Successfully exported artifacts to '{models_dir}':")
    print(f"    - {sim_matrix_path} ({similarity_matrix.shape})")
    print(f"    - {books_json_path} ({len(books_list)} books)")
    print(f"    - {vectorizer_path}")
    print(f"    - {metadata_path}")

    return {
        "total_books": len(df),
        "vocab_size": vocab_size,
        "artifacts_dir": models_dir
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Prepare Book Recommendation ML Model")
    parser.add_argument("--data_path", default=DEFAULT_DATA_PATH, help="Path to raw books.csv")
    parser.add_argument("--models_dir", default=DEFAULT_MODELS_DIR, help="Output models directory")
    args = parser.parse_args()

    try:
        prepare_model(data_path=args.data_path, models_dir=args.models_dir)
    except Exception as e:
        print(f"[ERROR] Failed to prepare model: {e}", file=sys.stderr)
        sys.exit(1)
