import requests
import os

def save_sample_html():
    # Sample URL for Brock's team page
    url = "https://usportshoops.ca/history/teamseason.php?Gender=WBB&Season=2024-25&Team=Brock"
    
    # Get the page content
    response = requests.get(url)
    
    # Save to file
    with open('sample_team_page.html', 'w', encoding='utf-8') as f:
        f.write(response.text)
        
    print("Sample HTML saved to sample_team_page.html")

if __name__ == "__main__":
    save_sample_html() 