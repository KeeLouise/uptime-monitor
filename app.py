from flask import Flask, request, session
from urllib.parse import urlparse
import sqlite3, os, hmac

DB_PATH = os.environ.get("DB_PATH", "uptime.db")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")

app = Flask(__name__)

app.secret_key = os.environ.get("SECRET_KEY", "dev-only-change-me")

@app.route("/")
def home():
    return app.send_static_file("index.html")

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or not isinstance(data.get("password"), str):
        return {"error": "Send JSON with a password"}, 400
    
    if ADMIN_PASSWORD is None:
        return {"error": "Login isn't set up"}, 503
    
    if not hmac.compare_digest(data["password"].encode(), ADMIN_PASSWORD.encode()):
        return {"error": "Wrong password"}, 401
    
    session["admin"] = True
    return {"admin": True}
    
@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return {"admin": False}


@app.route("/api/me")
def me():
    return{"admin": session.get("admin", False)}

@app.route("/api/sites")
def get_sites():
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute("SELECT id, url FROM sites").fetchall()
    
    sites = []
    for site_id, url in rows:
        total = conn.execute(
            "SELECT COUNT(*) FROM checks WHERE site_id = ?",
            (site_id,)
        ).fetchone()[0]
        
        up = conn.execute(
            "SELECT COUNT(*) FROM checks WHERE site_id = ? AND status_code < 400",
            (site_id,)
            ).fetchone()[0]
        avg_ms = conn.execute(
            "SELECT AVG(response_ms) FROM checks WHERE site_id = ?",
            (site_id,)
            ).fetchone()[0]
        
        if avg_ms is not None:
            avg_ms = round(avg_ms)
        
        if total == 0:
            uptime = None
        else:
            uptime = round(up / total * 100, 1)
        
        last = conn.execute(
            "SELECT status_code FROM checks WHERE site_id = ? ORDER BY id DESC LIMIT 1",
            (site_id,)
        ).fetchone()
        
        if last is None:
            status = "pending"
        elif last[0] is not None and last[0] < 400:
            status = "up"
        else:
            status = "down"
            
        site = {
            "url": url,
            "uptime": uptime,
            "up": up,
            "total": total,
            "avg_ms": avg_ms,
            "id": site_id,
            "status": status,
        }
        sites.append(site)
    conn.close()
    return sites

@app.route("/api/sites/<int:site_id>/checks")
def get_checks(site_id):
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        "SELECT status_code, response_ms, checked_at FROM checks WHERE site_id = ? ORDER BY id DESC LIMIT 50",
        (site_id,)
    ).fetchall()
    
    checks = []
    for status_code, response_ms, checked_at in rows:
        check = {
            "status_code": status_code,
            "response_ms": response_ms,
            "checked_at": checked_at
        }
        checks.append(check)
    conn.close()
    return checks

@app.route("/api/sites", methods=["POST"])
def add_site():
    if not session.get("admin"):
        return {"error": "Please log in first"}, 401

    data = request.get_json(silent=True)
    if not isinstance(data, dict) or "url" not in data:
        return {"error": "Send JSON with a url"}, 400

    url = data["url"]
    if not isinstance(url, str):
        return {"error": "url must be text"}, 400

    
    parts = urlparse(url)
    if parts.scheme not in ("http", "https") or not parts.netloc:
        return {"error": "url must start with a http:// or https://"}, 400
    
    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.execute("INSERT INTO sites (url) VALUES (?)", (url,))
    except sqlite3.IntegrityError:
        conn.close()
        return {"error": "Site already exists"}, 409
    conn.commit()
    conn.close()
    
    return {"id": cursor.lastrowid, "url": url}, 201

@app.route("/api/sites/<int:site_id>", methods=["DELETE"])
def delete_site(site_id):
    if not session.get("admin"):
        return {"error": "Please log in first"}, 401
    
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM checks WHERE site_id = ?", (site_id,))
    cursor = conn.execute("DELETE FROM sites WHERE id = ?", (site_id,))
    conn.commit()
    conn.close()

    if cursor.rowcount == 0:
        return {"error": "Site not found"}, 404

    return {"deleted": site_id}

if __name__ == "__main__":
    app.run(debug=True, port=5001)
