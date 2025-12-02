import "./KeyboardShortcutsDialog.css";

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsDialog = ({
  isOpen,
  onClose,
}: KeyboardShortcutsDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="keyboard-shortcuts-overlay" onClick={onClose}>
      <div className="keyboard-shortcuts-dialog">
        <div className="keyboard-shortcuts-header">
          <h2>Skróty klawiszowe</h2>
        </div>
        <div className="keyboard-shortcuts-content">
          Skróty klawiszowe są skonfigurowane.
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsDialog;
