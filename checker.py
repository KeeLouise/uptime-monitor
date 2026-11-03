import requests, time, sqlite3, os

DB_PATH = os.environ.get("DB_PATH", "uptime.db")

conn = sqlite3.connect(DB_PATH)

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

WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL")

def send_alert(message):
    print(f"ALERT: {message}")
    if WEBHOOK_URL is None:
        return
    try:
        requests.post(WEBHOOK_URL, json={"content": message}, timeout=5)
    except requests.exceptions.RequestException:
        print("Could not send Discord alert")
        

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
        return response.status_code < 400

        
    except requests.exceptions.RequestException:
        conn.execute(
            "INSERT INTO checks (site_id, status_code, response_ms) VALUES (?, ?, ?)",
            ( site_id, None, None)
        )
        conn.commit()
        print("Status: DOWN")
        return False

starting_sites = ["https://disneystore.eu", "https://github.com", "https://this-site-does-not-exist-12345.com"
]

for url in starting_sites:
    conn.execute("INSERT OR IGNORE INTO sites (url) VALUES (?)", (url,))
conn.commit()

last_status = {}

while True:
    rows = conn.execute("SELECT id, url FROM sites").fetchall()
    print("Checking sites...")
    for site_id, url in rows:
        is_up = check_site(site_id, url)
        
        if site_id in last_status and last_status[site_id] != is_up:
            if is_up:
                send_alert(f"{url} is back UP")
            else:
                send_alert(f"{url} is DOWN")
        
        last_status[site_id] = is_up
        print()
    time.sleep(60)