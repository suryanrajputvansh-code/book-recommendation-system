import pytest
from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "endpoints" in data


def test_get_books_paginated():
    response = client.get("/books?page=1&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["page"] == 1
    assert data["limit"] == 10
    assert data["total"] >= 50
    assert len(data["books"]) == 10
    assert "title" in data["books"][0]


def test_get_books_with_genre_filter():
    response = client.get("/books?genre=Fantasy&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data["books"]) > 0
    assert all("Fantasy" in b.get("genres", "") for b in data["books"])


def test_get_books_search():
    response = client.get("/books/search?query=Kafka")
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "Kafka"
    assert data["count"] >= 3
    titles = [b["title"] for b in data["results"]]
    assert "The Metamorphosis" in titles or "The Trial" in titles


def test_get_book_details_valid():
    response = client.get("/books/101")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "101"
    assert data["title"] == "The Metamorphosis"
    assert data["author"] == "Franz Kafka"


def test_get_book_details_not_found():
    response = client.get("/books/nonexistent_id_9999")
    assert response.status_code == 404
    data = response.json()
    assert "not found" in data["detail"].lower()


def test_get_recommendations_valid():
    response = client.get("/books/101/recommendations?top_n=5")
    assert response.status_code == 200
    data = response.json()
    assert data["book_id"] == "101"
    assert data["source_book"]["title"] == "The Metamorphosis"
    assert len(data["recommendations"]) == 5
    assert all("similarity_score" in r for r in data["recommendations"])
    assert all("match_percentage" in r for r in data["recommendations"])


def test_get_recommendations_not_found():
    response = client.get("/books/nonexistent_id_9999/recommendations")
    assert response.status_code == 404


def test_get_popular():
    response = client.get("/popular?limit=8")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 8
    assert len(data["popular_books"]) == 8


def test_get_genres():
    response = client.get("/genres")
    assert response.status_code == 200
    data = response.json()
    assert "genres" in data
    assert len(data["genres"]) > 5


def test_get_stats():
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["total_books"] >= 50
