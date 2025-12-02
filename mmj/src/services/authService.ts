import { API_BASE_URL, STORAGE_KEYS } from '../config/constants';
import type { User } from '../types';

class AuthService {
  private readonly TOKEN_KEY = STORAGE_KEYS.AUTH_TOKEN;

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  async login(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/usos/login`);
    const data = await response.json();

    if (data.auth_url) {
      window.location.href = data.auth_url;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        this.removeToken();
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error fetching user:', error);
      this.removeToken();
      return null;
    }
  }

  async validateUsosSession(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate-usos`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.logout) {
          this.removeToken();
          return false;
        }
      }

      return response.ok;
    } catch (error) {
      console.error('Error validating USOS session:', error);
      this.removeToken();
      return false;
    }
  }

  async logout(): Promise<{ usosLogoutUrl?: string }> {
    const token = this.getToken();
    let usosLogoutUrl: string | undefined;

    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          usosLogoutUrl = data.usos_logout_url;
          console.log(`🔓 Logout successful. Token revoked: ${data.token_revoked}`);
        }
      } catch (error) {
        console.error('Error logging out:', error);
      }
    }

    this.clearAllUserData();

    return { usosLogoutUrl };
  }

  private clearAllUserData(): void {
    this.removeToken();

    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    localStorage.removeItem(STORAGE_KEYS.DRAFT_MESSAGE);
    localStorage.removeItem(STORAGE_KEYS.LAST_VALIDATION);
    localStorage.removeItem(STORAGE_KEYS.GUEST_MESSAGES);

    localStorage.removeItem('pinned_sessions');
    localStorage.removeItem('local_groups');

    localStorage.removeItem('userAccount');

    console.log('✅ All user data cleared from localStorage');
  }

  handleCallback(): string | null {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      this.setToken(token);
      window.history.replaceState({}, document.title, window.location.pathname);
      return token;
    }

    return null;
  }

  async getAccountPreferences(): Promise<{ preferences: any }> {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/account/preferences`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Failed to load account preferences');
    }

    return response.json();
  }

  async updateAccountPreferences(preferences: any): Promise<void> {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/account/preferences`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      throw new Error('Failed to update account preferences');
    }
  }

  async resetAccountPreferences(): Promise<void> {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/account/preferences`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Failed to reset account preferences');
    }
  }

  async submitFeedback(nodeId: number, feedback: string): Promise<void> {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/chat/messages/${nodeId}/feedback`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feedback }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit feedback');
    }
  }

  async explainMessage(messageText: string): Promise<{ explanation: string; metrics?: any }> {
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/explain`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message: messageText }),
    });

    if (!response.ok) {
      throw new Error('Failed to get explanation');
    }

    return await response.json();
  }
}

export const authService = new AuthService();
export type { User };
