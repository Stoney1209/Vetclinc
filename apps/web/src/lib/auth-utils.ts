interface FailedRequest {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}

export class AuthManager {
  private static instance: AuthManager;
  private isRefreshing = false;
  private failedQueue: FailedRequest[] = [];
  private accessToken: string | null = null;
  private redirectHandler: (url: string) => void = (url) => {
    if (typeof window !== 'undefined') window.location.href = url;
  };

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setRedirectHandler(handler: (url: string) => void) {
    this.redirectHandler = handler;
  }

  clearSession() {
    this.setAccessToken(null);
    if (typeof window !== 'undefined') {
      this.redirectHandler('/login');
    }
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  async refreshAuthToken(): Promise<string> {
    if (this.isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        this.failedQueue.push({ 
          resolve: (value?: unknown) => resolve(value as string),
          reject 
        });
      });
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.setAccessToken(data.accessToken);
      this.processQueue(null, data.accessToken);
      
      return data.accessToken;
    } catch (error) {
      this.processQueue(error, null);
      this.clearSession();
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  isTokenRefreshUrl(url?: string): boolean {
    return url === '/auth/refresh';
  }
}

export const authManager = AuthManager.getInstance();
