import json
import os
import urllib.request
import urllib.parse
import time

data_dir = 'data'
files_to_process = ['estilos.json', 'interiores.json']

def fetch_wikimedia_image(query, limit=3):
    url = 'https://commons.wikimedia.org/w/api.php'
    params = {
        'action': 'query',
        'format': 'json',
        'generator': 'search',
        'gsrsearch': f"filetype:bitmap {query}",
        'gsrnamespace': 6,
        'gsrlimit': limit,
        'prop': 'imageinfo',
        'iiprop': 'url',
        'iiurlwidth': 800  # get a thumbnail url specifically for web usage
    }
    
    query_string = urllib.parse.urlencode(params)
    request_url = f"{url}?{query_string}"
    
    req = urllib.request.Request(request_url, headers={'User-Agent': 'Mozilla/5.0 ARQREFBot'})
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            
            pages = data.get('query', {}).get('pages', {})
            urls = []
            # pages is a dict where keys are page ids
            for page_id in pages:
                imageinfo = pages[page_id].get('imageinfo', [])
                if imageinfo:
                    # we prefer the responsive thumburl if possible
                    thumb_url = imageinfo[0].get('thumburl')
                    orig_url = imageinfo[0].get('url')
                    urls.append(thumb_url if thumb_url else orig_url)
            
            return urls
    except Exception as e:
        print(f"Error fetching for {query}: {e}")
        return []

for filename in files_to_process:
    filepath = os.path.join(data_dir, filename)
    if not os.path.exists(filepath):
        continue
        
    print(f"Processing {filename}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    for item in data:
        name = item.get('nombre', '')
        print(f"  Fetching images for '{name}'...")
        
        # Build query
        query_str = f"{name} architecture" if filename == 'estilos.json' else f"{name} interior design"
        
        # add specific well-known work to the query for better results
        if item.get('obras') and len(item['obras']) > 0:
            obra_name = item['obras'][0].get('nombre', '')
            query_str = f"{obra_name} {name}"

        # wait slightly to respect the API rate limit
        time.sleep(0.5)
        
        img_urls = fetch_wikimedia_image(query_str, limit=3)
        
        # If the specific complex query failed to find 3 images, fallback to simpler name
        if len(img_urls) < 3 and len(query_str.split()) > 2:
            time.sleep(0.5)
            fallback_img_urls = fetch_wikimedia_image(name + (" architecture" if filename == 'estilos.json' else " interior"), limit=3)
            # Merge while preventing duplicates
            for u in fallback_img_urls:
                if u not in img_urls:
                    img_urls.append(u)

        if len(img_urls) > 0:
            item['imagen'] = img_urls[0]
            print(f"    - Updated image 1: {img_urls[0]}")
        if len(img_urls) > 1:
            item['imagen_2'] = img_urls[1]
            print(f"    - Updated image 2: {img_urls[1]}")
        if len(img_urls) > 2:
            item['imagen_3'] = img_urls[2]
            print(f"    - Updated image 3: {img_urls[2]}")
            
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Saved {filename}")

print("Update completed.")
