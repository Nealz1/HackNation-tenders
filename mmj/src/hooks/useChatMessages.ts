import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Message, ChatSession } from '../types';
import { API_BASE_URL, STORAGE_KEYS, CONTENT_TYPES } from '../config/constants';
import { handleHtmlResponse, handleEmailUrlResponse } from '../utils/responseHandlers';
import { guestChatService } from '../services/guestChatService';
import { chatHistoryService } from '../services/chatHistoryService';

export const useChatMessages = (
  currentSessionId: number | string | null,
  refreshSessions: () => Promise<void>,
  sessions?: ChatSession[]
) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token && currentSessionId && typeof currentSessionId === 'string') {
      guestChatService.updateSession(currentSessionId, messages);
    }
  }, [messages, currentSessionId]);

  const sendMessage = async (message: string, t: { chat: Record<string,string> }, setCurrentSessionId: (id: number | string | null) => void): Promise<{ session_id?: number } | null> => {
    const userMsg: Message = { sender: "user", text: message };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (!token && !currentSessionId) {
        const newGuestSessionId = guestChatService.createSession();
        setCurrentSessionId(newGuestSessionId);
        await refreshSessions();
        navigate(`/c/${newGuestSessionId}`, { replace: true });
      }

      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message,
          session_id: typeof currentSessionId === 'number' ? currentSessionId : null
        }),
        signal: abortControllerRef.current.signal,
      });

      const contentType = res.headers.get("content-type");

      if (contentType?.includes(CONTENT_TYPES.HTML)) {
        await handleHtmlResponse(res, setMessages, t.chat.routeGenerated);
        return null;
      }
      else {
        const data = await res.json();

        if (data.response && typeof data.response === 'object' && data.response.action === 'open_email_url') {
          const { text, email_url } = data.response;
          handleEmailUrlResponse(text, email_url, setMessages, t.chat.emailPageOpened);
        } else {
          const botMsg: Message = { sender: "bot", text: data.response };
          setMessages((prev) => [...prev, botMsg]);

          if (data.open_url) {
            window.open(data.open_url, '_blank');
          }
        }

        if (data.session_id && !currentSessionId && token) {
          setCurrentSessionId(data.session_id);
          sessionStorage.setItem('skipSessionLoad', String(data.session_id));

          const title = message.slice(0, 50) + (message.length > 50 ? '...' : '');
          await chatHistoryService.updateSessionTitle(data.session_id, title);

          setTimeout(() => {
            refreshSessions();
            navigate(`/c/${data.session_id}`, { replace: true });
          }, 0);
        }

        if (token && currentSessionId && typeof currentSessionId === 'number' && sessions) {
          const currentSession = sessions.find(s => s.id === currentSessionId);
          if (currentSession && (currentSession.title === 'Untitled' || !currentSession.title)) {
            const title = message.slice(0, 50) + (message.length > 50 ? '...' : '');
            await chatHistoryService.updateSessionTitle(currentSessionId, title);
            await refreshSessions();
          }
        }

        if (token && (currentSessionId || data.session_id)) {
          const sessionIdToUse = currentSessionId || data.session_id;
          const tree = await chatHistoryService.getConversationTree(sessionIdToUse as number);
          if (tree && tree.length > 0) {
            const messagesWithNodes = tree.map(node => ({
              sender: node.role === 'user' ? 'user' as const : 'bot' as const,
              text: node.content,
              nodeId: node.id,
              parentId: node.parent_id,
              siblingCount: node.sibling_count,
              currentIndex: node.current_index,
              feedback: node.feedback
            }));
            setMessages(messagesWithNodes);
          }
        }
        
        return { session_id: data.session_id };
      }
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setMessages((prev) => [...prev, { sender: "bot", text: t.chat.requestCancelled || "Request cancelled" }]);
      } else {
        setMessages((prev) => [...prev, { sender: "bot", text: t.chat.serverError }]);
      }
      return null;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const cancelMessage = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  return {
    messages,
    setMessages,
    isLoading,
    sendMessage,
    cancelMessage,
  };
};
