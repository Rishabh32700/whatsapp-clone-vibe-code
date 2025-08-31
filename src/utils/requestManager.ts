// Request Manager Utility
// Helps manage API request patterns to prevent 429 errors

type RequestConfig = {
  endpoint: string;
  method?: string;
  body?: any;
  priority?: 'high' | 'normal' | 'low';
};

class RequestManager {
  private requestQueue: Array<{ config: RequestConfig; resolve: Function; reject: Function }> = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private minInterval = 150; // Minimum 150ms between requests
  private retryAttempts = new Map<string, number>();
  private maxRetries = 3;

  async enqueueRequest(config: RequestConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ config, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const { config, resolve, reject } = this.requestQueue.shift()!;
      
      try {
        // Ensure minimum interval between requests
        await this.throttleRequest();
        
        const result = await this.executeRequest(config);
        resolve(result);
      } catch (error) {
        if (this.shouldRetry(config.endpoint, error)) {
          // Re-queue for retry
          this.requestQueue.unshift({ config, resolve, reject });
          await this.delay(this.getRetryDelay(config.endpoint));
        } else {
          reject(error);
        }
      }
    }

    this.isProcessing = false;
  }

  private async throttleRequest() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minInterval) {
      await this.delay(this.minInterval - timeSinceLastRequest);
    }
    
    this.lastRequestTime = Date.now();
  }

  private async executeRequest(config: RequestConfig): Promise<any> {
    const { endpoint, method = 'GET', body } = config;
    
    const url = `http://localhost:5001/api${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'API request failed');
      (error as any).status = response.status;
      throw error;
    }

    return data;
  }

  private shouldRetry(endpoint: string, error: any): boolean {
    if (error.status !== 429) return false;
    
    const attempts = this.retryAttempts.get(endpoint) || 0;
    return attempts < this.maxRetries;
  }

  private getRetryDelay(endpoint: string): number {
    const attempts = this.retryAttempts.get(endpoint) || 0;
    this.retryAttempts.set(endpoint, attempts + 1);
    
    // Exponential backoff: 1s, 2s, 4s
    return Math.pow(2, attempts) * 1000;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Clear retry attempts for an endpoint
  clearRetryAttempts(endpoint?: string) {
    if (endpoint) {
      this.retryAttempts.delete(endpoint);
    } else {
      this.retryAttempts.clear();
    }
  }

  // Get queue status
  getQueueStatus() {
    return {
      queueLength: this.requestQueue.length,
      isProcessing: this.isProcessing,
      lastRequestTime: this.lastRequestTime,
    };
  }
}

export const requestManager = new RequestManager();
