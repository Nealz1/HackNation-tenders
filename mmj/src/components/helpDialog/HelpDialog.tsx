import { useEscapeKey } from "../../hooks/useEscapeKey";
import "./HelpDialog.css";

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpDialog = ({ isOpen, onClose }: HelpDialogProps) => {
  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="help-dialog-overlay">
      <div className="help-dialog">
        <div className="help-dialog-header">
          <h2>Pomoc</h2>
        </div>
        <div className="help-dialog-content">
          Pomoc jest dostępna w przyszłości.
        </div>
      </div>
    </div>
  );
};

export default HelpDialog;
