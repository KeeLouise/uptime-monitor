import sqlite3
import pytest
import app

@pytest.fixture
def client(tmp_path, monkeypatch):
    db_path = tmp_path / "test.db"
    monkeypatch.setattr(app, "DB_PATH", db_path)
    
    conn = sqlite3.connect(db_path)
    conn.execute("CREATE TABLE sites (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT NOT NULL UNIQUE)")
    conn.execute("""
       CREATE TABLE checks (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           site_id INTEGER NOT NULL REFERENCES sites(id),
           status_code INTEGER,
           response_ms INTEGER,
           error TEXT,
           checked_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()
   
    return app.app.test_client()


@pytest.fixture
def admin(client, monkeypatch):
    monkeypatch.setattr(app, "ADMIN_PASSWORD", "test-password")
    client.post("/api/login", json={"password": "test-password"})
    return client


def test_no_sites_at_start(client):
    response = client.get("/api/sites")
    assert response.status_code == 200
    assert response.get_json() == []
    
def test_add_site(admin):
    response = admin.post("/api/sites", json={"url": "https://example.com"})
    assert response.status_code == 201
    assert response.get_json()["url"] == "https://example.com"
    
def test_duplicate_site(admin):
    admin.post("/api/sites", json={"url": "https://example.com"})
    response = admin.post("/api/sites", json={"url": "https://example.com"})
    assert response.status_code == 409
    
def test_delete_missing_site(admin):
    response = admin.delete("/api/sites/999")
    assert response.status_code == 404

def test_new_site_is_pending(admin):
    admin.post("/api/sites", json={"url": "https://example.com"})
    response = admin.get("/api/sites")
    site = response.get_json()[0]
    assert site["status"] == "pending"
    assert site["uptime"] is None

def test_add_site_without_url(admin):
    response = admin.post("/api/sites", json={})
    assert response.status_code == 400

def test_add_site_with_banana(admin):
    response = admin.post("/api/sites", json={"url": "banana"})
    assert response.status_code == 400

def test_add_site_with_file_url(admin):
    response = admin.post("/api/sites", json={"url": "file://etc/password"})
    assert response.status_code == 400

def test_add_site_with_number(admin):
    response = admin.post("/api/sites", json={"url": 5})
    assert response.status_code == 400


def test_add_site_logged_out(client):
    response = client.post("/api/sites", json={"url": "https://example.com"})
    assert response.status_code == 401

def test_delete_site_logged_out(client):
    response = client.delete("/api/sites/1")
    assert response.status_code == 401

def test_login_wrong_password(client, monkeypatch):
    monkeypatch.setattr(app, "ADMIN_PASSWORD", "test-password")
    response = client.post("/api/login", json={"password": "wrong"})
    assert response.status_code == 401

def test_logout(admin):
    admin.post("/api/logout")
    response = admin.get("/api/me")
    assert response.get_json() == {"admin": False}

def test_site_shows_latest_error(admin):
    admin.post("/api/sites", json={"url": "https://example.com"})

    conn = sqlite3.connect(app.DB_PATH)
    conn.execute(
        "INSERT INTO checks (site_id, status_code, response_ms, error) VALUES (1, 503, 120, 'HTTP 503')"
    )
    conn.commit()
    conn.close()

    site = admin.get("/api/sites").get_json()[0]
    assert site["status"] == "down"
    assert site["error"] == "HTTP 503"

def test_up_site_has_no_error(admin):
    admin.post("/api/sites", json={"url": "https://example.com"})

    conn = sqlite3.connect(app.DB_PATH)
    conn.execute(
        "INSERT INTO checks (site_id, status_code, response_ms, error) VALUES (1, 200, 120, NULL)"
    )
    conn.commit()
    conn.close()

    site = admin.get("/api/sites").get_json()[0]
    assert site["status"] == "up"
    assert site["error"] is None
