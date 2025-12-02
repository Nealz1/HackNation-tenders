import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./App.css";
import { Sidebar } from "./components/sidebar";
import { Header } from "./components/header";
import { ChatContainer } from "./components/chatContainer";
import { MessageInput } from "./components/messageInput";
import { DeleteDialog } from "./components/deleteDialog";
import { ErrorBanner } from "./components/errorBanner";
import { SearchDialog } from "./components/searchDialog";
import { useLanguage } from "./hooks/useLanguage";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useChatHistory } from "./hooks/useChatHistory";
import { useChatMessages } from "./hooks/useChatMessages";
import { useSessionOperations } from "./hooks/useSessionOperations";
import { useSessionLoader } from "./hooks/useSessionLoader";
import { useMessageHandlers } from "./hooks/useMessageHandlers";
import { useSessionHandlers } from "./hooks/useSessionHandlers";
import { STORAGE_KEYS } from "./config/constants";

function App() {
  const { sessionId: urlSessionId } = useParams<{ sessionId?: string }>();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR_OPEN);
    return saved ? JSON.parse(saved) : true;
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<number | string | null>(null);
  const [chatNotFoundError, setChatNotFoundError] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const user = null;
  const handleLogin = () => {};
  const handleLogout = () => {};

  const {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    loadSession,
    deleteSession,
    refreshSessions,
    loading,
  } = useChatHistory(!!user);

  const { messages, setMessages, isLoading, sendMessage, cancelMessage } = useChatMessages(
    currentSessionId,
    refreshSessions,
    sessions
  );

  const {handleEditMessage, handleNavigateVersion } = useMessageHandlers(
    currentSessionId,
    messages,
    setMessages
  );

  const _sessionHandlers: any = (useSessionHandlers as any)(
    sessions,
    currentSessionId,
    messages,
    setMessages,
    setCurrentSessionId,
    undefined,
    undefined,
    loadSession,
    deleteSession
  );
  const { handleExportPdf, handleDeleteSession: handleDeleteSessionInternal } = _sessionHandlers;

  const sessionOperations: any = (useSessionOperations as any)(
    setMessages,
    undefined
  );

  useSessionLoader(
    urlSessionId,
    user,
    loading,
    currentSessionId,
    setCurrentSessionId,
    setMessages,
    loadSession,
    () => setChatNotFoundError(true)
  );

  const navigate = useNavigate();

  const handleNewChat = async () => {
    setMessages([]);
    setCurrentSessionId(null);
    navigate('/');
  };

  useKeyboardShortcuts({
    onNewChat: handleNewChat,
    onSearch: () => setSearchDialogOpen(true),
    onToggleSidebar: () => setSidebarOpen(!sidebarOpen),
    onFocusInput: () => {
      const input = document.querySelector<HTMLInputElement>('.message-input');
      input?.focus();
    },
    isInputFocused,
  });



  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, String(currentSessionId));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    }
  }, [currentSessionId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_OPEN, JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);



  const handleDeleteSession = (sessionId: number | string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteSession = async () => {
    if (sessionToDelete !== null) {
      await handleDeleteSessionInternal(sessionToDelete);
      setSessionToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    return await sendMessage(message, t, setCurrentSessionId);
  };

  return (
    <div className="app light">
      <Sidebar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenSearch={() => setSearchDialogOpen(true)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onSelectSession={sessionOperations.handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onExportPdf={handleExportPdf}
      />

      <main className="main-content">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          currentSessionId={currentSessionId}
          onDeleteSession={handleDeleteSession}
          onExportPdf={handleExportPdf}
        />

        <ChatContainer
        messages={messages}
        onSendMessage={handleSendMessage}
        onCancelMessage={cancelMessage}
        onEditMessage={handleEditMessage}
        onNavigateVersion={handleNavigateVersion}
        urlSessionId={urlSessionId}
        isLoading={isLoading}
      />

      {/* Always show input in main view so New Chat shows the input immediately */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onFocusChange={setIsInputFocused}
        isLoading={isLoading}
        onCancel={cancelMessage}
      />
      </main>

      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteSession}
        title={t.sidebar.deleteDialogTitle}
        message={t.sidebar.deleteDialogMessage}
        cancelText={t.sidebar.cancel}
        deleteText={t.sidebar.delete}
      />



      <SearchDialog
        isOpen={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        sessions={sessions}
        onSelectSession={sessionOperations.handleSelectSession}
      />



        
      {chatNotFoundError && (
        <ErrorBanner
          message={t.chat.chatNotFoundMessage}
          onClose={() => setChatNotFoundError(false)}
        />
      )}


    </div>
  );
}

export default App;
