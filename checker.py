import requests, time, sqlite3

conn = sqlite3.connect("uptime.db")

conn.execute("""
    CREATE TABLE IF NOT EXISTS sites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL UNIQUE
    )
""")

conn.execute(""" 
    CREATE TABLE IF NOT EXISTS checks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site_id INTEGER NOT NULL REFERENCES sites(id),
        status_code INTEGER,
        response_ms INTEGER,
        checked_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
""")


def check_site(site_id, url):
    print (f"URL: {url}")
    try:
        response = requests.get(url, timeout=5)
        response_ms = round(response.elapsed.total_seconds() * 1000)
        print (f"Status: {response.status_code}")
        print (f"Response time: {response_ms} ms")
        conn.execute(
            "INSERT INTO checks (site_id, status_code, response_ms) VALUES (?, ?, ?)",
            (site_id, response.status_code, response_ms)
        )
        conn.commit()
        
    except requests.exceptions.RequestException:
        conn.execute(
            "INSERT INTO checks (site_id, status_code, response_ms) VALUES (?, ?, ?)",
            ( site_id, None, None)
        )
        conn.commit()
        print("Status: DOWN")

starting_sites = ["https://disneystore.eu", "https://github.com", "https://vially.com", "https://this-site-does-not-exist-12345.com"
]

for url in starting_sites:
    conn.execute("INSERT OR IGNORE INTO sites (url) VALUES (?)", (url,))
conn.commit()

while True:
    rows = conn.execute("SELECT id, url FROM sites").fetchall()
    print("Checking sites...")
    for site_id, url in rows:
        check_site(site_id, url)
        print()
    time.sleep(10)