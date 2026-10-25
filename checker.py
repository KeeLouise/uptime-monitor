import requests, time

def check_site(url):
    print (f"URL: {url}")
    try:
        response = requests.get(url, timeout=5)
        print (f"Status: {response.status_code}")
        print (f"Response time: {round(response.elapsed.total_seconds() * 1000)} ms")
    except requests.exceptions.RequestException:
        print("Status: DOWN")

sites = ["https://disneystore.eu", "https://github.com", "https://vially.com", "https://this-site-does-not-exist-12345.com"
]

while True:
    print("Checking sites...")
    for site in sites:
        check_site(site)
        print()
    time.sleep(60)