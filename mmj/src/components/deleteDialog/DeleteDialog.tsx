import { useEscapeKey } from "../../hooks/useEscapeKey";
import "./DeleteDialog.css";

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  cancelText: string;
  deleteText: string;
}

export const DeleteDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  cancelText,
  deleteText,
}: DeleteDialogProps) => {
  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="delete-dialog-overlay" onClick={onClose}>
      <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="delete-dialog-header">
          <h3>{title}</h3>
        </div>
        <div className="delete-dialog-body">
          <p>{message}</p>
        </div>
        <div className="delete-dialog-footer">
          <button className="cancel-button" onClick={onClose}>
            {cancelText}
          </button>
          <button className="delete-button" onClick={handleConfirm}>
            {deleteText}
          </button>
        </div>
      </div>
    </div>
  );
};
