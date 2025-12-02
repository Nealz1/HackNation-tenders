import { useState, useEffect, useCallback, useRef } from 'react';

interface UseGroupAutocompleteReturn {
  suggestions: string[];
  loading: boolean;
  error: string | null;
  fetchSuggestions: (query: string) => void;
  clearSuggestions: () => void;
}

export const useGroupAutocomplete = (): UseGroupAutocompleteReturn => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<number | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/groups/search?q=${encodeURIComponent(query.trim())}&limit=10`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSuggestions(data.groups || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetchSuggestions = useCallback((query: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
  }, [fetchSuggestions]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    suggestions,
    loading,
    error,
    fetchSuggestions: debouncedFetchSuggestions,
    clearSuggestions,
  };
};

export default useGroupAutocomplete;
