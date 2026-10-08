const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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
  // --- Catalog & Search ---
  async getBooks({ page = 1, limit = 20, genre = '', search = '' } = {}) {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', limit);
    if (genre && genre !== 'All') params.set('genre', genre);
    if (search) params.set('search', search);

    const res = await fetch(`${API_BASE_URL}/books?${params.toString()}`, { credentials: 'include' });
    return handleResponse(res);
  },

  async searchBooks(query, limit = 20) {
    if (!query || !query.trim()) return { query: '', count: 0, results: [] };
    const params = new URLSearchParams({ query: query.trim(), limit });
    const res = await fetch(`${API_BASE_URL}/books/search?${params.toString()}`, { credentials: 'include' });
    return handleResponse(res);
  },

  async getBookDetails(bookId) {
    const res = await fetch(`${API_BASE_URL}/books/${encodeURIComponent(bookId)}`, { credentials: 'include' });
    return handleResponse(res);
  },

  async getRecommendations(bookId, topN = 5) {
    const params = new URLSearchParams({ top_n: topN });
    const res = await fetch(`${API_BASE_URL}/books/${encodeURIComponent(bookId)}/recommendations?${params.toString()}`, { credentials: 'include' });
    return handleResponse(res);
  },

  async getPopular(limit = 10) {
    const params = new URLSearchParams({ limit });
    const res = await fetch(`${API_BASE_URL}/popular?${params.toString()}`, { credentials: 'include' });
    return handleResponse(res);
  },

  async getGenres() {
    const res = await fetch(`${API_BASE_URL}/genres`, { credentials: 'include' });
    return handleResponse(res);
  },

  async getStats() {
    const res = await fetch(`${API_BASE_URL}/api/stats`, { credentials: 'include' });
    return handleResponse(res);
  },

  // --- Auth API ---
  async signup(data) {
    const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async login(data) {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async googleAuth(credential) {
    const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async logout() {
    const res = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      credentials: 'include'
    });
    return handleResponse(res);
  },

  // --- Ratings & Personalization ---
  async getRating(bookId) {
    const res = await fetch(`${API_BASE_URL}/api/books/${encodeURIComponent(bookId)}/rating`, {
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async rateBook(bookId, rating) {
    const res = await fetch(`${API_BASE_URL}/api/books/${encodeURIComponent(bookId)}/rating`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async deleteRating(bookId) {
    const res = await fetch(`${API_BASE_URL}/api/books/${encodeURIComponent(bookId)}/rating`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async getMyRatings() {
    const res = await fetch(`${API_BASE_URL}/api/me/ratings`, {
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async getPersonalizedRecommendations(limit = 6) {
    const params = new URLSearchParams({ limit });
    const res = await fetch(`${API_BASE_URL}/api/recommendations/personalized?${params.toString()}`, {
      credentials: 'include'
    });
    return handleResponse(res);
  }
};
