// /src/api/quranBackendApi.js
import { useQuranAuth } from '../contexts/QuranAuthContext';

const API_BASE_URL = import.meta.env.VITE_QURAN_FOUNDATION_API_URL;
const CLIENT_ID = import.meta.env.VITE_QURAN_FOUNDATION_CLIENT_ID;

class QuranBackendApi {
  constructor(getAccessToken) {
    this.getAccessToken = getAccessToken;
  }

  async request(endpoint, options = {}) {
    const accessToken = await this.getAccessToken();
    
    const headers = {
      'Content-Type': 'application/json',
      'x-client-id': CLIENT_ID,
      ...options.headers
    };
    
    if (accessToken) {
      headers['x-auth-token'] = accessToken;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Notes API
  async createNote(data) {
    return this.request('/v1/notes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getNotes() {
    return this.request('/v1/notes');
  }

  async getNote(noteId) {
    return this.request(`/v1/notes/${noteId}`);
  }

  async updateNote(noteId, data) {
    return this.request(`/v1/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteNote(noteId) {
    return this.request(`/v1/notes/${noteId}`, {
      method: 'DELETE'
    });
  }

  async publishNote(noteId) {
    return this.request(`/v1/notes/${noteId}/publish`, {
      method: 'POST'
    });
  }

  // Posts API (public reflections)
  async createPost(data) {
    return this.request('/v1/posts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getPosts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/v1/posts${queryString ? `?${queryString}` : ''}`);
  }

  async getPost(postId) {
    return this.request(`/v1/posts/${postId}`);
  }

  // User API
  async getUserProfile() {
    return this.request('/v1/user/profile');
  }

  async updateUserProfile(data) {
    return this.request('/v1/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
}

// Hook to use the API
export const useQuranBackendApi = () => {
  const { getAccessToken } = useQuranAuth();
  return new QuranBackendApi(getAccessToken);
};

export default QuranBackendApi;