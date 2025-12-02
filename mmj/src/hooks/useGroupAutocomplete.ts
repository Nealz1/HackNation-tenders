import { useCallback } from 'react';

interface UseGroupAutocompleteReturn {
  suggestions: string[];
  loading: boolean;
  error: string | null;
  fetchSuggestions: (query: string) => void;
  clearSuggestions: () => void;
}

export const useGroupAutocomplete = (): UseGroupAutocompleteReturn => {
  const fetchSuggestions = useCallback((_query: string) => {}, []);
  const clearSuggestions = useCallback(() => {}, []);

  return {
    suggestions: [],
    loading: false,
    error: null,
    fetchSuggestions,
    clearSuggestions,
  };
};
