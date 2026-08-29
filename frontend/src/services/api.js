const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

/**
 * Helper to handle fetch responses safely
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData && errData.detail) {
        errorMessage = errData.detail;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export const api = {
  /**
   * Fetch paginated list of books with optional filters
   */
  async getBooks({ page = 1, limit = 20, genre = '', search = '' } = {}) {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', limit);
    if (genre && genre !== 'All') params.set('genre', genre);
    if (search) params.set('search', search);

    const res = await fetch(`${API_BASE_URL}/books?${params.toString()}`);
    return handleResponse(res);
  },

  /**
   * Search books by keyword query
   */
  async searchBooks(query, limit = 20) {
    if (!query || !query.trim()) return { query: '', count: 0, results: [] };
    const params = new URLSearchParams({ query: query.trim(), limit });
    const res = await fetch(`${API_BASE_URL}/books/search?${params.toString()}`);
    return handleResponse(res);
  },

  /**
   * Retrieve book details by ID
   */
  async getBookDetails(bookId) {
    const res = await fetch(`${API_BASE_URL}/books/${encodeURIComponent(bookId)}`);
    return handleResponse(res);
  },

  /**
   * Retrieve cosine similarity recommendations for a given book
   */
  async getRecommendations(bookId, topN = 5) {
    const params = new URLSearchParams({ top_n: topN });
    const res = await fetch(`${API_BASE_URL}/books/${encodeURIComponent(bookId)}/recommendations?${params.toString()}`);
    return handleResponse(res);
  },

  /**
   * Fetch top popular books
   */
  async getPopular(limit = 10) {
    const params = new URLSearchParams({ limit });
    const res = await fetch(`${API_BASE_URL}/popular?${params.toString()}`);
    return handleResponse(res);
  },

  /**
   * Retrieve all unique genres
   */
  async getGenres() {
    const res = await fetch(`${API_BASE_URL}/genres`);
    return handleResponse(res);
  },

  /**
   * Retrieve backend stats & ML info
   */
  async getStats() {
    const res = await fetch(`${API_BASE_URL}/api/stats`);
    return handleResponse(res);
  }
};
