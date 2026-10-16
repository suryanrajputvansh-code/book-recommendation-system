import re, requests, pandas as pd, time

df = pd.read_csv('data/books.csv')
updated = 0

for idx, row in df.iterrows():
    img = str(row.get('image_url', ''))
    if 'unsplash' in img or not img or img == 'nan':
        title = str(row['title']).strip()
        author = str(row['author']).strip()
        clean_title = re.sub(r'\(.*?\)', '', title).split(':')[0].strip()
        
        url = ''
        try:
            q = f'{clean_title} {author}'
            r = requests.get('https://www.googleapis.com/books/v1/volumes', params={'q': q, 'maxResults': 1}, timeout=5)
            items = r.json().get('items', [])
            if items:
                links = items[0].get('volumeInfo', {}).get('imageLinks', {})
                thumb = links.get('thumbnail') or links.get('smallThumbnail')
                if thumb:
                    url = thumb.replace('http://', 'https://')
        except Exception as e:
            pass
            
        if not url:
            try:
                r = requests.get('https://openlibrary.org/search.json', params={'q': clean_title, 'limit': 1}, timeout=5)
                docs = r.json().get('docs', [])
                if docs and docs[0].get('cover_i'):
                    cid = docs[0]['cover_i']
                    url = f'https://covers.openlibrary.org/b/id/{cid}-L.jpg'
            except Exception as e:
                pass

        if url:
            df.at[idx, 'image_url'] = url
            updated += 1
            print(f'Found: {title}')
        time.sleep(0.1)

df.to_csv('data/books.csv', index=False)
print(f'Done. Updated {updated} books.')
still_missing = df[df['image_url'].str.contains('unsplash', na=False) | df['image_url'].isna()]['title'].tolist()
print(f'Remaining missing ({len(still_missing)}):', still_missing)
