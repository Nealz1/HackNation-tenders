import { useState, useEffect, useRef, useCallback } from "react";
import { useGroupAutocomplete } from "../../hooks/useGroupAutocomplete";
import { AUTOCOMPLETE_CONSTANTS } from "../../config/constants";
import "./GroupAutocomplete.css";

interface GroupAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
  isTextarea?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
}

export const GroupAutocomplete = ({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  className = "",
  inputRef: externalRef,
  isTextarea = false,
  onKeyDown: externalOnKeyDown,
  disabled = false,
}: GroupAutocompleteProps) => {
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const isClickingDropdown = useRef(false);
  const { suggestions, fetchSuggestions, clearSuggestions } = useGroupAutocomplete();

  const inputRef = (externalRef || (isTextarea ? internalTextareaRef : internalInputRef)) as
    React.RefObject<HTMLInputElement> | React.RefObject<HTMLTextAreaElement>;

  useEffect(() => {
    setIsAutocompleteOpen(suggestions.length > 0);
    setSelectedIndex(-1);
  }, [suggestions]);

  const scrollSuggestionIntoView = useCallback(() => {
    const dropdown = suggestionsRef.current;
    const selectedItem = dropdown?.querySelector('.group-autocomplete-item.selected') as HTMLElement;

    if (selectedItem && dropdown) {
      selectedItem.scrollIntoView({
        behavior: 'instant',
        block: 'nearest'
      });
    }
  }, []);

  useEffect(() => {
    if (selectedIndex >= 0) {
      scrollSuggestionIntoView();
    }
  }, [selectedIndex, scrollSuggestionIntoView]);

  const detectGroupPattern = useCallback((text: string, cursorPos?: number): string | null => {
    const position = cursorPos ?? text.length;
    const textBeforeCursor = text.substring(0, position);
    const match = textBeforeCursor.match(/(?:^|\s)([Ww][Cc][Yy][a-zA-Z0-9]*)$/);
    return match ? match[1].toUpperCase() : null;
  }, []);

  const insertSuggestion = useCallback((suggestion: string) => {
    const element = inputRef.current;
    if (!element) return;

    const cursorPos = element.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPos);
    const textAfterCursor = value.substring(cursorPos);

    const match = textBeforeCursor.match(/(?:^|\s)([Ww][Cc][Yy][a-zA-Z0-9]*)$/);
    if (match) {
      const patternStart = textBeforeCursor.length - match[1].length;
      const newText = textBeforeCursor.substring(0, patternStart) + suggestion + textAfterCursor;
      onChange(newText);
      clearSuggestions();
      setIsAutocompleteOpen(false);

      setTimeout(() => {
        element.focus();
        element.setSelectionRange(patternStart + suggestion.length, patternStart + suggestion.length);
      }, AUTOCOMPLETE_CONSTANTS.CURSOR_ADJUSTMENT_DELAY);
    }
  }, [value, onChange, clearSuggestions, inputRef]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    const cursorPos = (e.target as HTMLInputElement).selectionStart || undefined;
    const currentPattern = detectGroupPattern(newValue, cursorPos);
    if (currentPattern && currentPattern.length >= AUTOCOMPLETE_CONSTANTS.MIN_GROUP_LENGTH) {
      fetchSuggestions(currentPattern);
    } else {
      clearSuggestions();
    }
  }, [onChange, fetchSuggestions, clearSuggestions, detectGroupPattern]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isAutocompleteOpen && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : 0);
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : suggestions.length - 1);
        return;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0) {
          insertSuggestion(suggestions[selectedIndex]);
        } else if (suggestions.length > 0) {
          insertSuggestion(suggestions[0]);
        }
        return;
      } else if (e.key === 'Tab' && selectedIndex >= 0) {
        e.preventDefault();
        insertSuggestion(suggestions[selectedIndex]);
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        clearSuggestions();
        setIsAutocompleteOpen(false);
        setSelectedIndex(-1);
        return;
      }
    }

    if (externalOnKeyDown) {
      externalOnKeyDown(e);
    }
  }, [isAutocompleteOpen, suggestions, selectedIndex, insertSuggestion, clearSuggestions, externalOnKeyDown]);

  const handleBlur = useCallback(() => {
    if (isClickingDropdown.current) {
      isClickingDropdown.current = false;
      return;
    }

    setTimeout(() => {
      setIsAutocompleteOpen(false);
    }, AUTOCOMPLETE_CONSTANTS.BLUR_DELAY);

    if (onBlur) {
      setTimeout(() => {
        onBlur();
      }, AUTOCOMPLETE_CONSTANTS.BLUR_DELAY);
    }
  }, [onBlur]);

  const commonProps = {
    value,
    onChange: handleInputChange,
    onKeyDown: handleKeyDown,
    onFocus,
    onBlur: handleBlur,
    placeholder,
    disabled,
    className,
  };

  return (
    <div className="group-autocomplete-wrapper">
      {isTextarea ? (
        <textarea
          ref={externalRef as React.RefObject<HTMLTextAreaElement> || internalTextareaRef}
          rows={1}
          {...commonProps}
        />
      ) : (
        <input
          ref={externalRef as React.RefObject<HTMLInputElement> || internalInputRef}
          type="text"
          {...commonProps}
        />
      )}

      {isAutocompleteOpen && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="group-autocomplete-dropdown"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            isClickingDropdown.current = true;
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`group-autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                isClickingDropdown.current = true;
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                insertSuggestion(suggestion);
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

