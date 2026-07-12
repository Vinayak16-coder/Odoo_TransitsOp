import { useAuthStore } from './auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiError extends Error {
  public status: number;
  public data: any;
  
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const { accessToken, setAccessToken, logout } = useAuthStore.getState();

  const headers = new Headers(options.headers || {});
  
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  // We need to include credentials to send cookies (like refreshToken)
  config.credentials = 'include';

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // If unauthorized, attempt to refresh token once
    if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });

          if (!refreshRes.ok) {
            throw new Error('Refresh failed');
          }

          const refreshData = await refreshRes.json();
          const newToken = refreshData.data.accessToken;
          
          setAccessToken(newToken);
          isRefreshing = false;
          onRefreshed(newToken);
        } catch (e) {
          isRefreshing = false;
          refreshSubscribers = [];
          logout(); // Force logout if refresh fails
          window.location.href = '/login';
          throw new ApiError(401, 'Session expired');
        }
      }

      // Wait for refresh to complete, then retry the request
      return new Promise((resolve) => {
        addRefreshSubscriber((token) => {
          headers.set('Authorization', `Bearer ${token}`);
          resolve(fetch(`${API_BASE_URL}${endpoint}`, { ...config, headers }).then(res => handleResponse(res)));
        });
      });
    }

    return handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(0, 'Network Error', error);
  }
};

const handleResponse = async (response: Response) => {
  let data;
  try {
    data = await response.json();
  } catch (e) {
    if (!response.ok) {
      throw new ApiError(response.status, 'An unexpected error occurred');
    }
    return null; // Empty response (e.g. 204)
  }

  if (!response.ok || (data && data.success === false)) {
    const message = data?.error?.message || 'An error occurred';
    throw new ApiError(response.status, message, data?.error);
  }

  return data;
};
