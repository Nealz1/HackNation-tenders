import { STORAGE_KEYS } from '../config/constants';
import type { Message } from '../types';

export interface GuestChatSession {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

class GuestChatService {
  private getGuestSessions(): GuestChatSession[] {
    const stored = localStorage.getItem(STORAGE_KEYS.GUEST_MESSAGES);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  private saveGuestSessions(sessions: GuestChatSession[]): void {
    localStorage.setItem(STORAGE_KEYS.GUEST_MESSAGES, JSON.stringify(sessions));
  }

  getSessions(): GuestChatSession[] {
    return this.getGuestSessions();
  }

  getSession(sessionId: string): GuestChatSession | null {
    const sessions = this.getGuestSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  createSession(): string {
    const sessions = this.getGuestSessions();
    const newSession: GuestChatSession = {
      id: `guest-${Date.now()}`,
      title: 'New chat',
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    sessions.unshift(newSession);
    this.saveGuestSessions(sessions);
    return newSession.id;
  }

  updateSession(sessionId: string, messages: Message[]): void {
    const sessions = this.getGuestSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].messages = messages;
      sessions[sessionIndex].updated_at = new Date().toISOString();
      
      const userMessages = messages.filter(m => m.sender === 'user');
      if (userMessages.length > 0 && sessions[sessionIndex].title === 'New chat') {
        sessions[sessionIndex].title = userMessages[0].text.slice(0, 50) + (userMessages[0].text.length > 50 ? '...' : '');
      }
      
      this.saveGuestSessions(sessions);
    }
  }

  updateSessionTitle(sessionId: string, title: string): void {
    const sessions = this.getGuestSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].title = title;
      sessions[sessionIndex].updated_at = new Date().toISOString();
      this.saveGuestSessions(sessions);
    }
  }

  deleteSession(sessionId: string): void {
    const sessions = this.getGuestSessions();
    const filtered = sessions.filter(s => s.id !== sessionId);
    this.saveGuestSessions(filtered);
  }

  clearAllSessions(): void {
    localStorage.removeItem(STORAGE_KEYS.GUEST_MESSAGES);
  }
}

export const guestChatService = new GuestChatService();
