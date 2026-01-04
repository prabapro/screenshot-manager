// src/services/api.js

import { getAuthHeader, removeToken, removeUser } from '@utils/auth';

// API base URL - use environment variable or default to current origin
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || window.location.origin;

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/api/screenshots')
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth header if not login endpoint
    if (!endpoint.includes('/login')) {
      const authHeader = getAuthHeader();
      if (authHeader) {
        headers.Authorization = authHeader;
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - clear auth and redirect to login
    if (response.status === 401) {
      removeToken();
      removeUser();
      window.location.href = '/login';
      throw new ApiError('Unauthorized', 401, null);
    }

    // Parse response
    const data = await response.json();

    // Handle non-2xx responses
    if (!response.ok) {
      throw new ApiError(
        data.error || 'Request failed',
        response.status,
        data.details || null,
      );
    }

    return data;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Wrap other errors
    throw new ApiError(
      error.message || 'Network error',
      0,
      error.stack || null,
    );
  }
}

/**
 * API methods
 */
export const api = {
  // Auth endpoints
  auth: {
    /**
     * Login
     * @param {string} username
     * @param {string} password
     * @returns {Promise<Object>} { token, username, expiresIn }
     */
    async login(username, password) {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      return response.data;
    },

    /**
     * Logout
     * @returns {Promise<Object>}
     */
    async logout() {
      const response = await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
      return response.data;
    },
  },

  // Screenshots endpoints
  screenshots: {
    /**
     * Get all screenshots
     * @returns {Promise<Object>} { screenshots, count, truncated }
     */
    async list() {
      const response = await apiRequest('/api/screenshots', {
        method: 'GET',
      });
      return response.data;
    },

    /**
     * Get screenshot details
     * @param {string} key - Screenshot key
     * @returns {Promise<Object>} Screenshot object
     */
    async get(key) {
      const response = await apiRequest(
        `/api/screenshots/${encodeURIComponent(key)}`,
        {
          method: 'GET',
        },
      );
      return response.data;
    },

    /**
     * Update screenshot metadata
     * @param {string} key - Screenshot key
     * @param {Object} metadata - Metadata object
     * @returns {Promise<Object>} Updated screenshot object
     */
    async updateMetadata(key, metadata) {
      const response = await apiRequest(
        `/api/screenshots/${encodeURIComponent(key)}/metadata`,
        {
          method: 'PATCH',
          body: JSON.stringify(metadata),
        },
      );
      return response.data;
    },

    /**
     * Delete screenshot metadata
     * @param {string} key - Screenshot key
     * @returns {Promise<Object>}
     */
    async deleteMetadata(key) {
      const response = await apiRequest(
        `/api/screenshots/${encodeURIComponent(key)}/metadata`,
        {
          method: 'DELETE',
        },
      );
      return response.data;
    },

    /**
     * Delete screenshot
     * @param {string} key - Screenshot key
     * @returns {Promise<Object>}
     */
    async delete(key) {
      const response = await apiRequest(
        `/api/screenshots/${encodeURIComponent(key)}`,
        {
          method: 'DELETE',
        },
      );
      return response.data;
    },
  },
};
