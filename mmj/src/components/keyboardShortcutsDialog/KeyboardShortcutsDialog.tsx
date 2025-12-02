import { CloseIcon } from "../icons";
import "./KeyboardShortcutsDialog.css";

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  descriptionPl: string;
}

const shortcuts: Shortcut[] = [
  {
    keys: ["Ctrl", "Shift", "N"],
    descriptionPl: "Nowy czat",
  },
  {
    keys: ["Ctrl", "K"],
    descriptionPl: "Przeszukaj czaty",
  },
  {
    keys: ["Ctrl", "B"],
    descriptionPl: "Przełącz pasek boczny",
  },
  {
    keys: ["Ctrl", ","],
    descriptionPl: "Otwórz ustawienia",
  },
  {
    keys: ["/"],
    descriptionPl: "Aktywuj pole tekstowe",
  },
  {
    keys: ["Esc"],
    descriptionPl: "Zamknij dialog / Opuść pole tekstowe",
  },
  {
    keys: ["?"],
    descriptionPl: "Pokaż skróty klawiszowe",
  },
];

const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

const formatKey = (key: string): string => {
  if (key === "Ctrl" && isMac) return "⌘";
  if (key === "Shift") return isMac ? "⇧" : "Shift";
  if (key === "Esc") return isMac ? "⎋" : "Esc";
  return key;
};

export const KeyboardShortcutsDialog = ({
  isOpen,
  onClose,
}: KeyboardShortcutsDialogProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="keyboard-shortcuts-overlay" onClick={onClose} />
      <div className="keyboard-shortcuts-dialog">
        <div className="keyboard-shortcuts-header">
          <h2>Skróty klawiszowe</h2>
          <button className="keyboard-shortcuts-close" onClick={onClose}>
            <CloseIcon width={20} height={20} />
          </button>
        </div>
        <div className="keyboard-shortcuts-content">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="keyboard-shortcut-item">
              <div className="keyboard-shortcut-keys">
                {shortcut.keys.map((key, keyIndex) => (
                  <span key={keyIndex}>
                    <kbd className="keyboard-key">{formatKey(key)}</kbd>
                    {keyIndex < shortcut.keys.length - 1 && (
                      <span className="keyboard-plus">+</span>
                    )}
                  </span>
                ))}
              </div>
              <div className="keyboard-shortcut-description">
                {shortcut.descriptionPl}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};