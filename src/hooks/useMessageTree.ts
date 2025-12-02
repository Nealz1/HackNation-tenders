import { useState, useCallback } from 'react';
import type { Message, MessageNode } from '../types';
import { chatHistoryService } from '../services/chatHistoryService';

export const useMessageTree = (sessionId: number | string | null) => {
  const [treeVersion, setTreeVersion] = useState(0);

  const convertTreeToMessages = (tree: MessageNode[]): Message[] => {
    return tree.map(node => ({
      sender: node.role === 'user' ? 'user' : 'bot',
      text: node.content,
      nodeId: node.id,
      parentId: node.parent_id,
      siblingCount: node.sibling_count,
      currentIndex: node.current_index,
      feedback: node.feedback
    })) as Message[];
  };

  const loadConversationTree = useCallback(async (): Promise<Message[]> => {
    if (!sessionId || typeof sessionId === 'string') return [];

    try {
      const tree = await chatHistoryService.getConversationTree(sessionId);
      return convertTreeToMessages(tree);
    } catch (error) {
      console.error('Error loading conversation tree:', error);
      return [];
    }
  }, [sessionId]);

  const regenerateMessage = useCallback(async (index: number, messages: Message[]): Promise<Message[] | null> => {
    if (!sessionId || typeof sessionId === 'string') return null;

    const message = messages[index];
    if (!message || message.sender !== 'bot') return null;

    const parentMessage = index > 0 ? messages[index - 1] : null;
    if (!parentMessage || !parentMessage.nodeId) return null;

    try {
      const result = await chatHistoryService.regenerateResponse(sessionId, parentMessage.nodeId);
      if (!result) return null;

      if (result.file_download && result.file_download.filename) {
        const token = localStorage.getItem('auth_token');
        if (token) {
          try {
            const downloadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/download/form/${encodeURIComponent(result.file_download.filename)}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (downloadRes.ok) {
              const blob = await downloadRes.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = result.file_download.filename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
            }
          } catch (err) {
            console.error('Failed to download form:', err);
          }
        }
      }

      const updatedTree = await chatHistoryService.getConversationTree(sessionId);
      setTreeVersion(v => v + 1);
      return convertTreeToMessages(updatedTree);
    } catch (error) {
      console.error('Error regenerating message:', error);
      return null;
    }
  }, [sessionId]);

  const editMessage = useCallback(async (index: number, newContent: string, messages: Message[]): Promise<Message[] | null> => {
    if (!sessionId || typeof sessionId === 'string') return null;

    const message = messages[index];
    if (!message || message.sender !== 'user' || !message.nodeId) return null;

    try {
      const result = await chatHistoryService.editMessage(sessionId, message.nodeId, newContent);
      if (!result) return null;

      const updatedTree = await chatHistoryService.getConversationTree(sessionId);
      setTreeVersion(v => v + 1);
      return convertTreeToMessages(updatedTree);
    } catch (error) {
      console.error('Error editing message:', error);
      return null;
    }
  }, [sessionId]);

  const navigateVersion = useCallback(async (index: number, direction: 'prev' | 'next', messages: Message[]): Promise<Message[] | null> => {
    if (!sessionId || typeof sessionId === 'string') return null;

    const message = messages[index];
    if (!message || !message.nodeId || !message.siblingCount || message.siblingCount <= 1) return null;

    try {
      const siblings = await chatHistoryService.getMessageSiblings(message.nodeId);
      if (siblings.length <= 1) return null;

      const currentIdx = siblings.findIndex(s => s.id === message.nodeId);
      if (currentIdx === -1) return null;

      let newIdx = currentIdx;
      if (direction === 'prev' && currentIdx > 0) {
        newIdx = currentIdx - 1;
      } else if (direction === 'next' && currentIdx < siblings.length - 1) {
        newIdx = currentIdx + 1;
      } else {
        return null;
      }

      const newSibling = siblings[newIdx];
      const parentId = message.parentId ?? 0;

      await chatHistoryService.setActiveVersion(sessionId, parentId, newSibling.id);

      const updatedTree = await chatHistoryService.getConversationTree(sessionId);
      setTreeVersion(v => v + 1);
      return convertTreeToMessages(updatedTree);
    } catch (error) {
      console.error('Error navigating version:', error);
      return null;
    }
  }, [sessionId]);

  return {
    loadConversationTree,
    regenerateMessage,
    editMessage,
    navigateVersion,
    treeVersion
  };
};

