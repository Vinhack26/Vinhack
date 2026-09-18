import { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  code?: string;
  status: number;
  details?: unknown[];

  constructor(message: string, status: number, code?: string, details?: unknown[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('breachbuddy_token');

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new ApiError(
      'Unable to connect to the BreachBuddy server. Please check that the backend is running.',
      0,
      'NETWORK_ERROR'
    );
  }

  // Handle 401 Unauthorized
  if (response.status === 401) {
    if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      localStorage.removeItem('breachbuddy_token');
      localStorage.removeItem('breachbuddy_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
  }

  let payload: ApiResponse<T> | null = null;
  try {
    payload = await response.json();
  } catch {
    // Non-JSON response
  }

  if (!response.ok) {
    let errorMsg = payload?.message;

    if (!errorMsg) {
      switch (response.status) {
        case 400:
          errorMsg = 'Invalid request parameters. Please verify input data.';
          break;
        case 401:
          errorMsg = 'Session expired or invalid credentials. Please log in again.';
          break;
        case 403:
          errorMsg = 'Access forbidden. You do not have permission to perform this action.';
          break;
        case 404:
          errorMsg = 'The requested incident or security resource was not found.';
          break;
        case 409:
          errorMsg = 'A conflict occurred with an existing security record.';
          break;
        case 429:
          errorMsg = 'Too many requests. Rate limit exceeded. Please wait a moment.';
          break;
        case 500:
        default:
          errorMsg = 'Internal server error encountered in BreachBuddy backend.';
          break;
      }
    }

    const errorCode = payload?.error?.code || `HTTP_${response.status}`;
    const errorDetails = payload?.error?.details;
    throw new ApiError(errorMsg, response.status, errorCode, errorDetails);
  }

  return (payload ? payload.data : null) as T;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),

  downloadBlob: async (endpoint: string, fallbackFilename: string): Promise<void> => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('breachbuddy_token');

    const headers = new Headers();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    let res: Response;
    try {
      res = await fetch(url, { method: 'GET', headers });
    } catch {
      throw new ApiError(
        'Unable to connect to the BreachBuddy server. Please check that the backend is running.',
        0,
        'NETWORK_ERROR'
      );
    }

    if (!res.ok) {
      throw new ApiError('Failed to generate official PDF incident report', res.status);
    }

    // Try to extract filename from Content-Disposition header
    let filename = fallbackFilename;
    const disposition = res.headers.get('content-disposition');
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  },
};

export default api;
