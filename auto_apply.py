import os
import subprocess
import sys

def run_cmd(cmd):
    print(f"👉 Running: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"⚠️ Warning: {result.stderr}")
    else:
        print(f"✅ Success")
    return result

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Updated {path}")

print("🚀 Starting BookWise Automated Fixes...")

# 1. Fix Backend ML (12 Genres)
rec_path = 'ml/recommender.py'
if os.path.exists(rec_path):
    with open(rec_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    normalize_method = '''
    def _normalize_genres(self, raw_genres_str: str) -> str:
        if not raw_genres_str: return "Classic Literature"
        raw_genres = [g.strip().lower() for g in raw_genres_str.split(",")]
        normalized = set()
        for g in raw_genres:
            if any(x in g for x in ["science fiction", "sci-fi", "space opera", "cyberpunk", "alien", "hard sci-fi", "dystopian"]): normalized.add("Science Fiction")
            elif any(x in g for x in ["fantasy", "magic", "epic fantasy", "high fantasy", "mythology"]): normalized.add("Fantasy")
            elif any(x in g for x in ["mystery", "thriller", "crime", "suspense", "noir", "whodunit", "detective"]): normalized.add("Mystery & Thriller")
            elif any(x in g for x in ["classic", "literature", "novella"]): normalized.add("Classic Literature")
            elif any(x in g for x in ["historical", "history"]): normalized.add("Historical Fiction")
            elif any(x in g for x in ["romance", "love", "lgbtq+"]): normalized.add("Romance")
            elif any(x in g for x in ["horror", "gothic", "absurdist"]): normalized.add("Horror & Gothic")
            elif any(x in g for x in ["young adult", "ya", "coming-of-age"]): normalized.add("Young Adult")
            elif any(x in g for x in ["computer science", "programming", "software", "tech", "technology", "algorithms", "data", "machine learning", "artificial intelligence"]): normalized.add("Technology & Programming")
            elif any(x in g for x in ["self-help", "productivity", "personal growth", "habits", "finance", "economics"]): normalized.add("Self-Help & Productivity")
            elif any(x in g for x in ["philosophy", "psychology", "stoicism", "behavioral", "anthropology", "science"]): normalized.add("Philosophy & Psychology")
            elif any(x in g for x in ["non-fiction", "memoir", "biography", "letters"]): normalized.add("Non-Fiction")
            else: normalized.add("Classic Literature")
        return ", ".join(sorted(list(normalized)))
'''
    if '_normalize_genres' not in content:
        content = content.replace('    def _load_or_train', normalize_method + '\n    def _load_or_train')
    
    target_load = 'self.books = json.load(f)'
    replacement_load = '''self.books = json.load(f)

        # Normalize genres to exactly 12 canonical categories
        for book in self.books:
            book["genres"] = self._normalize_genres(book.get("genres", ""))'''
    
    if 'Normalize genres to exactly 12' not in content:
        content = content.replace(target_load, replacement_load)

    write_file(rec_path, content)

# 2. Create AuthModal.jsx
auth_modal = '''import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }
      onAuthSuccess({ name: isLogin ? formData.email.split('@')[0] : formData.name, email: formData.email });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-paper-50 rounded-xl shadow-2xl border border-paper-300 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-paper-200">
          <h2 className="text-xl display-font font-bold text-ink-900">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-paper-200 text-muted hover:text-ink-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">{error}</div>}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-paper pl-10" placeholder="John Doe" />
              </div>
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-paper pl-10" placeholder="you@example.com" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-paper pl-10" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
          <div className="text-center pt-2">
            <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-accent hover:text-accent-dark font-semibold transition-colors">
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}'''
write_file('frontend/src/components/AuthModal.jsx', auth_modal)

# 3. Update Navbar.jsx
navbar = '''import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Compass, Flame, User, LogOut } from 'lucide-react';
import AuthModal from './AuthModal';

export default function Navbar({ activeTab, setActiveTab }) {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('bookwise_user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('bookwise_user');
    setUser(null);
  };

  const handleAuthSuccess = (userData) => {
    localStorage.setItem('bookwise_user', JSON.stringify(userData));
    setUser(userData);
    setShowAuthModal(false);
  };

  const navItems = [
    { id: 'explore', label: 'Explore Catalog', icon: Compass },
    { id: 'popular', label: 'Popular & Top Rated', icon: Flame },
    { id: 'ml-recommender', label: 'ML Recommender', icon: Sparkles },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-paper-50/95 backdrop-blur-md border-b border-paper-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('explore')}>
              <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl display-font font-bold text-ink-900 tracking-tight leading-none">BookWise</span>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted mt-0.5">Curated Discovery</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 pb-1 text-[14px] font-semibold transition-all duration-200 border-b-2 ${isActive ? 'border-accent text-ink-900' : 'border-transparent text-ink-500 hover:text-ink-800 hover:border-paper-400'}`}>
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-semibold text-ink-900">{user.name}</span>
                    <span className="text-[11px] text-muted">{user.email}</span>
                  </div>
                  <button onClick={handleLogout} className="p-2 rounded-full hover:bg-paper-200 text-ink-600 hover:text-ink-900 transition-colors" title="Logout">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-2 px-4 py-2 bg-ink-900 text-paper-50 text-sm font-semibold rounded-md hover:bg-ink-800 transition-colors shadow-sm">
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="md:hidden flex items-center justify-around border-t border-paper-200 bg-paper-50 px-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${isActive ? 'text-accent bg-accent/10' : 'text-ink-400 hover:text-ink-700'}`}>
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
          <button onClick={() => user ? handleLogout() : setShowAuthModal(true)} className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-ink-400 hover:text-ink-700">
            {user ? <LogOut className="w-5 h-5" /> : <User className="w-5 h-5" />}
            <span className="text-[10px] font-bold uppercase tracking-wider">{user ? 'Logout' : 'Sign In'}</span>
          </button>
        </div>
      </header>
      {showAuthModal && !user && <AuthModal onClose={() => setShowAuthModal(false)} onAuthSuccess={handleAuthSuccess} />}
    </>
  );
}'''
write_file('frontend/src/components/Navbar.jsx', navbar)

# 4. Update Hero.jsx
hero = '''import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, BookOpen, X, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function Hero({ onSearchSubmit, onSelectBook, onSelectGenre }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) { setSuggestions([]); setIsOpen(false); return; }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await api.searchBooks(query, 6);
        setSuggestions(data.results || []);
        setIsOpen(true);
      } catch (err) { console.error('Autocomplete error:', err); } 
      finally { setIsLoading(false); }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFormSubmit = (e) => { e.preventDefault(); setIsOpen(false); onSearchSubmit(query); };
  const quickPills = ['Science Fiction', 'Fantasy', 'Mystery & Thriller', 'Classic Literature', 'Technology & Programming', 'Philosophy & Psychology'];

  return (
    <div className="pt-20 pb-16 md:pt-28 md:pb-24 border-b border-paper-300 bg-gradient-to-b from-paper-50 to-transparent">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="eyebrow mb-6 flex items-center justify-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Curated Discovery</div>
        <h1 className="editorial-title mb-5">Find your next profound read.</h1>
        <p className="editorial-subtitle max-w-2xl mx-auto mb-10">Powered by a semantic similarity engine analyzing authors, themes, and narrative style.</p>

        <div ref={dropdownRef} className="relative max-w-xl mx-auto mb-8 text-left">
          <form onSubmit={handleFormSubmit} className="relative flex items-center shadow-lg shadow-ink-900/5">
            <div className="absolute left-5 text-muted pointer-events-none flex items-center justify-center h-full"><Search className="w-5 h-5" /></div>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, author, or keyword..."
              className="input-paper w-full text-base sm:text-lg"
              style={{ paddingLeft: '52px', paddingRight: '110px', paddingTop: '16px', paddingBottom: '16px', borderRadius: '8px' }} />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setSuggestions([]); }} className="absolute right-[90px] text-muted hover:text-ink-900 p-1.5 rounded-full hover:bg-paper-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
            <button type="submit" className="absolute right-2 btn-primary" style={{ minHeight: '44px', borderRadius: '6px' }}>Search</button>
          </form>

          {isOpen && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-paper-50 border border-paper-300 rounded-lg shadow-xl overflow-hidden z-50">
              <div className="p-2 divide-y divide-paper-200">
                {suggestions.map((book) => (
                  <div key={book.id} onClick={() => { setIsOpen(false); onSelectBook(book); }} className="p-3 hover:bg-paper-100 cursor-pointer flex items-center justify-between transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-14 book-cover flex-shrink-0">
                        {book.image_url ? <img src={book.image_url} alt={book.title} /> : <div className="w-full h-full flex items-center justify-center text-muted bg-paper-200"><BookOpen className="w-4 h-4" /></div>}
                      </div>
                      <div>
                        <div className="font-semibold text-ink-900 text-sm group-hover:text-accent transition-colors">{book.title}</div>
                        <div className="text-xs text-ink-500 mt-0.5">{book.author}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-paper-400 group-hover:text-accent transition-all" />
                  </div>
                ))}
              </div>
              <div onClick={handleFormSubmit} className="bg-paper-100 p-2.5 text-center text-xs text-ink-600 hover:text-ink-900 cursor-pointer font-bold uppercase tracking-wider border-t border-paper-300">View all results</div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <span className="editorial-label mr-2">Trending:</span>
          {quickPills.map((genre) => (
            <button key={genre} onClick={() => onSelectGenre(genre)} className="text-[12px] font-medium text-ink-600 hover:text-accent underline decoration-paper-400 underline-offset-4 hover:decoration-accent transition-colors">{genre}</button>
          ))}
        </div>
      </div>
    </div>
  );
}'''
write_file('frontend/src/components/Hero.jsx', hero)

# 5. Update index.html (Fonts)
html_path = 'frontend/index.html'
if os.path.exists(html_path):
    with open(html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    font_link = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">'
    if 'Playfair+Display' not in html_content:
        html_content = html_content.replace('</head>', f'    {font_link}\n  </head>')
        write_file(html_path, html_content)

# 6. Update index.css (Typography)
css_path = 'frontend/src/index.css'
if os.path.exists(css_path):
    with open(css_path, 'r', encoding='utf-8') as f:
        css_content = f.read()
    
    css_content = css_content.replace(
        'font-family:\n      Inter,\n      ui-sans-serif,',
        "font-family: 'Inter', ui-sans-serif,"
    ).replace(
        'font-family:\n      Georgia,\n      "Times New Roman", serif;',
        "font-family: 'Playfair Display', Georgia, \"Times New Roman\", serif;"
    )
    write_file(css_path, css_content)

# 7. Clean old models so they regenerate with 12 genres
for f in ['models/similarity_matrix.npy', 'models/books_cleaned.json']:
    if os.path.exists(f):
        os.remove(f)
        print(f"🗑️ Deleted {f} (will regenerate with 12 genres on next backend start)")

# 8. Git Commit and Push
print("\n🚀 Committing and pushing to GitHub...")
run_cmd("git add .")
run_cmd('git commit -m "Fix: 12 Genres, Auth UI, Nav/Search Alignment, Modern Typography"')
run_cmd("git push")

print("\n🎉 ALL DONE! The script has updated your files and pushed to GitHub.")
print("Vercel will automatically redeploy. Give it 1-2 minutes, then hard refresh (Ctrl+F5) your live site!")