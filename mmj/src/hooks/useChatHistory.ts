import { useState, useEffect } from 'react';
import { chatHistoryService } from '../services/chatHistoryService';
import type { ChatSession } from '../types';
import { guestChatService } from '../services/guestChatService';

export const useChatHistory = (isLoggedIn: boolean) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [archivedSessions, setArchivedSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSessions = async () => {
    if (!isLoggedIn) {
      const guestSessions = guestChatService.getSessions();
      const mappedSessions = guestSessions.map(gs => ({
        id: gs.id as number | string,
        title: gs.title,
        created_at: gs.created_at,
        updated_at: gs.updated_at,
        is_archived: false,
      })) as ChatSession[];
      setSessions(mappedSessions);
      setArchivedSessions([]);
      return;
    }

    setLoading(true);
    const userSessions = await chatHistoryService.getSessions(false);
    setSessions(userSessions);
    setLoading(false);
  };

  const loadArchivedSessions = async () => {
    if (!isLoggedIn) {
      setArchivedSessions([]);
      return;
    }

    const archived = await chatHistoryService.getSessions(true);
    setArchivedSessions(archived.filter(s => s.is_archived));
  };

  useEffect(() => {
    loadSessions();
    loadArchivedSessions();
  }, [isLoggedIn]);

  const createNewSession = async () => {
    if (!isLoggedIn) {
      setCurrentSessionId(null);
      return null;
    }

    const sessionId = await chatHistoryService.createSession();
    if (sessionId) {
      setCurrentSessionId(sessionId);
      await loadSessions();
    }
    return sessionId;
  };

  const loadSession = async (sessionId: number | string): Promise<any[]> => {
    setCurrentSessionId(sessionId);

    if (!isLoggedIn && typeof sessionId === 'string') {
      const guestSession = guestChatService.getSession(sessionId);
      const messages = guestSession?.messages || [];
      return messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
        created_at: new Date().toISOString()
      }));
    }

    const tree = await chatHistoryService.getConversationTree(sessionId as number);
    if (tree && tree.length > 0) {
      return tree.map(node => ({
        role: node.role,
        content: node.content,
        created_at: node.created_at,
        nodeId: node.id,
        parentId: node.parent_id,
        siblingCount: node.sibling_count,
        currentIndex: node.current_index,
        feedback: node.feedback
      }));
    }

    return await chatHistoryService.getSessionMessages(sessionId as number);
  };

  const archiveSession = async (sessionId: number | string) => {
    if (!isLoggedIn) return false;
    const success = await chatHistoryService.archiveSession(sessionId as number);
    if (success) {
      await loadSessions();
      await loadArchivedSessions();
    }
    return success;
  };

  const unarchiveSession = async (sessionId: number | string) => {
    if (!isLoggedIn) return false;
    const success = await chatHistoryService.unarchiveSession(sessionId as number);
    if (success) {
      await loadSessions();
      await loadArchivedSessions();
    }
    return success;
  };

  const deleteSession = async (sessionId: number | string) => {
    if (!isLoggedIn && typeof sessionId === 'string') {
      guestChatService.deleteSession(sessionId);
      await loadSessions();
      return true;
    }
    const success = await chatHistoryService.deleteSession(sessionId as number);
    if (success) {
      await loadSessions();
      await loadArchivedSessions();
    }
    return success;
  };

  const updateSessionTitle = async (sessionId: number | string, title: string) => {
    if (!isLoggedIn && typeof sessionId === 'string') {
      guestChatService.updateSessionTitle(sessionId, title);
      await loadSessions();
      return true;
    }
    const success = await chatHistoryService.updateSessionTitle(sessionId as number, title);
    if (success) {
      await loadSessions();
    }
    return success;
  };

  return {
    sessions,
    archivedSessions,
    currentSessionId,
    setCurrentSessionId,
    loading,
    createNewSession,
    loadSession,
    archiveSession,
    unarchiveSession,
    deleteSession,
    updateSessionTitle,
    refreshSessions: loadSessions,
    refreshArchivedSessions: loadArchivedSessions,
  };
};
