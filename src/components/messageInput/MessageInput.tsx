import { useState, useEffect, useCallback } from "react";
import arrowIcon from "../../assets/proxy-image.png";
import cancelIcon from "../../assets/cancel-button.png";
import { useLanguage } from "../../hooks/useLanguage";
import { STORAGE_KEYS } from "../../config/constants";
import { PlusIcon } from "../icons";
import "./MessageInput.css";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onFocusChange?: (focused: boolean) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export const MessageInput = ({ onSendMessage, onFocusChange, isLoading, onCancel }: MessageInputProps) => {
  const [input, setInput] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.DRAFT_MESSAGE) || "";
  });
  const { t } = useLanguage();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DRAFT_MESSAGE, input);
  }, [input]);

  const handleSend = useCallback(() => {
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
      localStorage.removeItem(STORAGE_KEYS.DRAFT_MESSAGE);
    }
  }, [input, onSendMessage]);

  const handleInputChange = useCallback((newValue: string) => {
    setInput(newValue);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleFocus = useCallback(() => {
    onFocusChange?.(true);
  }, [onFocusChange]);

  const handleBlur = useCallback(() => {
    onFocusChange?.(false);
  }, [onFocusChange]);

  return (
    <div className="input-container">
      <div className="input-wrapper">
        <button
          className="input-icon-btn"
          title="Attach file"
          onClick={() => console.log('Plus icon clicked - functionality to be implemented')}
        >
          <PlusIcon width={22} height={22} />
        </button>

        <textarea
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={t.chat.placeholder}
          className="message-input"
          rows={1}
        />

        {isLoading ? (
          <button
            onClick={onCancel}
            className="send-btn cancel-btn"
            title="Cancel request"
          >
            <img src={cancelIcon} alt="Cancel" className="cancel-icon" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="send-btn"
          >
            <img src={arrowIcon} alt="Send" className="send-icon" />
          </button>
        )}
      </div>
    </div>
  );
};
