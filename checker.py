import requests, time, sqlite3

conn = sqlite3.connect("uptime.db")

conn.execute("""
    CREATE TABLE IF NOT EXISTS checks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        status_code INTEGER,
        response_ms INTEGER,
        checked_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
""")


def check_site(url):
    print (f"URL: {url}")
    try:
        response = requests.get(url, timeout=5)
        response_ms = round(response.elapsed.total_seconds() * 1000)
        print (f"Status: {response.status_code}")
        print (f"Response time: {response_ms} ms")
        conn.execute(
            "INSERT INTO checks (url, status_code, response_ms) VALUES (?, ?, ?)",
            (url, response.status_code, response_ms)
        )
        conn.commit()
        
    except requests.exceptions.RequestException:
        conn.execute(
            "INSERT INTO checks (url, status_code, response_ms) VALUES (?, ?, ?)",
            ( url, None, None)
        )
        conn.commit()
        print("Status: DOWN")

sites = ["https://disneystore.eu", "https://github.com", "https://vially.com", "https://this-site-does-not-exist-12345.com"
]

while True:
    print("Checking sites...")
    for site in sites:
        check_site(site)
        print()
    time.sleep(10)