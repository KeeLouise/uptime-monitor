from flask import Flask
import sqlite3

app = Flask(__name__)

@app.route("/api/sites")
def get_sites():
    conn = sqlite3.connect("uptime.db")
    rows = conn.execute("SELECT DISTINCT url FROM checks").fetchall()
    
    sites = []
    for row in rows:
        url = row[0]
        
        total = conn.execute(
            "SELECT COUNT(*) FROM checks WHERE url = ?",
            (url,)
        ).fetchone()[0]
        
        up = conn.execute(
            "SELECT COUNT(*) FROM checks WHERE url = ? AND status_code < 400",
            (url,)
            ).fetchone()[0]
        avg_ms = conn.execute(
            "SELECT AVG(response_ms) FROM checks WHERE url = ?",
            (url,)
            ).fetchone()[0]
        
        uptime = round(up / total * 100, 1)
        
        if avg_ms is not None:
            avg_ms = round(avg_ms)
            
        site = {
            "url": url,
            "uptime": uptime,
            "up": up,
            "total": total,
            "avg_ms": avg_ms,
        }
        sites.append(site)
    
    return sites

if __name__ == "__main__":
    app.run(debug=True, port=5001)