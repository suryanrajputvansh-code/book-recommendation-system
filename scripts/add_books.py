"""
Validation + 15-book append script for BookWise catalog.
Run from the project root:  python scripts/add_books.py
"""
import csv, re, sys, os

CSV_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'books.csv')

FIELDNAMES = ['book_id', 'title', 'author', 'genres', 'rating',
              'ratings_count', 'publication_year', 'image_url', 'description']

# 15 new books — real titles, original descriptions, only the 12 core genres.
# We deliberately spread them across under-represented genres: Romance, Mystery,
# Biography, Non-Fiction, Thriller, Historical Fiction.
NEW_BOOKS = [
    # --- Romance (0 currently) ---
    {
        'book_id': '201',
        'title': 'Rebecca',
        'author': 'Daphne du Maurier',
        'genres': 'Classic, Mystery, Thriller',
        'rating': '4.22',
        'ratings_count': '420000',
        'publication_year': '1938',
        'image_url': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=60',
        'description': 'A young woman marries the wealthy widower Maxim de Winter and moves into his grand estate Manderley, only to feel overshadowed by the memory of his first wife. As secrets buried in the house begin to surface, the narrator must reckon with a past far darker than she imagined.',
    },
    {
        'book_id': '202',
        'title': 'Jane Eyre',
        'author': 'Charlotte Brontë',
        'genres': 'Romance, Classic',
        'rating': '4.13',
        'ratings_count': '1600000',
        'publication_year': '1847',
        'image_url': 'https://images.unsplash.com/photo-1533709752211-118fcaf03312?w=500&auto=format&fit=crop&q=60',
        'description': "Orphaned Jane Eyre finds work as a governess at Thornfield Hall and falls in love with its brooding owner, Mr. Rochester — only to discover a terrible secret locked in the attic. The novel explores moral independence, class injustice, and what it means for a woman to forge her own identity.",
    },
    {
        'book_id': '203',
        'title': 'Wuthering Heights',
        'author': 'Emily Brontë',
        'genres': 'Romance, Classic',
        'rating': '3.86',
        'ratings_count': '1300000',
        'publication_year': '1847',
        'image_url': 'https://images.unsplash.com/photo-1476275466078-4cdc8f858d1e?w=500&auto=format&fit=crop&q=60',
        'description': 'Heathcliff, a foundling taken in by the Earnshaw family, and Catherine, the daughter he loves, are torn apart by class and circumstance on the Yorkshire moors. Their thwarted obsession twists across two generations, making Wuthering Heights one of literature\'s most unsettling love stories.',
    },
    # --- Biography ---
    {
        'book_id': '204',
        'title': 'Steve Jobs',
        'author': 'Walter Isaacson',
        'genres': 'Biography, Non-Fiction',
        'rating': '4.17',
        'ratings_count': '680000',
        'publication_year': '2011',
        'image_url': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&auto=format&fit=crop&q=60',
        'description': "Based on over forty interviews with Jobs himself, this biography traces the mercurial genius who co-founded Apple, was ousted from it, and returned to build the most valuable company on earth. Isaacson examines how Jobs's obsession with beauty and perfectionism shaped the products that redefined entire industries.",
    },
    {
        'book_id': '205',
        'title': 'The Diary of a Young Girl',
        'author': 'Anne Frank',
        'genres': 'Biography, Historical Fiction, Non-Fiction',
        'rating': '4.18',
        'ratings_count': '3100000',
        'publication_year': '1947',
        'image_url': 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=500&auto=format&fit=crop&q=60',
        'description': "Written while hiding with her family in a concealed apartment in Nazi-occupied Amsterdam, Anne Frank's diary captures the interior life of a perceptive teenager confronting fear, boredom, and the desire to matter in the world. It remains one of the most widely read first-person accounts of the Holocaust.",
    },
    {
        'book_id': '206',
        'title': 'Educated',
        'author': 'Tara Westover',
        'genres': 'Biography, Non-Fiction',
        'rating': '4.47',
        'ratings_count': '960000',
        'publication_year': '2018',
        'image_url': 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=500&auto=format&fit=crop&q=60',
        'description': "Tara Westover grew up in rural Idaho under a survivalist father who kept his children out of school and off the grid. Through self-study she eventually earned a Cambridge PhD, yet her memoir is less about education's triumph than about the cost of separating oneself from family and the stories we were given.",
    },
    # --- Historical Fiction ---
    {
        'book_id': '207',
        'title': 'The Pillars of the Earth',
        'author': 'Ken Follett',
        'genres': 'Historical Fiction',
        'rating': '4.33',
        'ratings_count': '730000',
        'publication_year': '1989',
        'image_url': 'https://images.unsplash.com/photo-1548625149-720754952a04?w=500&auto=format&fit=crop&q=60',
        'description': 'Set in twelfth-century England, this epic follows the construction of a cathedral in the fictional town of Kingsbridge amid war, treachery, and religious conflict. Follett weaves together generations of characters — builders, priests, nobles, and outlaws — into a vast narrative about ambition and faith.',
    },
    {
        'book_id': '208',
        'title': 'Wolf Hall',
        'author': 'Hilary Mantel',
        'genres': 'Historical Fiction',
        'rating': '3.90',
        'ratings_count': '300000',
        'publication_year': '2009',
        'image_url': 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop&q=60',
        'description': "Hilary Mantel's Booker Prize–winning novel inhabits the mind of Thomas Cromwell as he navigates the lethal politics of Henry VIII's court. Told in intimate, present-tense prose, it reimagines Tudor power as a chess game in which one wrong move means death.",
    },
    {
        'book_id': '209',
        'title': 'Anna Karenina',
        'author': 'Leo Tolstoy',
        'genres': 'Classic, Romance, Historical Fiction',
        'rating': '4.02',
        'ratings_count': '560000',
        'publication_year': '1878',
        'image_url': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&auto=format&fit=crop&q=60',
        'description': "Tolstoy traces the parallel stories of Anna Karenina — whose passionate affair with Count Vronsky leads to social ruin — and the landowner Levin, whose quiet search for meaning and moral purpose offers a counterweight to Anna's tragedy. The novel is a vast portrait of Russian society and the price of living honestly.",
    },
    # --- Non-Fiction ---
    {
        'book_id': '210',
        'title': 'Outliers: The Story of Success',
        'author': 'Malcolm Gladwell',
        'genres': 'Non-Fiction',
        'rating': '3.97',
        'ratings_count': '1200000',
        'publication_year': '2008',
        'image_url': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500&auto=format&fit=crop&q=60',
        'description': "Gladwell argues that exceptional achievement is less about raw talent than about timing, cultural legacy, and ten thousand hours of deliberate practice. He draws on hockey leagues, Beatles gigs, and software billionaires to show that the stories we tell about success systematically erase the conditions that made it possible.",
    },
    # --- Mystery / Thriller ---
    {
        'book_id': '211',
        'title': 'The Girl on the Train',
        'author': 'Paula Hawkins',
        'genres': 'Mystery, Thriller',
        'rating': '3.88',
        'ratings_count': '2200000',
        'publication_year': '2015',
        'image_url': 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=500&auto=format&fit=crop&q=60',
        'description': "Rachel Watson rides the same commuter train every morning and has grown obsessed with a couple she watches from the window — until the woman disappears. Told by three narrators whose accounts contradict each other, the novel turns unreliable memory itself into a kind of mystery.",
    },
    {
        'book_id': '212',
        'title': 'The Shadow of the Wind',
        'author': 'Carlos Ruiz Zafón',
        'genres': 'Mystery, Historical Fiction',
        'rating': '4.23',
        'ratings_count': '650000',
        'publication_year': '2001',
        'image_url': 'https://images.unsplash.com/photo-1470790376778-a9fbc86d70e2?w=500&auto=format&fit=crop&q=60',
        'description': 'In post-war Barcelona, a young boy discovers a novel by the forgotten author Julián Carax, only to find that someone is systematically destroying every copy of his work. The search for Carax becomes an obsession that entwines two lives across decades of love, war, and literary mystery.',
    },
    {
        'book_id': '213',
        'title': 'Big Little Lies',
        'author': 'Liane Moriarty',
        'genres': 'Mystery, Thriller',
        'rating': '4.11',
        'ratings_count': '880000',
        'publication_year': '2014',
        'image_url': 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=500&auto=format&fit=crop&q=60',
        'description': "Three women at a primary school trivia night — a murder has occurred, but the question is who did it and who deserved it. Moriarty's novel skewers the performance of perfect suburban life while building genuine tension about the violence hidden beneath it.",
    },
    # --- Philosophy ---
    {
        'book_id': '214',
        'title': 'Beyond Good and Evil',
        'author': 'Friedrich Nietzsche',
        'genres': 'Philosophy, Non-Fiction',
        'rating': '4.05',
        'ratings_count': '140000',
        'publication_year': '1886',
        'image_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60',
        'description': "Nietzsche turns his critical eye on the philosophical tradition itself, arguing that conventional morality is a form of herd instinct that suppresses genuine greatness. The book challenges the reader to question the assumptions underlying concepts of good, evil, truth, and the will to power.",
    },
    # --- Fantasy ---
    {
        'book_id': '215',
        'title': 'The Night Circus',
        'author': 'Erin Morgenstern',
        'genres': 'Fantasy, Romance',
        'rating': '4.04',
        'ratings_count': '920000',
        'publication_year': '2011',
        'image_url': 'https://images.unsplash.com/photo-1580196969807-cc6de06c05be?w=500&auto=format&fit=crop&q=60',
        'description': "Two young magicians, Celia and Marco, are trained since childhood as competitors in a mysterious game that plays out inside a magical black-and-white circus that appears only at night. As they fall in love, they realise the game has rules neither of them were told and a cost neither anticipated.",
    },
]



