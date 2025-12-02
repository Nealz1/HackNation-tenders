import { useNavigate } from 'react-router-dom';
import type { Message } from '../types';

export const useSessionOperations = (
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  welcomeMessage: string
) => {
  const navigate = useNavigate();

  const handleNewChat = async () => {
    setMessages([{ sender: "bot", text: welcomeMessage }]);
    navigate('/');
  };

  const handleSelectSession = async (sessionId: number | string) => {
    navigate(`/c/${sessionId}`);
  };

  return {
    handleNewChat,
    handleSelectSession,
  };
};
