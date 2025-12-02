import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ExplanationDialog.css';
import { CloseIcon, ExplainIcon } from '../icons';
import { authService } from '../../services/authService';

interface ExplanationDialogProps {
  messageText: string;
  onClose: () => void;
}

export const ExplanationDialog = ({ messageText, onClose }: ExplanationDialogProps) => {
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExplanation = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await authService.explainMessage(messageText);
        setExplanation(result.explanation);
      } catch (err) {
        console.error('Failed to fetch explanation:', err);
        setError('Nie udało się pobrać wyjaśnienia. Spróbuj ponownie.');
      } finally {
        setLoading(false);
      }
    };

    fetchExplanation();
  }, [messageText]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="explanation-dialog-overlay" onClick={handleOverlayClick}>
      <div className="explanation-dialog">
        <div className="explanation-dialog-header">
          <h2>
            <ExplainIcon width={20} height={20} />
            Wyjaśnienie decyzji systemu
          </h2>
          <button
            className="explanation-dialog-close"
            onClick={onClose}
            aria-label="Close explanation"
          >
            <CloseIcon width={20} height={20} />
          </button>
        </div>

        <div className="explanation-dialog-content">
          {loading && (
            <div className="explanation-loading">
              <div className="explanation-loading-spinner" />
              <p>Ładowanie wyjaśnienia...</p>
            </div>
          )}

          {error && (
            <div className="explanation-error">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && explanation && (
            <div className="explanation-text markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {explanation}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};