import { useState } from "react";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import "./ArchivesDialog.css";
import { CloseIcon, ChatIcon, TrashIcon } from "../icons";
import type { ChatSession } from "../../types";

interface ArchivesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  archivedSessions: ChatSession[];
  onUnarchiveSession: (sessionId: number) => Promise<void>;
  onDeleteSession: (sessionId: number) => void;
  onDeleteMultiple: (sessionIds: number[]) => Promise<void>;
  t: any;
}

export const ArchivesDialog = ({
  isOpen,
  onClose,
  archivedSessions,
  onUnarchiveSession,
  onDeleteSession,
  t,
}: ArchivesDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  useEscapeKey(isOpen, onClose);

  const handleUnarchive = async (sessionId: number) => {
    setIsProcessing(true);
    try {
      await onUnarchiveSession(sessionId);
    } catch (error) {
      console.error('Failed to unarchive session:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = (sessionId: number) => {
    onDeleteSession(sessionId);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(t.archives ? 'pl-PL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="archives-overlay" onClick={onClose}>
      <div className="archives-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="archives-header">
          <h2>{t.archives.title}</h2>
          <button className="archives-close" onClick={onClose} title={t.archives.close}>
            <CloseIcon />
          </button>
        </div>

        <div className="archives-content">
          {archivedSessions.length === 0 ? (
            <div className="archives-empty">
              <p>{t.archives.noArchived}</p>
            </div>
          ) : (
            <div className="archives-list">
              {archivedSessions.map((session) => (
                <div key={session.id} className="archive-item">
                  <div className="archive-item-icon">
                    <ChatIcon />
                  </div>
                  <div className="archive-item-content">
                    <div className="archive-item-title">{session.title}</div>
                    <div className="archive-item-date">
                      {formatDate(session.updated_at)}
                    </div>
                  </div>
                  <div className="archive-item-actions">
                    <button
                      className="archive-item-icon-btn archive-item-unarchive"
                      onClick={() => handleUnarchive(session.id)}
                      disabled={isProcessing}
                      title={t.archives.unarchive}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 14 4 9 9 4"></polyline>
                        <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                      </svg>
                    </button>
                    <button
                      className="archive-item-icon-btn archive-item-delete"
                      onClick={() => handleDelete(session.id)}
                      disabled={isProcessing}
                      title={t.sidebar.delete}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
