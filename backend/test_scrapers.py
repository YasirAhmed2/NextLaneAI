import requests
from bs4 import BeautifulSoup
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
}

print("--- 1. DEVPOST ---")
res_dev = requests.get('https://devpost.com/hackathons', headers=headers)
print("Devpost HTTP Status:", res_dev.status_code)
if res_dev.status_code == 200:
    soup = BeautifulSoup(res_dev.text, 'html.parser')
    # Let's inspect links and headings
    titles = soup.select('.main-content h3, .hackathon-tile h3, h3, h2, a[href*="devpost.com"]')
    print("Devpost h3 count:", len(titles))
    # Let's search for hackathon cards on Devpost:
    # Devpost uses custom tags or specific class names for tiles like `.side-info`, `.hackathon-tile`, `a.main-content`
    cards = soup.select('div.hackathon-tile, div[class*="tile"], div[class*="hackathon"], article, .content-section a[href]')
    print("Devpost cards count:", len(cards))
    # Let's print first 5 link hrefs and titles
    for a in soup.select('a[href*="devpost.com"]')[:10]:
        t = a.get_text(strip=True)
        if len(t) > 5 and 'hackathon' not in t.lower() and 'devpost' not in t.lower():
            print("  Devpost item:", t, "->", a['href'])

print("\n--- 2. LINKEDIN ---")
# Public search URL instead of guest API
li_url = "https://www.linkedin.com/jobs/search/?keywords=software%20engineer%20intern&location=Worldwide"
res_li = requests.get(li_url, headers=headers)
print("LinkedIn Search Status:", res_li.status_code)
if res_li.status_code == 200:
    soup_li = BeautifulSoup(res_li.text, 'html.parser')
    cards_li = soup_li.select('li, .base-card, .job-search-card, .base-search-card')
    print("LinkedIn cards found:", len(cards_li))
    for card in cards_li[:5]:
        title_el = card.select_one('h3.base-search-card__title, h3, .job-search-card__title')
        comp_el = card.select_one('h4.base-search-card__subtitle, h4, .job-search-card__company-name')
        if title_el and comp_el:
            print("  LinkedIn item:", title_el.get_text(strip=True), "at", comp_el.get_text(strip=True))

print("\n--- 3. REMOTIVE / PUBLIC JOBS ---")
res_rem = requests.get("https://remotive.com/api/remote-jobs?category=software-dev&limit=10", headers=headers)
print("Remotive API Status:", res_rem.status_code)
if res_rem.status_code == 200:
    jobs = res_rem.json().get("jobs", [])
    print("Remotive jobs count:", len(jobs))

print("\n--- 4. UNSTOP ---")
unstop_url = "https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&per_page=10&oppstatus=open"
res_un = requests.get(unstop_url, headers=headers)
print("Unstop Status:", res_un.status_code)
if res_un.status_code == 200:
    items = res_un.json().get("data", {}).get("data", [])
    print("Unstop items count:", len(items))

