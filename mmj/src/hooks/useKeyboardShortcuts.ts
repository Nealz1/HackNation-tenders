import { useEffect } from "react";
import { isMacPlatform } from "../utils/platformUtils";

interface KeyboardShortcutsConfig {
  onNewChat: () => void;
  onSearch: () => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onOpenArchives?: () => void;
  onOpenGroups?: () => void;
  onFocusInput?: () => void;
  isInputFocused?: boolean;
}

export const useKeyboardShortcuts = (config: KeyboardShortcutsConfig) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const modKey = isMacPlatform() ? event.metaKey : event.ctrlKey;

      if (config.isInputFocused && !modKey && event.key !== 'Escape') {
        return;
      }

      if (modKey && event.altKey && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        config.onNewChat();
        return;
      }

      if (modKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        config.onSearch();
        return;
      }

      if (modKey && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        config.onToggleSidebar();
        return;
      }

      if (modKey && event.key === ',') {
        event.preventDefault();
        config.onOpenSettings();
        return;
      }

      if (modKey && event.shiftKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        if (config.onOpenArchives) {
          config.onOpenArchives();
        }
        return;
      }

      if (modKey && event.key.toLowerCase() === 'i') {
        event.preventDefault();
        if (config.onOpenGroups) {
          config.onOpenGroups();
        }
        return;
      }

      if (event.key === '/' && !config.isInputFocused) {
        event.preventDefault();
        if (config.onFocusInput) {
          config.onFocusInput();
        }
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') {
          activeElement.blur();
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [config]);
};
