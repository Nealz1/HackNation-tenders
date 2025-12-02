import { useState, useEffect, useCallback, useRef } from "react";
import { SearchIcon, CloseIcon, ChatIcon } from "../icons";
import "./SearchDialog.css";
import type { ChatSession } from "../../types";
import { API_BASE_URL, STORAGE_KEYS } from "../../config/constants";
import { useEscapeKey } from "../../hooks/useEscapeKey";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  onSelectSession: (sessionId: number | string) => void;
  language: "en" | "pl";
}

interface SearchResult {
  sessionId: number | string;
  sessionTitle: string;
  matchedMessage: string;
  updatedAt: string;
}

const SEARCH_DEBOUNCE_MS = 300;
const SKELETON_ITEMS_COUNT = 3;

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const SearchResultItem = ({
  result,
  searchQuery,
  onSelect,
  formatDate,
  highlightMatch,
}: {
  result: SearchResult;
  searchQuery: string;
  onSelect: () => void;
  formatDate: (dateStr: string) => string;
  highlightMatch: (text: string, query: string) => string;
}) => (
  <div className="search-result-item" onClick={onSelect}>
    <div className="search-result-icon">
      <ChatIcon width={20} height={20} />
    </div>
    <div className="search-result-content">
      <div
        className="search-result-title"
        dangerouslySetInnerHTML={{
          __html: highlightMatch(result.sessionTitle, searchQuery),
        }}
      />
      <div
        className="search-result-text"
        dangerouslySetInnerHTML={{
          __html: highlightMatch(result.matchedMessage, searchQuery),
        }}
      />
    </div>
    <div className="search-result-date">
      {formatDate(result.updatedAt)}
    </div>
  </div>
);

const SkeletonLoader = () => (
  <div className="search-dialog-results search-loading">
    {Array.from({ length: SKELETON_ITEMS_COUNT }, (_, i) => (
      <div key={i} className="search-result-item skeleton">
        <div className="search-result-icon skeleton-icon">
          <div className="skeleton-circle"></div>
        </div>
        <div className="search-result-content">
          <div className="skeleton-title"></div>
          <div className="skeleton-text"></div>
        </div>
        <div className="search-result-date">
          <div className="skeleton-date"></div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ language }: { language: "en" | "pl" }) => (
  <div className="search-dialog-empty">
    <SearchIcon width={48} height={48} />
    <p>
      {language === "pl"
        ? "Wyszukaj wiadomości w czatach"
        : "Search for messages in chats"}
    </p>
    <span>
      {language === "pl"
        ? "Wpisz zapytanie, aby rozpocząć wyszukiwanie"
        : "Type a query to start searching"}
    </span>
  </div>
);

const NoResults = ({ language }: { language: "en" | "pl" }) => (
  <div className="search-dialog-no-results">
    <SearchIcon width={48} height={48} />
    <p>{language === "pl" ? "Nie znaleziono" : "No results found"}</p>
    <span>
      {language === "pl"
        ? "Spróbuj innego zapytania"
        : "Try a different search"}
    </span>
  </div>
);

export const SearchDialog = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
  language,
}: SearchDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    onClose();
    setSearchQuery("");
    setSearchResults([]);
  }, [onClose]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEscapeKey(isOpen, handleClose);

  const searchInSession = async (
    session: ChatSession,
    query: string
  ): Promise<SearchResult | null> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/sessions/${session.id}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) return null;

      const data = await response.json();
      const messages = data.messages || [];

      for (const msg of messages) {
        if (msg.content && msg.content.toLowerCase().includes(query)) {
          return {
            sessionId: session.id,
            sessionTitle: session.title,
            matchedMessage: msg.content,
            updatedAt: session.updated_at,
          };
        }
      }
    } catch (error) {
      console.error(`Error fetching messages for session ${session.id}:`, error);
    }

    return null;
  };

  const performSearch = useCallback(async (query: string) => {
    setIsSearching(true);
    const results: SearchResult[] = [];
    const lowercaseQuery = query.toLowerCase();

    const searchPromises = sessions.map((session) =>
      searchInSession(session, lowercaseQuery)
    );

    const allResults = await Promise.all(searchPromises);
    results.push(...allResults.filter((result): result is SearchResult => result !== null));

    setSearchResults(results);
    setIsSearching(false);
  }, [sessions]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  const highlightMatch = useCallback((text: string, query: string): string => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
    const parts = text.split(regex);
    return parts
      .map((part) => (regex.test(part) ? `<mark>${part}</mark>` : part))
      .join("");
  }, []);

  const formatDate = useCallback((dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return language === "pl" ? "Dziś" : "Today";
    if (diffDays === 1) return language === "pl" ? "Wczoraj" : "Yesterday";
    if (diffDays <= 7)
      return language === "pl" ? `${diffDays} dni temu` : `${diffDays} days ago`;

    return date.toLocaleDateString(language === "pl" ? "pl-PL" : "en-US", {
      month: "short",
      day: "numeric",
    });
  }, [language]);

  const handleSelectResult = useCallback((sessionId: number | string) => {
    onSelectSession(sessionId);
    onClose();
    setSearchQuery("");
  }, [onSelectSession, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="search-dialog-overlay" onClick={handleClose} />
      <div className="search-dialog">
        <div className="search-dialog-header">
          <div className="search-dialog-input-wrapper">
            <SearchIcon width={20} height={20} />
            <input
              ref={inputRef}
              type="text"
              placeholder={
                language === "pl" ? "Przeszukaj czaty" : "Search chats"
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-dialog-input"
            />
            {searchQuery && (
              <button
                className="search-dialog-clear-btn"
                onClick={() => setSearchQuery("")}
              >
                <CloseIcon width={16} height={16} />
              </button>
            )}
          </div>
          <button className="search-dialog-close-btn" onClick={handleClose}>
            <CloseIcon width={20} height={20} />
          </button>
        </div>

        <div className="search-dialog-content">
          {!searchQuery && <EmptyState language={language} />}

          {searchQuery && isSearching && <SkeletonLoader />}

          {searchQuery && !isSearching && searchResults.length === 0 && (
            <NoResults language={language} />
          )}

          {searchQuery && !isSearching && searchResults.length > 0 && (
            <div className="search-dialog-results">
              {searchResults.map((result, index) => (
                <SearchResultItem
                  key={`${result.sessionId}-${index}`}
                  result={result}
                  searchQuery={searchQuery}
                  onSelect={() => handleSelectResult(result.sessionId)}
                  formatDate={formatDate}
                  highlightMatch={highlightMatch}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
