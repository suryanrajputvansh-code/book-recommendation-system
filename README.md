# Machine Learning Book Recommendation System

An end-to-end, Machine Learning–powered web application that helps users discover books tailored to their interests using **TF-IDF Feature Engineering** and **Cosine Similarity**.

---

# Features

- * Book Search**: Live instant search across catalog titles, authors, genres, and narrative keywords.
- * Book Details**: Rich metadata display including average ratings, review counts, publication year, genres, and synopses.
- * Popular Books**: Bayesian weighted popularity ranking combining community rating and review volume.
- * Personalized Similarity Recommendations**: Dynamic recommendations based on selected titles.
- * Cosine Similarity Engine**: Precomputed vector similarity model with sub-2ms lookup latency.
- * Interactive ML Studio**: Seed book inspector and Top-$N$ tuning sandbox with similarity breakdown.
- * Responsive Web Interface**: Built with React, Vite, and Tailwind CSS.
- * High-Performance REST API**: FastAPI backend with full OpenAPI / Swagger documentation and CORS support.

---

## 📐 Cosine Similarity Mathematical Formulation

The recommendation engine constructs high-dimensional TF-IDF vectors from a weighted metadata soup combining author affinity, genre tags, and synopses:

$$\text{cosine\_similarity}(A, B) = \frac{A \cdot B}{\|A\| \|B\|} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \sqrt{\sum_{i=1}^{n} B_i^2}}$$

Where:
- $A$ and $B$ are the $n$-dimensional TF-IDF vectors of two books.
- The score ranges from `0.0` (dissimilar) to `1.0` (highest similarity).

---

# Project Structure

```
book-recommendation-system/
├── data/
│   └── books.csv                      # Source book catalog dataset (100+ titles)
├── ml/
│   ├── __init__.py
│   ├── prepare_model.py               # Data cleaning & similarity matrix precomputation
│   └── recommender.py                 # Core recommendation engine
├── models/
│   ├── similarity_matrix.npy          # Precomputed pairwise cosine similarity matrix
│   ├── books_cleaned.json             # Serialized cleaned book records
│   ├── tfidf_vectorizer.joblib        # Fitted TF-IDF feature extractor
│   └── feature_metadata.json          # Model metadata & vocabulary telemetry
├── backend/
│   ├── __init__.py
│   ├── app.py                         # FastAPI server with CORS & endpoints
│   ├── config.py                      # App settings & environment configurations
│   ├── models.py                      # Pydantic v2 schemas
│   └── services.py                    # Service layer
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Hero.jsx
│       │   ├── BookCard.jsx
│       │   ├── BookModal.jsx
│       │   ├── CatalogSection.jsx
│       │   ├── PopularSection.jsx
│       │   ├── GenreFilter.jsx
│       │   ├── RecommendationSandbox.jsx
│       │   └── StatsFooter.jsx
│       └── services/
│           └── api.js
├── tests/
│   ├── test_ml.py                     # ML pipeline & recommendation unit tests
│   └── test_api.py                    # FastAPI endpoint integration tests
├── requirements.txt                   # Backend & ML dependencies
└── README.md                          # Documentation
```

---

# Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Install Backend & ML Dependencies
```bash
pip install -r requirements.txt
```

### 3. Generate / Update ML Model Artifacts
```bash
python ml/prepare_model.py
```
This generates the precomputed cosine similarity matrix in `models/`.

### 4. Run the Backend API Server
```bash
python -m uvicorn backend.app:app --host 0.0.0.0 --port 5000 --reload
```
API Documentation will be available at:
- **Interactive Swagger UI**: `http://localhost:5000/docs`
- **ReDoc**: `http://localhost:5000/redoc`

### 5. Run the Frontend Web Application
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

##  Running Tests

Execute the automated test suite with Pytest:
```bash
python -m pytest tests/ -v
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/books` | Retrieve paginated list of books (supports `page`, `limit`, `genre`, `search`) |
| `GET` | `/books/search?query={q}` | Search books by keyword, author, or title |
| `GET` | `/books/{id}` | Retrieve full details for a specific book |
| `GET` | `/books/{id}/recommendations?top_n=5` | Get Top-$N$ similar books using cosine similarity |
| `GET` | `/popular?limit=10` | Get top-rated / popular books |
| `GET` | `/genres` | List all unique genre tags in catalog |
| `GET` | `/api/stats` | Telemetry and ML pipeline statistics |
