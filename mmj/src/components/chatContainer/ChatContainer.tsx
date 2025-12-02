import { useState, memo, useEffect, useRef } from "react";
import "./ChatContainer.css";
import { useLanguage } from "../../hooks/useLanguage";
import { MessageInput } from "../messageInput";
import { MessageContent } from "../messageContent/MessageContent";
import { ThumbsUpIcon, ThumbsDownIcon, CopyIcon, RegenerateIcon, EditIcon, SpeakerIcon, ExplainIcon } from "../icons";
import type { Message } from "../../types";
import { UI_FEEDBACK_DURATIONS } from "../../config/constants";
import { authService } from "../../services/authService";
import { speak } from "../../utils/speech";
import { useAuth } from "../../hooks/useAuth";
import { ExplanationDialog } from "../explanationDialog";

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
  onRegenerate?: () => void;
  onExplain?: () => void;
  messageNodeId?: number;
  feedback?: string | null;
  onFeedback?: (nodeId: number, feedback: string | null) => void;
  isAuthenticated?: boolean;
}

const MessageActions = memo(({
  messageIndex,
  messageText,
  messageType,
  copiedIndex,
  onCopy,
  onEdit,
  onRegenerate,
  onExplain,
  messageNodeId,
  feedback,
  onFeedback,
  isAuthenticated
}: MessageActionsProps) => {
  const { language } = useLanguage();

  const handleFeedback = async (feedbackType: string) => {
    if (messageNodeId && onFeedback) {
      try {
        const newFeedback = feedback === feedbackType ? 'neutral' : feedbackType;
        await authService.submitFeedback(messageNodeId, newFeedback);
        onFeedback(messageNodeId, newFeedback);
      } catch (error) {
        console.error('Failed to submit feedback:', error);
      }
    }
  };

  const handleTTS = () => {
    const messageId = messageNodeId ? String(messageNodeId) : `${messageIndex}-${messageText.substring(0, 20)}`;
    speak(messageText, language as 'pl' | 'en', messageId);
  };

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
      {messageType === 'bot' && (
        <>
          {isAuthenticated && (
            <>
              <button
                className={`message-action-btn ${feedback === 'like' ? 'feedback-selected feedback-like' : ''}`}
                onClick={() => handleFeedback('like')}
                title={feedback === 'like' ? "Click to remove like" : "Like"}
              >
                <ThumbsUpIcon width={14} height={14} />
              </button>
              <button
                className={`message-action-btn ${feedback === 'dislike' ? 'feedback-selected feedback-dislike' : ''}`}
                onClick={() => handleFeedback('dislike')}
                title={feedback === 'dislike' ? "Click to remove dislike" : "Dislike"}
              >
                <ThumbsDownIcon width={14} height={14} />
              </button>
              {onRegenerate && (
                <button
                  className="message-action-btn"
                  onClick={onRegenerate}
                  title="Regenerate"
                >
                  <RegenerateIcon width={14} height={14} />
                </button>
              )}
            </>
          )}
          {onExplain && (
            <button
              className="message-action-btn"
              onClick={onExplain}
              title="Explain decision"
            >
              <ExplainIcon width={14} height={14} />
            </button>
          )}
          <button
            className="message-action-btn"
            onClick={handleTTS}
            title="Speak"
          >
            <SpeakerIcon width={14} height={14} />
          </button>
        </>
      )}
    </div>
  );
});

MessageActions.displayName = 'MessageActions';

export interface ChatContainerProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onCancelMessage: () => void;
  onRegenerateMessage?: (index: number) => void;
  onEditMessage?: (index: number, newContent: string) => void;
  onNavigateVersion?: (index: number, direction: 'prev' | 'next') => void;
  darkMode: boolean;
  urlSessionId?: string;
  isLoading?: boolean;
  setMessages?: React.Dispatch<React.SetStateAction<Message[]>>;
}

export const ChatContainer = ({
  messages,
  onSendMessage,
  onRegenerateMessage,
  onEditMessage,
  onNavigateVersion,
  darkMode,
  urlSessionId,
  isLoading,
  setMessages
}: ChatContainerProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const welcomeMessage = t.chat.welcomeMessage;
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const [explanationText, setExplanationText] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasUserMessages = messages.some(msg => msg.sender === "user");

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

  const handleFeedback = (nodeId: number, feedback: string | null) => {
    if (!setMessages) return;

    setMessages(prev => prev.map(msg =>
      msg.nodeId === nodeId
        ? { ...msg, feedback }
        : msg
    ));
  };

  const handleExplain = (messageIndex: number) => {
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') {
        setExplanationText(messages[i].text);
        return;
      }
    }
    setExplanationText("Brak poprzedniego zapytania użytkownika");
  };

  const closeExplanation = () => {
    setExplanationText(null);
  };

  if (!urlSessionId && !hasUserMessages) {
    return (
      <div className={`chat-container ${darkMode ? 'dark' : 'light'}`}>
        <div className="welcome-screen">
          <h1 className="welcome-title">{welcomeMessage}</h1>
          <div className="welcome-input-wrapper">
            <MessageInput onSendMessage={onSendMessage} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-container ${darkMode ? 'dark' : 'light'}`}>
      <div className="chat-messages">
        {messages.map((msg, i) => {
          if (i === 0 && msg.sender === "bot" && msg.text === welcomeMessage) {
            return null;
          }

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
                    onRegenerate={msg.sender === 'bot' && isAuthenticated ? () => onRegenerateMessage?.(i) : undefined}
                    onExplain={msg.sender === 'bot' ? () => handleExplain(i) : undefined}
                    messageNodeId={msg.nodeId}
                    feedback={msg.feedback}
                    onFeedback={handleFeedback}
                    isAuthenticated={isAuthenticated}
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
      {explanationText && (
        <ExplanationDialog
          messageText={explanationText}
          onClose={closeExplanation}
        />
      )}
    </div>
  );
};
