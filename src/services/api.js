// API base URL - will use environment variable in production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Socket URL - will use environment variable in production
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.requestCache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
    this.lastRequestTime = 0;
    this.minRequestInterval = 100; // Minimum 100ms between requests
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Throttle requests to prevent 429 errors
  async throttleRequest() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  // Get cached response if available and not expired
  getCachedResponse(endpoint) {
    const cached = this.requestCache.get(endpoint);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  // Cache response
  setCachedResponse(endpoint, data) {
    this.requestCache.set(endpoint, {
      data,
      timestamp: Date.now()
    });
  }

  // Clear cache for specific endpoint or all
  clearCache(endpoint = null) {
    if (endpoint) {
      this.requestCache.delete(endpoint);
    } else {
      this.requestCache.clear();
    }
  }

  // Exponential backoff for retries
  async retryWithBackoff(fn, maxRetries = 3) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (error.message?.includes('429') && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  }

  async request(endpoint, options = {}) {
    // Check cache first for GET requests
    if (options.method === 'GET' || !options.method) {
      const cached = this.getCachedResponse(endpoint);
      if (cached) {
        console.log('Using cached response for:', endpoint);
        return cached;
      }
    }

    return this.retryWithBackoff(async () => {
      await this.throttleRequest();
      
      const url = `${API_BASE_URL}${endpoint}`;
      const config = {
        headers: this.getHeaders(),
        ...options,
      };

      try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
          }
          throw new Error(data.message || 'API request failed');
        }

        // Cache successful GET responses
        if (options.method === 'GET' || !options.method) {
          this.setCachedResponse(endpoint, data);
        }

        return data;
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    });
  }

  // User APIs
  async registerUser(userData) {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getAllUsers() {
    return this.request('/users');
  }

  async getUserById(userId) {
    return this.request(`/users/${userId}`);
  }

  async updateOnlineStatus(isOnline) {
    return this.request('/users/online', {
      method: 'PUT',
      body: JSON.stringify({ isOnline }),
    });
  }

  // Friend Request APIs
  async sendFriendRequest(toUserId) {
    return this.request('/friend-requests', {
      method: 'POST',
      body: JSON.stringify({ toUserId }),
    });
  }

  async getFriendRequests() {
    return this.request('/friend-requests');
  }

  async getPendingFriendRequests() {
    return this.request('/friend-requests/pending');
  }

  async respondToFriendRequest(requestId, status) {
    return this.request(`/friend-requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Chat APIs
  async getChats() {
    return this.request('/chats');
  }

  async getChatById(chatId) {
    return this.request(`/chats/${chatId}`);
  }

  async sendMessage(chatId, content, type = 'text') {
    // Clear chat cache when sending a message
    this.clearCache('/chats');
    this.clearCache(`/chats/${chatId}`);
    
    return this.request(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, type }),
    });
  }

  async updateMessageStatus(chatId, messageId, status) {
    return this.request(`/chats/${chatId}/messages/${messageId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();
