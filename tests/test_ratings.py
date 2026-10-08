import pytest
from fastapi.testclient import TestClient
from backend.app import app
from backend.database import Base, engine

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


def signup_and_login(email="rater@example.com", name="Rater", password="Password123"):
    client.post("/api/auth/signup", json={"email": email, "name": name, "password": password})


def test_rating_requires_auth():
    res = client.put("/api/books/101/rating", json={"rating": 5})
    assert res.status_code == 401


def test_rating_validation():
    signup_and_login()
    # Invalid rating > 5
    res = client.put("/api/books/101/rating", json={"rating": 6})
    assert res.status_code == 422  # Pydantic validation error

    # Invalid rating < 1
    res2 = client.put("/api/books/101/rating", json={"rating": 0})
    assert res2.status_code == 422


def test_rating_upsert_and_delete():
    signup_and_login()

    # Rate 5
    res = client.put("/api/books/101/rating", json={"rating": 5})
    assert res.status_code == 200
    data = res.json()
    assert data["book_id"] == "101"
    assert data["user_rating"] == 5

    # Update to 4
    res_up = client.put("/api/books/101/rating", json={"rating": 4})
    assert res_up.status_code == 200
    assert res_up.json()["user_rating"] == 4

    # Get rating info
    res_get = client.get("/api/books/101/rating")
    assert res_get.status_code == 200
    assert res_get.json()["user_rating"] == 4

    # Delete rating
    res_del = client.delete("/api/books/101/rating")
    assert res_del.status_code == 200
    assert res_del.json()["user_rating"] is None

    # Confirm deleted
    res_get_del = client.get("/api/books/101/rating")
    assert res_get_del.json()["user_rating"] is None


def test_personalized_recommendations():
    signup_and_login()

    # With 0 ratings, not eligible
    res_inelig = client.get("/api/recommendations/personalized")
    assert res_inelig.status_code == 200
    assert res_inelig.json()["eligible"] is False

    # Rate 3 books: Fantasy high (book 20, book 24 with rating 5), Tech low (book 57 with rating 1)
    client.put("/api/books/20/rating", json={"rating": 5})
    client.put("/api/books/24/rating", json={"rating": 5})
    client.put("/api/books/57/rating", json={"rating": 1})

    # Now eligible!
    res_elig = client.get("/api/recommendations/personalized")
    assert res_elig.status_code == 200
    data = res_elig.json()
    assert data["eligible"] is True
    assert len(data["recommendations"]) > 0

    # Check top recommendation is not one of the rated books
    top_rec = data["recommendations"][0]
    assert top_rec["id"] not in ["20", "24", "57"]
