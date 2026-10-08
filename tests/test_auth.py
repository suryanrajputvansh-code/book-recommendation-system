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


def test_signup_success():
    payload = {
        "email": "testuser@example.com",
        "name": "Test User",
        "password": "Password123"
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "user" in data
    assert data["user"]["email"] == "testuser@example.com"
    assert data["user"]["name"] == "Test User"
    assert "access_token" in response.cookies


def test_signup_duplicate_email():
    payload = {
        "email": "duplicate@example.com",
        "name": "First User",
        "password": "Password123"
    }
    res1 = client.post("/api/auth/signup", json=payload)
    assert res1.status_code == 200

    res2 = client.post("/api/auth/signup", json=payload)
    assert res2.status_code == 400
    assert "already registered" in res2.json()["detail"].lower()


def test_signup_invalid_password():
    payload = {
        "email": "shortpwd@example.com",
        "name": "Short Pwd",
        "password": "short"
    }
    res = client.post("/api/auth/signup", json=payload)
    assert res.status_code == 400
    assert "at least 8 characters" in res.json()["detail"].lower()


def test_login_success():
    signup_payload = {
        "email": "loginuser@example.com",
        "name": "Login User",
        "password": "Password123"
    }
    client.post("/api/auth/signup", json=signup_payload)

    login_payload = {
        "email": "loginuser@example.com",
        "password": "Password123"
    }
    res = client.post("/api/auth/login", json=login_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["user"]["email"] == "loginuser@example.com"
    assert "access_token" in res.cookies


def test_login_invalid_password():
    signup_payload = {
        "email": "wrongpwd@example.com",
        "name": "Wrong Pwd",
        "password": "Password123"
    }
    client.post("/api/auth/signup", json=signup_payload)

    login_payload = {
        "email": "wrongpwd@example.com",
        "password": "WrongPassword99"
    }
    res = client.post("/api/auth/login", json=login_payload)
    assert res.status_code == 401
    assert "incorrect email or password" in res.json()["detail"].lower()


def test_me_authenticated_vs_unauthenticated():
    # Unauthenticated
    res_unauth = client.get("/api/auth/me")
    assert res_unauth.status_code == 401

    # Authenticated
    signup_payload = {
        "email": "meuser@example.com",
        "name": "Me User",
        "password": "Password123"
    }
    signup_res = client.post("/api/auth/signup", json=signup_payload)
    assert signup_res.status_code == 200

    # Cookie automatically present in TestClient session
    res_auth = client.get("/api/auth/me")
    assert res_auth.status_code == 200
    assert res_auth.json()["user"]["email"] == "meuser@example.com"


def test_logout():
    signup_payload = {
        "email": "logoutuser@example.com",
        "name": "Logout User",
        "password": "Password123"
    }
    client.post("/api/auth/signup", json=signup_payload)

    logout_res = client.post("/api/auth/logout")
    assert logout_res.status_code == 200

    res_me = client.get("/api/auth/me")
    assert res_me.status_code == 401
