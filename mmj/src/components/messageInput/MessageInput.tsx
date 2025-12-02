import { useState, useEffect, useCallback } from "react";
import arrowIcon from "../../assets/proxy-image.png";
import cancelIcon from "../../assets/cancel-button.png";
import { useLanguage } from "../../hooks/useLanguage";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { STORAGE_KEYS } from "../../config/constants";
import { PlusIcon, MicrophoneIcon } from "../icons";
import { GroupAutocomplete } from "../groupAutocomplete";
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
  const { isRecording, isProcessing, startRecording, stopRecording } = useSpeechRecognition();

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

  const handleMicrophoneClick = useCallback(async () => {
    if (isRecording) {
      try {
        const transcript = await stopRecording();
        if (transcript) {
          setInput((prev) => prev + (prev ? ' ' : '') + transcript);
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    } else {
      try {
        await startRecording();
      } catch (error) {
        console.error('Error starting recording:', error);
        alert('Unable to access microphone. Please check permissions.');
      }
    }
  }, [isRecording, startRecording, stopRecording]);

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

        <GroupAutocomplete
          value={input}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={t.chat.placeholder}
          className="message-input"
          isTextarea={true}
        />

        <button
          className={`input-icon-btn ${isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
          title={isRecording ? "Stop recording" : isProcessing ? "Processing..." : "Voice input"}
          onClick={handleMicrophoneClick}
          disabled={isProcessing}
        >
          <MicrophoneIcon width={22} height={22} />
        </button>

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
