import os
import pytest
import numpy as np
from ml.prepare_model import clean_text, create_feature_soup, prepare_model
from ml.recommender import BookRecommender
import pandas as pd


def test_clean_text():
    assert clean_text("  The   Trial \n") == "The Trial"
    assert clean_text("") == ""
    assert clean_text(None) == ""


def test_create_feature_soup():
    row = pd.Series({
        "title": "The Trial",
        "author": "Franz Kafka",
        "genres": "Classic, Absurdist Fiction, Philosophy",
        "description": "Josef K. is suddenly arrested by an inaccessible authority."
    })
    soup = create_feature_soup(row)
    assert "franz kafka" in soup
    assert "absurdist fiction" in soup
    assert "the trial" in soup


def test_recommender_loading():
    recommender = BookRecommender(auto_train=True)
    assert recommender.similarity_matrix is not None
    assert len(recommender.books) >= 50
    assert recommender.similarity_matrix.shape[0] == len(recommender.books)


def test_get_book():
    recommender = BookRecommender()
    book = recommender.get_book("101")
    assert book is not None
    assert book["title"] == "The Metamorphosis"
    assert book["author"] == "Franz Kafka"

    # Non-existent book
    assert recommender.get_book("99999") is None


def test_search_books():
    recommender = BookRecommender()
    # Search for Kafka
    kafka_results = recommender.search_books("Kafka", limit=5)
    assert len(kafka_results) >= 2
    assert all("Kafka" in b["author"] or "Kafka" in b["title"] for b in kafka_results)

    # Search for Dostoevsky
    dostoevsky_results = recommender.search_books("Dostoevsky", limit=5)
    assert len(dostoevsky_results) >= 2
    assert all("Dostoevsky" in b["author"] for b in dostoevsky_results)

    # Search for Tech / System Design
    sys_results = recommender.search_books("System Design", limit=5)
    assert len(sys_results) >= 1


def test_recommendations_semantic_quality():
    recommender = BookRecommender()
    
    # 1. Franz Kafka: The Metamorphosis (101) should recommend other Kafka or absurdist/existential classics (The Trial, Castle, Notes from Underground)
    kafka_recs = recommender.get_recommendations("101", top_n=5)
    assert len(kafka_recs) == 5
    kafka_rec_authors = [b["author"] for b in kafka_recs]
    assert "Franz Kafka" in kafka_rec_authors

    # Verify similarity scores are sorted descending and between 0 and 1
    scores = [b["similarity_score"] for b in kafka_recs]
    assert scores == sorted(scores, reverse=True)
    assert all(0.0 <= s <= 1.0 for s in scores)

    # 2. George Orwell: 1984 (18) should recommend Animal Farm, Homage to Catalonia, or Brave New World / Fahrenheit 451
    orwell_recs = recommender.get_recommendations("18", top_n=5)
    orwell_rec_titles = [b["title"] for b in orwell_recs]
    assert "Animal Farm" in orwell_rec_titles or "Brave New World" in orwell_rec_titles or "Fahrenheit 451" in orwell_rec_titles

    # 3. Fyodor Dostoevsky: Crime and Punishment (50) should recommend The Brothers Karamazov, Notes from Underground, or The Idiot
    dost_recs = recommender.get_recommendations("50", top_n=5)
    dost_titles = [b["title"] for b in dost_recs]
    assert "The Brothers Karamazov" in dost_titles or "Notes from Underground" in dost_titles or "The Idiot" in dost_titles

    # 4. Tech: Clean Code (57) should recommend The Clean Coder or Pragmatic Programmer
    clean_recs = recommender.get_recommendations("57", top_n=5)
    clean_titles = [b["title"] for b in clean_recs]
    assert "The Clean Coder: A Code of Conduct for Professional Programmers" in clean_titles or "The Pragmatic Programmer: Your Journey to Mastery" in clean_titles


def test_popular_books():
    recommender = BookRecommender()
    popular = recommender.get_popular_books(limit=10)
    assert len(popular) == 10
    assert all("rating" in b for b in popular)


def test_genres_extraction():
    recommender = BookRecommender()
    genres = recommender.get_all_genres()
    assert len(genres) > 5
    assert "Classic" in genres or "Computer Science" in genres or "Absurdist Fiction" in genres
