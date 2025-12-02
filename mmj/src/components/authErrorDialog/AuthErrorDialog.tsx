import { useEscapeKey } from "../../hooks/useEscapeKey";
import { CloseIcon } from "../icons";
import "./AuthErrorDialog.css";

interface AuthErrorDialogProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  title: string;
  okText: string;
}

export const AuthErrorDialog = ({ isOpen, message, onClose, title, okText }: AuthErrorDialogProps) => {
  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="auth-error-dialog" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>{title}</h2>
          <button className="dialog-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="dialog-body">
          <p>{message}</p>
        </div>
        <div className="dialog-footer">
          <button className="dialog-ok-button" onClick={onClose}>{okText}</button>
        </div>
      </div>
    </div>
  );
};
