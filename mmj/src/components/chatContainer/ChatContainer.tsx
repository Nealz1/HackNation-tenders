import { useState, memo, useEffect, useRef } from "react";
import "./ChatContainer.css";
import { MessageContent } from "../messageContent/MessageContent";
import { CopyIcon, EditIcon } from "../icons";
import type { Message } from "../../types";
import { UI_FEEDBACK_DURATIONS } from "../../config/constants";


interface VersionNavigatorProps {
  currentIndex: number;
  siblingCount: number;
  onNavigate: (direction: 'prev' | 'next') => void;
}

const VersionNavigator = memo(({ currentIndex, siblingCount, onNavigate }: VersionNavigatorProps) => (
  <>
    <button
      className="version-nav-btn"
      onClick={() => onNavigate('prev')}
      disabled={currentIndex === 1}
      title="Previous version"
    >
      ‹
    </button>
    <span className="version-indicator">
      {currentIndex} / {siblingCount}
    </span>
    <button
      className="version-nav-btn"
      onClick={() => onNavigate('next')}
      disabled={currentIndex === siblingCount}
      title="Next version"
    >
      ›
    </button>
  </>
));

VersionNavigator.displayName = 'VersionNavigator';

interface MessageActionsProps {
  messageIndex: number;
  messageText: string;
  messageType: 'user' | 'bot';
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
  onEdit?: () => void;
  messageNodeId?: number;
}

const MessageActions = memo(({
  messageIndex,
  messageText,
  messageType,
  copiedIndex,
  onCopy,
  onEdit
}: MessageActionsProps) => {
  return (
    <div className="message-actions">
      <button
        className="message-action-btn"
        onClick={() => onCopy(messageText, messageIndex)}
        title={copiedIndex === messageIndex ? "Copied!" : "Copy"}
      >
        {copiedIndex === messageIndex ? '✓' : <CopyIcon width={14} height={14} />}
      </button>
      {messageType === 'user' && onEdit && (
        <button
          className="message-action-btn"
          onClick={onEdit}
          title="Edit"
        >
          <EditIcon width={14} height={14} />
        </button>
      )}
    </div>
  );
});

MessageActions.displayName = 'MessageActions';

export interface ChatContainerProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onCancelMessage: () => void;
  onEditMessage?: (index: number, newContent: string) => void;
  onNavigateVersion?: (index: number, direction: 'prev' | 'next') => void;
  urlSessionId?: string;
  isLoading?: boolean;
  setMessages?: React.Dispatch<React.SetStateAction<Message[]>>;
}

export const ChatContainer = ({
  messages,
  onSendMessage,
  onEditMessage,
  onNavigateVersion,
  urlSessionId,
  isLoading
}: ChatContainerProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, urlSessionId]);

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), UI_FEEDBACK_DURATIONS.COPY_SUCCESS);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const startEditing = (index: number, currentText: string) => {
    setEditingIndex(index);
    setEditContent(currentText);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditContent("");
  };

  const saveEdit = (index: number) => {
    if (onEditMessage && editContent.trim()) {
      onEditMessage(index, editContent.trim());
      setEditingIndex(null);
      setEditContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit(index);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  return (
    <div className="chat-container light">
      <div className="chat-messages">
        {messages.map((msg, i) => {
          const hasVersions = msg.siblingCount && msg.siblingCount > 1;
          const isEditing = editingIndex === i;

          return (
            <div key={msg.nodeId || `${i}-${msg.text.substring(0, 20)}`} className={`message-wrapper ${msg.sender}`}>
              {isEditing ? (
                <div className="message-edit-container">
                  <textarea
                    className="message-edit-textarea"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    autoFocus
                  />
                  <div className="message-edit-actions">
                    <button
                      className="edit-save-btn"
                      onClick={() => saveEdit(i)}
                      disabled={!editContent.trim()}
                    >
                      Save & Submit
                    </button>
                    <button
                      className="edit-cancel-btn"
                      onClick={cancelEditing}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : msg.isLoading ? (
                <div className="message-text loading-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              ) : (
                <div className="message-text"><MessageContent text={msg.text} /></div>
              )}

              {!isEditing && !msg.isLoading && (
                <div className="message-actions">
                  {hasVersions && (
                    <VersionNavigator
                      currentIndex={msg.currentIndex!}
                      siblingCount={msg.siblingCount!}
                      onNavigate={(direction) => onNavigateVersion?.(i, direction)}
                    />
                  )}
                  <MessageActions
                    messageIndex={i}
                    messageText={msg.text}
                    messageType={msg.sender}
                    copiedIndex={copiedIndex}
                    onCopy={handleCopy}
                    onEdit={msg.sender === 'user' ? () => startEditing(i, msg.text) : undefined}
                    messageNodeId={msg.nodeId}
                  />
                </div>
              )}
            </div>
          );
        })}
        {isLoading && (
          <div className="message-wrapper bot">
            <div className="message-text loading-indicator">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