def normalize(s):
    """Lowercase, strip punctuation and common leading articles for dedup."""
    s = s.lower().strip()
    s = re.sub(r'^(the|a|an)\s+', '', s)
    s = re.sub(r'[^\w\s]', '', s)
    return ' '.join(s.split())


def main():
    # ── Read existing books ──────────────────────────────────────────────────
    existing = []
    with open(CSV_PATH, encoding='utf-8', newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            existing.append(row)

    print(f"Existing books: {len(existing)}")

    existing_ids = {row['book_id'] for row in existing}
    existing_titles = {normalize(row['title']) for row in existing}
    existing_title_author = {(normalize(row['title']), normalize(row['author'])) for row in existing}

    # ── Validate new books for duplicates ────────────────────────────────────
    for nb in NEW_BOOKS:
        assert nb['book_id'] not in existing_ids, f"Duplicate ID: {nb['book_id']}"
        assert normalize(nb['title']) not in existing_titles, f"Duplicate title: {nb['title']}"
        assert (normalize(nb['title']), normalize(nb['author'])) not in existing_title_author, \
            f"Duplicate title+author: {nb['title']} by {nb['author']}"
        for field in FIELDNAMES:
            assert field in nb and nb[field].strip(), f"Missing field '{field}' in {nb['title']}"

    print(f"New books validated (no duplicates): {len(NEW_BOOKS)}")

    # ── Write combined CSV ────────────────────────────────────────────────────
    all_books = existing + NEW_BOOKS
    with open(CSV_PATH, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(all_books)

    print(f"Written {len(all_books)} books to {CSV_PATH}")

    # ── Final validation ──────────────────────────────────────────────────────
    with open(CSV_PATH, encoding='utf-8', newline='') as f:
        reader = csv.DictReader(f)
        final = list(reader)

    assert len(final) == 100, f"Expected 100 books, got {len(final)}"

    ids = [r['book_id'] for r in final]
    assert len(ids) == len(set(ids)), "Duplicate book_ids found!"

    ta_pairs = [(normalize(r['title']), normalize(r['author'])) for r in final]
    assert len(ta_pairs) == len(set(ta_pairs)), "Duplicate title+author pairs found!"

    for r in final:
        for field in FIELDNAMES:
            assert r.get(field, '').strip(), f"Empty field '{field}' in book_id={r['book_id']}"

    # Genre counts
    genre_counts = {}
    for r in final:
        for g in r['genres'].split(','):
            g = g.strip()
            if g:
                genre_counts[g] = genre_counts.get(g, 0) + 1
    total_genre_entries = sum(genre_counts.values())

    print()
    print("=== VALIDATION PASSED ===")
    print(f"  Total books : {len(final)}")
    print(f"  Unique IDs  : {len(set(ids))}")
    print(f"  Unique title+author pairs: {len(set(ta_pairs))}")
    print(f"  Unique genres: {len(genre_counts)}")
    print(f"  Genre breakdown:")
    for g, c in sorted(genre_counts.items(), key=lambda x: -x[1]):
        print(f"    {g}: {c}")


if __name__ == '__main__':
    main()
