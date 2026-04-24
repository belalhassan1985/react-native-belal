import { API_BASE_URL } from '../constants';
import { storage } from './storage';

const ERROR_MESSAGES = {
  NETWORK_ERROR: 'لا يوجد اتصال بالإنترنت',
  SERVER_ERROR: 'حدث خطأ في الخادم',
  UNAUTHORIZED: 'انتهت جلستك. يرجى تسجيل الدخول مرة أخرى',
  VALIDATION_ERROR: 'يرجى التحقق من المدخلات',
  UNKNOWN_ERROR: 'حدث خطأ ما',
  TIMEOUT_ERROR: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى',
};

const REQUEST_TIMEOUT = 15000;

class ApiClient {
  private baseUrl = API_BASE_URL;
  private isHandlingUnauthorized = false;
  private unauthorizedResolve: (() => void) | null = null;

  /**
   * Create an AbortController with timeout for request cancellation
   * @returns {{ controller: AbortController, cleanup: () => void }}
   */
  createCancellableRequest(): { controller: AbortController; cleanup: () => void } {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    return {
      controller,
      cleanup: () => clearTimeout(timeoutId),
    };
  }

  private async getHeaders(includeAuth = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (includeAuth) {
      const token = await storage.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private handleUnauthorized(): void {
    if (this.isHandlingUnauthorized) return;
    
    this.isHandlingUnauthorized = true;
    
    const clearAuth = async () => {
      try {
        await storage.clearAuth();
      } finally {
        this.isHandlingUnauthorized = false;
        if (this.unauthorizedResolve) {
          this.unauthorizedResolve();
          this.unauthorizedResolve = null;
        }
      }
    };
    
    clearAuth();
  }

  /**
   * Wait for any in-progress unauthorized handling to complete
   * Useful when making multiple concurrent requests and one returns 401
   */
  async waitForUnauthorizedHandling(): Promise<void> {
    if (!this.isHandlingUnauthorized) return;
    
    return new Promise((resolve) => {
      this.unauthorizedResolve = resolve;
    });
  }

  private getErrorMessage(status: number, data: unknown): string {
    if (status === 0) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }

    if (status === 401) {
      return ERROR_MESSAGES.UNAUTHORIZED;
    }

    if (status === 422 || status === 400) {
      if (data && typeof data === 'object') {
        const errorData = data as Record<string, unknown>;
        if (errorData.message) {
          return String(errorData.message);
        }
        if (errorData.errors) {
          const errors = errorData.errors as Record<string, string[]>;
          const firstError = Object.values(errors).flat()[0];
          if (firstError) return firstError;
        }
      }
      return ERROR_MESSAGES.VALIDATION_ERROR;
    }

    if (status >= 500) {
      return ERROR_MESSAGES.SERVER_ERROR;
    }

    return ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    let responseData: unknown;

    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }

    if (response.status === 401) {
      await this.waitForUnauthorizedHandling();
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (!response.ok) {
      const json = responseData as Record<string, unknown>;
      if (json && typeof json === 'object' && 'status' in json && json.status === 'error') {
        const message = (json.message as string) || (json.key as string) || ERROR_MESSAGES.UNKNOWN_ERROR;
        throw new Error(message);
      }
      const message = this.getErrorMessage(response.status, responseData);
      throw new Error(message);
    }

    const json = responseData as Record<string, unknown>;

    if (json && typeof json === 'object') {
      if ('status' in json && json.status === 'error') {
        const message = (json.message as string) || (json.key as string) || ERROR_MESSAGES.UNKNOWN_ERROR;
        throw new Error(message);
      }

      if ('data' in json) {
        return json as T;
      }

      return json as T;
    }

    return json as T;
  }

  async get<T>(endpoint: string, includeAuth = true, signal?: AbortSignal): Promise<T> {
    const headers = await this.getHeaders(includeAuth);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers,
        signal: signal || controller.signal,
      });
      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
      }
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: unknown, includeAuth = true): Promise<T> {
    const headers = await this.getHeaders(includeAuth);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
      }
      throw error;
    }
  }

  async put<T>(endpoint: string, data?: unknown, includeAuth = true): Promise<T> {
    const headers = await this.getHeaders(includeAuth);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
      }
      throw error;
    }
  }

  async delete<T>(endpoint: string, includeAuth = true): Promise<T> {
    const headers = await this.getHeaders(includeAuth);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
      }
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;