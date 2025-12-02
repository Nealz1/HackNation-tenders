const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

import type { Group, ChatSession } from '../types';
export type { Group, ChatSession };

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const groupsService = {
  async getGroups(): Promise<Group[]> {
    const response = await fetch(`${API_BASE_URL}/api/groups`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch groups');
    }

    const data = await response.json();
    return data.groups;
  },

  async createGroup(name: string): Promise<Group> {
    const response = await fetch(`${API_BASE_URL}/api/groups`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create group');
    }

    const data = await response.json();
    return data.group;
  },

  async updateGroup(id: number, name: string): Promise<Group> {
    const response = await fetch(`${API_BASE_URL}/api/groups/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error('Failed to update group');
    }

    const data = await response.json();
    return data.group;
  },

  async deleteGroup(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/groups/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete group');
    }
  },

  async getGroupSessions(groupId: number): Promise<ChatSession[]> {
    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/sessions`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch group sessions');
    }

    const data = await response.json();
    return data.sessions;
  },

  async addSessionToGroup(sessionId: number, groupId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/groups`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ group_id: groupId }),
    });

    if (!response.ok) {
      throw new Error('Failed to add session to group');
    }
  },

  async removeSessionFromGroup(sessionId: number, groupId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/groups/${groupId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to remove session from group');
    }
  },

  async removeSessionFromAllGroups(sessionId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/groups`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to ungroup session');
    }
  },
};
