// ...existing code...
import React from 'react';
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
  inputRef,
  isTextarea = false,
  onKeyDown,
  disabled = false,
}: GroupAutocompleteProps) => {
  if (isTextarea) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        rows={1}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  );
};

export default GroupAutocomplete;

// ...existing code...
