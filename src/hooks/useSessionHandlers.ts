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
  ..._rest: any[]
) => {
  const navigate = useNavigate();

  const loadSession = _rest.length >= 2 ? _rest[_rest.length - 2] as (sessionId: number | string) => Promise<any[]> : undefined;
  const deleteSession = _rest.length >= 1 ? _rest[_rest.length - 1] as (sessionId: number | string) => Promise<boolean | void> : undefined;

  const handleExportPdf = useCallback(async (sessionId: number | string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    let chatMessages;
    if (sessionId === currentSessionId) {
      chatMessages = messages;
    } else {
      const sessionMessages = await loadSession?.(sessionId);
      chatMessages = sessionMessages?.map((msg: any) => ({
        sender: msg.role === 'user' || msg.sender === 'user' ? 'user' as const : 'bot' as const,
        text: msg.content || msg.text
      })) || [];
    }

    await exportChatAsPDF(session.title, chatMessages);
  }, [sessions, currentSessionId, messages, loadSession]);

  const handleDeleteSession = useCallback(async (sessionId: number | string) => {
    if (deleteSession) await deleteSession(sessionId);
    if (currentSessionId === sessionId) {
      setMessages([]);
      setCurrentSessionId(null);
      navigate('/');
    }
  }, [deleteSession, currentSessionId, setMessages, setCurrentSessionId, navigate]);

  return {
    handleExportPdf,
    handleDeleteSession
  };
};
