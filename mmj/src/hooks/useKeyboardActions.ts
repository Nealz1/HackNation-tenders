import { useCallback } from 'react';

export interface KeyboardActionsProps {
  isAutocompleteOpen: boolean;
  suggestions: string[];
  selectedIndex: number;
  onArrowDown: () => void;
  onArrowUp: () => void;
  onEnter: (selectedSuggestion?: string) => void;
  onTab: (selectedSuggestion?: string) => void;
  onEscape: () => void;
  onSendMessage: () => void;
}

export const useKeyboardActions = ({
  isAutocompleteOpen,
  suggestions,
  selectedIndex,
  onArrowDown,
  onArrowUp,
  onEnter,
  onTab,
  onEscape,
  onSendMessage,
}: KeyboardActionsProps) => {
  return useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isAutocompleteOpen) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSendMessage();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        onArrowDown();
        break;
      case "ArrowUp":
        e.preventDefault();
        onArrowUp();
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          onEnter(suggestions[selectedIndex]);
        } else if (!e.shiftKey) {
          onSendMessage();
        }
        break;
      case "Tab":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          onTab(suggestions[selectedIndex]);
        } else if (suggestions.length > 0) {
          onTab(suggestions[0]);
        }
        break;
      case "Escape":
        onEscape();
        break;
      default:
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onSendMessage();
        }
    }
  }, [
    isAutocompleteOpen,
    suggestions,
    selectedIndex,
    onArrowDown,
    onArrowUp,
    onEnter,
    onTab,
    onEscape,
    onSendMessage,
  ]);
};

export default useKeyboardActions;
