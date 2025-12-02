import { CloseIcon } from "../icons";
import "./KeyboardShortcutsDialog.css";

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  language: "en" | "pl";
}

interface Shortcut {
  keys: string[];
  descriptionEn: string;
  descriptionPl: string;
}

const shortcuts: Shortcut[] = [
  {
    keys: ["Ctrl", "Shift", "N"],
    descriptionEn: "New chat",
    descriptionPl: "Nowy czat",
  },
  {
    keys: ["Ctrl", "K"],
    descriptionEn: "Search chats",
    descriptionPl: "Przeszukaj czaty",
  },
  {
    keys: ["Ctrl", "B"],
    descriptionEn: "Toggle sidebar",
    descriptionPl: "Przełącz pasek boczny",
  },
  {
    keys: ["Ctrl", ","],
    descriptionEn: "Open settings",
    descriptionPl: "Otwórz ustawienia",
  },
  {
    keys: ["Ctrl", "Shift", "A"],
    descriptionEn: "Open archives",
    descriptionPl: "Otwórz archiwa",
  },
  {
    keys: ["/"],
    descriptionEn: "Focus input",
    descriptionPl: "Aktywuj pole tekstowe",
  },
  {
    keys: ["Esc"],
    descriptionEn: "Close dialog / Blur input",
    descriptionPl: "Zamknij dialog / Opuść pole tekstowe",
  },
  {
    keys: ["?"],
    descriptionEn: "Show keyboard shortcuts",
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
  language,
}: KeyboardShortcutsDialogProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="keyboard-shortcuts-overlay" onClick={onClose} />
      <div className="keyboard-shortcuts-dialog">
        <div className="keyboard-shortcuts-header">
          <h2>{language === "pl" ? "Skróty klawiszowe" : "Keyboard shortcuts"}</h2>
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
                {language === "pl" ? shortcut.descriptionPl : shortcut.descriptionEn}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

