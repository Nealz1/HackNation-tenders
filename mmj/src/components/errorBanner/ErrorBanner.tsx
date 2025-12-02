import { useEffect } from "react";
import "./ErrorBanner.css";

interface ErrorBannerProps {
  message: string;
  onClose: () => void;
}

export const ErrorBanner = ({ message, onClose }: ErrorBannerProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="error-banner">
      <div className="error-banner-content">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8C1.5 11.59 4.41 14.5 8 14.5C11.59 14.5 14.5 11.59 14.5 8C14.5 4.41 11.59 1.5 8 1.5ZM8 13C5.24 13 3 10.76 3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13Z" fill="currentColor"/>
          <path d="M7.25 4.75H8.75V9.25H7.25V4.75Z" fill="currentColor"/>
          <path d="M7.25 10.25H8.75V11.75H7.25V10.25Z" fill="currentColor"/>
        </svg>
        <span>{message}</span>
      </div>
      <button className="error-banner-close" onClick={onClose} aria-label="Close">
        ×
      </button>
    </div>
  );
};
