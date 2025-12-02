import { useNavigate } from 'react-router-dom';
import type { Message } from '../types';
import { STORAGE_KEYS } from '../config/constants';
import { resetToWelcome, batchSessionOperation } from '../utils/sessionHelpers';

export const useSessionOperations = (
  currentSessionId: number | string | null,
  setCurrentSessionId: React.Dispatch<React.SetStateAction<number | string | null>>,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  welcomeMessage: string,
  archiveSession: (sessionId: number | string) => Promise<boolean | void>,
  unarchiveSession: (sessionId: number | string) => Promise<boolean | void>,
  deleteSession: (sessionId: number | string) => Promise<boolean | void>,
  updateSessionTitle: (sessionId: number | string, title: string) => Promise<boolean>,
  refreshArchivedSessions: () => Promise<void>
) => {
  const navigate = useNavigate();

  const handleNewChat = async () => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      setCurrentSessionId(null);
      setMessages([{ sender: "bot", text: welcomeMessage }]);
      navigate('/');
    } else {
      resetToWelcome(welcomeMessage, setMessages, setCurrentSessionId, navigate);
    }
  };

  const handleSelectSession = async (sessionId: number | string) => {
    navigate(`/c/${sessionId}`);
  };

  const handleArchiveSession = async (sessionId: number | string) => {
    await archiveSession(sessionId);
    if (currentSessionId === sessionId) {
      resetToWelcome(welcomeMessage, setMessages, setCurrentSessionId, navigate);
    }
  };

  const handleRenameSession = async (sessionId: number | string, newTitle: string) => {
    await updateSessionTitle(sessionId, newTitle);
  };

  const handleUnarchiveSession = async (sessionId: number | string) => {
    await unarchiveSession(sessionId);
    await refreshArchivedSessions();
  };

  const handleDeleteArchivedSession = async (sessionId: number | string) => {
    await deleteSession(sessionId);
    if (currentSessionId === sessionId) {
      resetToWelcome(welcomeMessage, setMessages, setCurrentSessionId, navigate);
    }
    await refreshArchivedSessions();
  };

  const handleArchiveMultiple = async (sessionIds: (number | string)[]) => {
    await batchSessionOperation(
      sessionIds.filter((id): id is number => typeof id === 'number'),
      archiveSession,
      currentSessionId,
      welcomeMessage,
      setMessages,
      setCurrentSessionId,
      navigate
    );
  };

  const handleUnarchiveMultiple = async (sessionIds: (number | string)[]) => {
    for (const sessionId of sessionIds) {
      await unarchiveSession(sessionId);
    }
    await refreshArchivedSessions();
  };

  const handleDeleteMultiple = async (sessionIds: (number | string)[]) => {
    await batchSessionOperation(
      sessionIds.filter((id): id is number => typeof id === 'number'),
      deleteSession,
      currentSessionId,
      welcomeMessage,
      setMessages,
      setCurrentSessionId,
      navigate
    );
  };

  return {
    handleNewChat,
    handleSelectSession,
    handleArchiveSession,
    handleRenameSession,
    handleUnarchiveSession,
    handleDeleteArchivedSession,
    handleArchiveMultiple,
    handleUnarchiveMultiple,
    handleDeleteMultiple,
  };
};
