import re, urllib.request, urllib.parse, json, time, pandas as pd

df = pd.read_csv('data/books.csv')

CURATED_FULLTEXT = {
    # Kafka
    "The Metamorphosis": "https://www.gutenberg.org/ebooks/5200",
    "The Trial": "https://www.gutenberg.org/ebooks/7849",
    "The Castle": "https://www.gutenberg.org/ebooks/70417",
    "In the Penal Colony": "https://www.gutenberg.org/ebooks/39870",
    
    # Orwell
    "1984": "https://www.gutenberg.net.au/ebooks01/0100021.txt",
    "Animal Farm": "https://www.gutenberg.net.au/ebooks01/0100011.txt",
    "Homage to Catalonia": "https://www.gutenberg.net.au/ebooks02/0201111.txt",
    "Down and Out in Paris and London": "https://www.gutenberg.net.au/ebooks01/0100171.txt",
    "Burmese Days": "https://www.gutenberg.net.au/ebooks02/0200051.txt",
    
    # Dostoevsky
    "Crime and Punishment": "https://www.gutenberg.org/ebooks/2554",
    "The Brothers Karamazov": "https://www.gutenberg.org/ebooks/28054",
    "Notes from Underground": "https://www.gutenberg.org/ebooks/600",
    "The Idiot": "https://www.gutenberg.org/ebooks/2638",
    "Demons (The Possessed)": "https://www.gutenberg.org/ebooks/8117",
    "White Nights": "https://www.gutenberg.org/ebooks/36034",
    
    # Tech / Open Access Official Releases
    "Structure and Interpretation of Computer Programs (SICP)": "https://mitp-content-server.mit.edu/books/content/sectbyfn/books_pres_0/7773/sicp.zip/index.html",
    "Operating Systems: Three Easy Pieces (OSTEP)": "https://pages.cs.wisc.edu/~remzi/OSTEP/",
    "The Rust Programming Language": "https://doc.rust-lang.org/book/",
    "You Don't Know JS: Scope & Closures": "https://github.com/getify/You-Dont-Know-JS/blob/1st-ed/scope%20%26%20closures/README.md",
    "Deep Learning": "https://www.deeplearningbook.org/",
    "Computer Systems: A Programmer's Perspective (CS:APP)": "http://csapp.cs.cmu.edu/",
    
    # Classics in Gutenberg / Archive
    "Frankenstein": "https://www.gutenberg.org/ebooks/84",
    "The Picture of Dorian Gray": "https://www.gutenberg.org/ebooks/174",
    "Pride and Prejudice": "https://www.gutenberg.org/ebooks/1342",
    "The Great Gatsby": "https://www.gutenberg.org/ebooks/64317",
    "Jane Eyre": "https://www.gutenberg.org/ebooks/1260",
    "Wuthering Heights": "https://www.gutenberg.org/ebooks/768",
    "Meditations": "https://www.gutenberg.org/ebooks/2680",
    "Beyond Good and Evil": "https://www.gutenberg.org/ebooks/4363",
    "Anna Karenina": "https://www.gutenberg.org/ebooks/1399",
    "The Diary of a Young Girl": "https://archive.org/details/TheDiaryOfAYoungGirlAnneFrank",
    "The Catcher in the Rye": "https://archive.org/details/the-catcher-in-the-rye_202206",
    "And Then There Were None": "https://archive.org/details/andthentherewere0000chri_m5x3",
    "The Time Machine": "https://www.gutenberg.org/ebooks/35",
}

read_urls = []
link_types = []

for idx, row in df.iterrows():
    title = str(row['title']).strip()
    author = str(row['author']).strip()
    
    # Check curated first
    if title in CURATED_FULLTEXT:
        read_urls.append(CURATED_FULLTEXT[title])
        link_types.append('fulltext')
        print(f'[{idx+1}/100] [CURATED FULLTEXT] {title}')
        continue
        
    # Check Open Library
    clean_t = re.sub(r'\(.*?\)', '', title).split(':')[0].strip()
    clean_a = author.split(',')[0].strip()
    query_str = urllib.parse.quote(clean_t + ' ' + clean_a)
    ol_url = f'https://openlibrary.org/search.json?q={query_str}&limit=1'
    found_link = None
    
    try:
        req = urllib.request.Request(ol_url, headers={'User-Agent': 'BookWiseCurated/1.0'})
        res = urllib.request.urlopen(req, timeout=6)
        data = json.loads(res.read().decode('utf-8'))
        docs = data.get('docs', [])
        if docs:
            key = docs[0].get('key')
            if key:
                found_link = f'https://openlibrary.org{key}'
    except Exception as e:
        pass
        
    if not found_link:
        q_fallback = urllib.parse.quote(f'{title} {author}')
        found_link = f'https://www.google.com/search?tbm=bks&q={q_fallback}'
        link_types.append('preview')
        print(f'[{idx+1}/100] [GB SEARCH FALLBACK] {title}')
    else:
        link_types.append('preview')
        print(f'[{idx+1}/100] [OPEN LIBRARY] {title} -> {found_link}')
        
    read_urls.append(found_link)
    time.sleep(0.35)

df['read_url'] = read_urls
df['link_type'] = link_types

df.to_csv('data/books.csv', index=False)
print('\nDONE! Summary:')
print('Total books:', len(df))
print('Full text links:', (df['link_type'] == 'fulltext').sum())
print('Preview/Library links:', (df['link_type'] == 'preview').sum())
print('Unresolved (empty):', (df['read_url'].isna() | (df['read_url'] == '')).sum())
