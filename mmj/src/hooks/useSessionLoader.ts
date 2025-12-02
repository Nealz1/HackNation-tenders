import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Message } from '../types';
import { guestChatService } from '../services/guestChatService';

export const useSessionLoader = (
  urlSessionId: string | undefined,
  user: any,
  loading: boolean,
  currentSessionId: number | string | null,
  setCurrentSessionId: React.Dispatch<React.SetStateAction<number | string | null>>,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  loadSession: (sessionId: number | string) => Promise<any[]>,
  welcomeMessage: string,
  onSessionNotFound?: () => void
) => {
  const navigate = useNavigate();
  const loadedSessionIdRef = useRef<number | string | null>(null);

  useEffect(() => {
    if (!user && urlSessionId && urlSessionId.startsWith('guest-')) {
      if (loadedSessionIdRef.current === urlSessionId) {
        return;
      }

      const guestSession = guestChatService.getSession(urlSessionId);
      if (guestSession) {
        setCurrentSessionId(urlSessionId);
        setMessages(guestSession.messages);
        loadedSessionIdRef.current = urlSessionId;
      } else {
        setCurrentSessionId(null);
        setMessages([{ sender: "bot", text: welcomeMessage }]);
        navigate('/', { replace: true });
        loadedSessionIdRef.current = null;
        if (onSessionNotFound) {
          onSessionNotFound();
        }
      }
      return;
    }

    if (!user || loading) return;

    const sessionIdFromUrl = urlSessionId ? Number(urlSessionId) : null;

    if (sessionIdFromUrl && !isNaN(sessionIdFromUrl)) {
      const skipSessionLoad = sessionStorage.getItem('skipSessionLoad');

      if (skipSessionLoad && Number(skipSessionLoad) === sessionIdFromUrl) {
        sessionStorage.removeItem('skipSessionLoad');
        setCurrentSessionId(sessionIdFromUrl);
        loadedSessionIdRef.current = sessionIdFromUrl;
        return;
      }

      if (sessionIdFromUrl === currentSessionId && loadedSessionIdRef.current === sessionIdFromUrl) {
        return;
      }

      if (sessionIdFromUrl !== currentSessionId) {
        setCurrentSessionId(sessionIdFromUrl);
      }

      if (loadedSessionIdRef.current !== sessionIdFromUrl) {
        loadSession(sessionIdFromUrl)
          .then((sessionMessages) => {
            if (sessionMessages.length > 0) {
              const formattedMessages: Message[] = sessionMessages.map(msg => ({
                sender: msg.role === "user" ? "user" : "bot",
                text: msg.content,
                nodeId: msg.nodeId,
                parentId: msg.parentId,
                siblingCount: msg.siblingCount,
                currentIndex: msg.currentIndex,
                feedback: msg.feedback || msg.feedback === null ? msg.feedback : undefined
              }));
              setMessages(formattedMessages);
            } else {
              setMessages([{ sender: "bot", text: welcomeMessage }]);
            }
            loadedSessionIdRef.current = sessionIdFromUrl;
          })
          .catch((error) => {
            console.error('Failed to load session:', error);
            setCurrentSessionId(null);
            setMessages([{ sender: "bot", text: welcomeMessage }]);
            navigate('/', { replace: true });
            loadedSessionIdRef.current = null;

            if (onSessionNotFound) {
              onSessionNotFound();
            }
          });
      }
    }
    else if (!sessionIdFromUrl) {
      if (currentSessionId !== null) {
        setCurrentSessionId(null);
      }
      setMessages([{ sender: "bot", text: welcomeMessage }]);
      loadedSessionIdRef.current = null;
    }
  }, [urlSessionId, user, loading]);
};
