import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Message, ChatSession } from '../types';
import { exportChatAsPDF } from '../utils/exportPdf';

export const useSessionHandlers = (
  sessions: ChatSession[],
  currentSessionId: number | string | null,
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setCurrentSessionId: React.Dispatch<React.SetStateAction<number | string | null>>,
  welcomeMessage: string,
  pinSession: (sessionId: number | string, isPinned: boolean) => Promise<boolean | void>,
  loadSession: (sessionId: number | string) => Promise<any[]>,
  deleteSession: (sessionId: number | string) => Promise<boolean | void>
) => {
  const navigate = useNavigate();

  const handlePinSession = useCallback(async (sessionId: number | string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const isPinned = !(session.is_pinned ?? false);
    await pinSession(sessionId, isPinned);
  }, [sessions, pinSession]);

  const handleExportPdf = useCallback(async (sessionId: number | string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    let chatMessages;
    if (sessionId === currentSessionId) {
      chatMessages = messages;
    } else {
      const sessionMessages = await loadSession(sessionId);
      chatMessages = sessionMessages.map((msg: any) => ({
        sender: msg.role === 'user' || msg.sender === 'user' ? 'user' as const : 'bot' as const,
        text: msg.content || msg.text
      }));
    }

    await exportChatAsPDF(session.title, chatMessages);
  }, [sessions, currentSessionId, messages, loadSession]);

  const handleDeleteSession = useCallback(async (sessionId: number | string) => {
    await deleteSession(sessionId);
    if (currentSessionId === sessionId) {
      setMessages([{ sender: "bot", text: welcomeMessage }]);
      setCurrentSessionId(null);
      navigate('/');
    }
  }, [deleteSession, currentSessionId, setMessages, setCurrentSessionId, welcomeMessage, navigate]);

  return {
    handlePinSession,
    handleExportPdf,
    handleDeleteSession
  };
};

