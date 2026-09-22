import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.config import settings
from backend.models import (
    BookBase,
    BookDetail,
    PaginatedBooksResponse,
    SearchResponse,
    RecommendationResponse,
    PopularBooksResponse,
    SystemStatsResponse
)
from backend.services import RecommenderService

FRONTEND_DIST_DIR = os.path.join(BASE_DIR, "frontend", "dist")


@asynccontextmanager
async def lifespan(app: FastAPI):
    
    try:
        RecommenderService.get_instance()
        print("[+] Backend RecommenderService successfully initialized.")
    except Exception as e:
        print(f"[!] Warning during service initialization: {e}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Machine Learning–powered Book Recommendation Engine with Cosine Similarity",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/api/health", tags=["Health & Status"])
def health():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs"
    }


@app.get("/api/stats", response_model=SystemStatsResponse, tags=["Health & Status"])
def get_stats():
    service = RecommenderService.get_instance()
    return service.get_stats()


@app.get("/genres", tags=["Catalog"])
@app.get("/api/genres", tags=["Catalog"])
def get_genres():
    service = RecommenderService.get_instance()
    return {"genres": service.get_genres()}


@app.get("/books", response_model=PaginatedBooksResponse, tags=["Catalog"])
@app.get("/api/books", response_model=PaginatedBooksResponse, tags=["Catalog"])
def get_books(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    genre: str = Query(None, description="Filter by genre"),
    search: str = Query(None, description="Search query")
):
    service = RecommenderService.get_instance()
    return service.get_books(page=page, limit=limit, genre=genre, search=search)


@app.get("/books/search", response_model=SearchResponse, tags=["Search"])
@app.get("/api/books/search", response_model=SearchResponse, tags=["Search"])
def search_books(
    query: str = Query(..., min_length=1, description="Search keyword for title, author, or genre"),
    limit: int = Query(20, ge=1, le=100, description="Max search results to return")
):
    service = RecommenderService.get_instance()
    results = service.search_books(query=query, limit=limit)
    return {
        "query": query,
        "count": len(results),
        "results": results
    }


@app.get("/popular", response_model=PopularBooksResponse, tags=["Recommendations"])
@app.get("/api/popular", response_model=PopularBooksResponse, tags=["Recommendations"])
def get_popular(
    limit: int = Query(10, ge=1, le=50, description="Number of popular books to return")
):
    service = RecommenderService.get_instance()
    popular = service.get_popular_books(limit=limit)
    return {
        "count": len(popular),
        "popular_books": popular
    }


@app.get("/books/{book_id}", response_model=BookBase, tags=["Catalog"])
@app.get("/api/books/{book_id}", response_model=BookBase, tags=["Catalog"])
def get_book_details(
    book_id: str = Path(..., description="ID of the book")
):
    service = RecommenderService.get_instance()
    book = service.get_book_by_id(book_id)
    if not book:
        raise HTTPException(
            status_code=404,
            detail=f"Book with ID '{book_id}' was not found in the catalog."
        )
    return book


@app.get("/books/{book_id}/recommendations", response_model=RecommendationResponse, tags=["Recommendations"])
@app.get("/api/books/{book_id}/recommendations", response_model=RecommendationResponse, tags=["Recommendations"])
def get_book_recommendations(
    book_id: str = Path(..., description="ID of the seed book for recommendations"),
    top_n: int = Query(5, ge=1, le=30, description="Number of similar books to return")
):
    service = RecommenderService.get_instance()
    source_book = service.get_book_by_id(book_id)
    if not source_book:
        raise HTTPException(
            status_code=404,
            detail=f"Book with ID '{book_id}' was not found. Cannot generate recommendations."
        )

    rec_data = service.get_recommendations(book_id=book_id, top_n=top_n)
    return rec_data



if os.path.exists(FRONTEND_DIST_DIR):

    assets_dir = os.path.join(FRONTEND_DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/", include_in_schema=False)
    async def serve_frontend_root():
        index_file = os.path.join(FRONTEND_DIST_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "Frontend build not found. Run 'npm run build' in frontend directory."}

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend_fallback(full_path: str):
       
        if full_path.startswith(("api", "docs", "redoc", "openapi.json")):
            raise HTTPException(status_code=404, detail="Not found")
        file_path = os.path.join(FRONTEND_DIST_DIR, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(FRONTEND_DIST_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Resource not found")
else:
    @app.get("/", tags=["Health & Status"])
    def root():
        return {
            "status": "online",
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "docs_url": "/docs",
            "frontend_status": "Not built yet. Run 'npm run build' in frontend/ to serve frontend directly."
        }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app:app", host=settings.HOST, port=settings.PORT, reload=True)
