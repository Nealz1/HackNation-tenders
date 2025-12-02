import { useCallback } from 'react';
import type { Message } from '../types';
import { useMessageTree } from './useMessageTree';

export const useMessageHandlers = (
  currentSessionId: number | string | null,
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  const messageTree = useMessageTree(currentSessionId);

  const handleRegenerateMessage = useCallback(async (index: number) => {
    setMessages((prev) => {
      const messagesUpToIndex = prev.slice(0, index);
      return [...messagesUpToIndex, { ...prev[index], isLoading: true }];
    });

    const updatedMessages = await messageTree.regenerateMessage(index, messages);
    if (updatedMessages) {
      setMessages(updatedMessages);
    } else {
      setMessages((prev) =>
        prev.map((msg) => ({ ...msg, isLoading: false }))
      );
    }
  }, [messageTree, messages, setMessages]);

  const handleEditMessage = useCallback(async (index: number, newContent: string) => {
    setMessages((prev) => {
      const messagesUpToIndex = prev.slice(0, index);
      const editedMessage = { ...prev[index], text: newContent };
      return [...messagesUpToIndex, editedMessage, { sender: 'bot', text: '', isLoading: true }];
    });

    const updatedMessages = await messageTree.editMessage(index, newContent, messages);
    if (updatedMessages) {
      setMessages(updatedMessages);
    } else {
      setMessages((prev) =>
        prev.map((msg) => ({ ...msg, isLoading: false }))
      );
    }
  }, [messageTree, messages, setMessages]);

  const handleNavigateVersion = useCallback(async (index: number, direction: 'prev' | 'next') => {
    const updatedMessages = await messageTree.navigateVersion(index, direction, messages);
    if (updatedMessages && updatedMessages.length > 0) {
      setMessages(updatedMessages);
    }
  }, [messageTree, messages, setMessages]);

  return {
    handleRegenerateMessage,
    handleEditMessage,
    handleNavigateVersion
  };
};

