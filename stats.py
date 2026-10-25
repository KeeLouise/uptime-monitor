import sqlite3

conn = sqlite3.connect("uptime.db")

def get_stats(url):
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
    
    print(url)
    print(f"{up}/{total} checks")
    print(f"Uptime: {uptime}%")
    if avg_ms is None:
        print("Avg response: n/a")
    else:
        print(f"Avg response: {round(avg_ms)} ms")

rows = conn.execute("SELECT DISTINCT url FROM checks").fetchall()

for row in rows:
    get_stats(row[0])
    print()