import { API_BASE_URL } from '../config/constants';
import { authService } from './authService';
import type { ChatSession } from '../types';

export interface ChatMessage {
  role: string;
  content: string;
  created_at: string;
}

class ChatHistoryService {
  private getAuthHeaders(): HeadersInit {
    const token = authService.getToken();
    if (!token) return {};
    return { 'Authorization': `Bearer ${token}` };
  }

  async getSessions(includeArchived: boolean = false): Promise<ChatSession[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/sessions?include_archived=${includeArchived}`,
        { headers: this.getAuthHeaders() }
      );

      if (!response.ok) return [];

      const data = await response.json();
      return data.sessions || [];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
  }

  async getSessionMessages(sessionId: number): Promise<ChatMessage[]> {
    const response = await fetch(
      `${API_BASE_URL}/chat/sessions/${sessionId}`,
      { headers: this.getAuthHeaders() }
    );

    if (!response.ok) {
      throw new Error('Session not found or access denied');
    }

    const data = await response.json();
    return data.messages || [];
  }


  async createSession(): Promise<number | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.session_id;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  }

  async updateSessionTitle(sessionId: number, title: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/sessions/${sessionId}/title`,
        {
          method: 'PUT',
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error updating session title:', error);
      return false;
    }
  }

  async archiveSession(sessionId: number): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/sessions/${sessionId}/archive`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error archiving session:', error);
      return false;
    }
  }

  async unarchiveSession(sessionId: number): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/sessions/${sessionId}/unarchive`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error unarchiving session:', error);
      return false;
    }
  }

  async deleteSession(sessionId: number): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/sessions/${sessionId}`,
        {
          method: 'DELETE',
          headers: this.getAuthHeaders(),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  async pinSession(sessionId: number, isPinned: boolean): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/sessions/${sessionId}/pin`,
        {
          method: 'PUT',
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_pinned: isPinned }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error pinning/unpinning session:', error);
      return false;
    }
  }

  // ==================== MESSAGE BRANCHING METHODS ====================

  async getConversationTree(sessionId: number): Promise<any[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/sessions/${sessionId}/tree`,
        { headers: this.getAuthHeaders() }
      );

      if (!response.ok) return [];

      const data = await response.json();
      return data.tree || [];
    } catch (error) {
      console.error('Error fetching conversation tree:', error);
      return [];
    }
  }

  async regenerateResponse(sessionId: number, parentNodeId: number): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/sessions/${sessionId}/regenerate`,
        {
          method: 'POST',
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ parent_node_id: parentNodeId }),
        }
      );

      if (!response.ok) return null;

      return await response.json();
    } catch (error) {
      console.error('Error regenerating response:', error);
      return null;
    }
  }

  async editMessage(sessionId: number, nodeId: number, content: string): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/sessions/${sessionId}/messages/${nodeId}/edit`,
        {
          method: 'PUT',
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content, node_id: nodeId }),
        }
      );

      if (!response.ok) return null;

      return await response.json();
    } catch (error) {
      console.error('Error editing message:', error);
      return null;
    }
  }

  async setActiveVersion(sessionId: number, parentNodeId: number, childId: number): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/sessions/${sessionId}/messages/${parentNodeId}/set-active`,
        {
          method: 'POST',
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ child_id: childId }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error setting active version:', error);
      return false;
    }
  }

  async getMessageSiblings(nodeId: number): Promise<any[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/messages/${nodeId}/siblings`,
        { headers: this.getAuthHeaders() }
      );

      if (!response.ok) return [];

      const data = await response.json();
      return data.siblings || [];
    } catch (error) {
      console.error('Error fetching message siblings:', error);
      return [];
    }
  }
}

export const chatHistoryService = new ChatHistoryService();
