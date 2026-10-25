from flask import Flask, request
import sqlite3

app = Flask(__name__)

@app.route("/api/sites")
def get_sites():
    conn = sqlite3.connect("uptime.db")
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
        site = {
            "url": url,
            "uptime": uptime,
            "up": up,
            "total": total,
            "avg_ms": avg_ms,
            "id": site_id,
        }
        sites.append(site)
        conn.close()
    return sites

@app.route("/api/sites/<int:site_id>/checks")
def get_checks(site_id):
    conn = sqlite3.connect("uptime.db")
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
    data = request.get_json()
    url = data["url"]
    
    conn = sqlite3.connect("uptime.db")
    try:
        cursor = conn.execute("INSERT INTO sites (url) VALUES (?)", (url,))
    except:
        return {"error": "Site already exists"}, 409
        conn.close()
    conn.commit()
    conn.close()
    
    return {"id": cursor.lastrowid, "url": url}, 201

@app.route("/api/sites/<int:site_id>", methods=["DELETE"])
def delete_site(site_id):
    conn = sqlite3.connect("uptime.db")
    conn.execute("DELETE FROM checks WHERE site_id = ?", (site_id,))
    cursor = conn.execute("DELETE FROM sites WHERE id = ?", (site_id,))
    conn.commit()
    conn.close()

    if cursor.rowcount == 0:
        return {"error": "Site not found"}, 404

    return {"deleted": site_id}

if __name__ == "__main__":
    app.run(debug=True, port=5001)
