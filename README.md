# BookWise Curated — ML-Powered Book Recommendation System

An end-to-end, Machine Learning–powered web application that helps users discover books tailored to their interests using **TF-IDF Feature Engineering**, **Pairwise Cosine Similarity**, **Interactive Star Ratings**, and **Full User Authentication** (Email/Password + Google Identity Services).

---

## Key Features

- **Working User Authentication**:
  - Secure Email & Password signup and login with bcrypt hashing (minimum 8 character passwords).
  - Google Identity Services (GIS) Sign-In with server-side ID token verification via `google-auth`.
  - Signed JWT tokens delivered via `httpOnly`, `SameSite=Lax` cookies for secure persistent sessions.
  - Endpoints: `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/google`, `POST /api/auth/logout`, `GET /api/auth/me`.
- **Glassmorphic Navigation Bar**:
  - Sticky header with semi-transparent warm off-white background (78% opacity), `backdrop-filter: blur(12px)`, `-webkit-backdrop-filter`, 1px subtle border, and scroll-responsive shadow.
  - Smooth scrolling to section IDs (`#explore`, `#popular`, `#ml-recommender`) with `scroll-margin-top` to avoid sticky header obscuring section titles.
  - Full URL hash sync on refresh, mobile drawer auto-close on click, and `prefers-reduced-motion` support.
- **Interactive 5-Star Rating System**:
  - SQLite database table (`ratings`) with check constraint (1–5) and unique composite key `(user_id, book_id)`.
  - Accessible five-star control in the Book Modal with hover preview and keyboard support. Clicking your rating again removes it.
  - Automatic sign-in prompt for logged-out users trying to rate.
  - Compact average rating and review counts on each book card.
- **Hybrid Personalized Recommendations**:
  - For users with 3 or more ratings, unrated catalog books are scored by dot-product similarity against rated books weighted by `(rating - 3)`.
  - Liked books (4–5 stars) pull similar books up, while disliked books (1–2 stars) penalize similar books.
  - Dedicated "Recommended For You" section in the catalog for eligible users.
- **Bayesian Weighted Popularity**:
  - Blends community catalog ratings with user ratings using a Bayesian formula so a single 5-star rating cannot artificially inflate rank.
- **Editorial Design System**:
  - Restrained warm neutrals, deep maroon accent (`#7b2f32`), serif headings, 3D book spine highlights, subtle card lift hover transitions, and no AI-template gimmicks.

---

## Environment Variables & Configuration

The application reads secrets and configurations via `backend/config.py` from `.env`. A template is provided in `.env.example`:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
JWT_SECRET=supersecretkey-change-this-in-production-12345
DATABASE_URL=sqlite:///./data/bookwise.db
API_HOST=0.0.0.0
API_PORT=5000
```

### Setting up Google Sign-In
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create an OAuth 2.0 Client ID under **APIs & Services > Credentials**.
3. Add your authorized JavaScript origins (e.g., `http://localhost:5173`, `http://localhost:5000`, or your production deployment URL).
4. Copy your Client ID into `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   ```
5. In `frontend/.env` (or environment variables for Vite), set:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   ```
*Note: Until you provide your Google Client ID, email and password authentication works out of the box.*

### Deployment & Database Persistence (Render Note)
- By default, SQLite stores data locally at `./data/bookwise.db`.
- **Render Free Tier Warning**: SQLite database files on Render's ephemeral free instances reset on each redeploy.
- For persistent production deployments, set `DATABASE_URL` in your hosting dashboard to a hosted PostgreSQL connection string (e.g. Supabase, Neon, or Render PostgreSQL):
  ```env
  DATABASE_URL=postgresql://user:password@hostname:5432/dbname
  ```

---

## Getting Started

### 1. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### 2. Generate / Update ML Model Artifacts
```bash
python ml/prepare_model.py
```

### 3. Run the Backend API Server
```bash
python -m uvicorn backend.app:app --host 0.0.0.0 --port 5000 --reload
```
Swagger UI will be available at `http://localhost:5000/docs`.

### 4. Build or Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
For production build (served directly by FastAPI):
```bash
npm run build
```

---

## Running the Automated Test Suite

Run the full pytest suite (30 automated unit & integration tests):
```bash
pytest -v
```

Tests cover:
- Core ML recommender & vector operations (`tests/test_ml.py`)
- API endpoints & health checks (`tests/test_api.py`)
- User signup, duplicate validation, password length, login, logout, and `/me` cookies (`tests/test_auth.py`)
- Star rating upsert, deletion, range validation, auth requirements, and personalized recommendations (`tests/test_ratings.py`)
