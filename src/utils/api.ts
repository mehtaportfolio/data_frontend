const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = (await response.json()) as ApiResponse<null>;
      throw new Error(error.error || 'API request failed');
    }

    const result = (await response.json()) as ApiResponse<T>;
    if (!result.success) {
      throw new Error(result.error || 'API request failed');
    }

    if (!result.data) {
      throw new Error('No data returned from API');
    }

    return result.data;
  }

  async post<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = (await response.json()) as ApiResponse<null>;
      throw new Error(error.error || 'API request failed');
    }

    const result = (await response.json()) as ApiResponse<T>;
    if (!result.success) {
      throw new Error(result.error || 'API request failed');
    }

    if (!result.data) {
      throw new Error('No data returned from API');
    }

    return result.data;
  }

  async put<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = (await response.json()) as ApiResponse<null>;
      throw new Error(error.error || 'API request failed');
    }

    const result = (await response.json()) as ApiResponse<T>;
    if (!result.success) {
      throw new Error(result.error || 'API request failed');
    }

    if (!result.data) {
      throw new Error('No data returned from API');
    }

    return result.data;
  }

  async delete(endpoint: string): Promise<void> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json() as ApiResponse<null>;
      throw new Error(error.error || 'API request failed');
    }

    const result = (await response.json()) as ApiResponse<null>;
    if (!result.success) {
      throw new Error(result.error || 'API request failed');
    }
  }
}

export const api = new ApiClient();
