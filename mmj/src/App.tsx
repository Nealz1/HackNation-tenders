import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import { dispatchCustomEvent } from "./utils/eventUtils";
import { Sidebar } from "./components/sidebar";
import { Header } from "./components/header";
import { ChatContainer } from "./components/chatContainer";
import { MessageInput } from "./components/messageInput";
import { SettingsDialog } from "./components/settingsDialog";
import { DeleteDialog } from "./components/deleteDialog";
import { ArchivesDialog } from "./components/archivesDialog";
import { HelpDialog } from "./components/helpDialog";
import { BackgroundLogo } from "./components/backgroundLogo";
import { ErrorBanner } from "./components/errorBanner";
import { AuthErrorDialog } from "./components/authErrorDialog";
import { SearchDialog } from "./components/searchDialog";
import { GroupsDialog } from "./components/groupsDialog";
import { GroupView } from "./pages/GroupView";
import { useAuth } from "./hooks/useAuth";
import { useSessionValidation } from "./hooks/useSessionValidation";
import { useLanguage } from "./hooks/useLanguage";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useChatHistory } from "./hooks/useChatHistory";
import { useChatMessages } from "./hooks/useChatMessages";
import { useSessionOperations } from "./hooks/useSessionOperations";
import { useSessionLoader } from "./hooks/useSessionLoader";
import { useMessageHandlers } from "./hooks/useMessageHandlers";
import { useSessionHandlers } from "./hooks/useSessionHandlers";
import { useGroups } from "./hooks/useGroups";
import { STORAGE_KEYS } from "./config/constants";

function App() {
  const { sessionId: urlSessionId, groupId: urlGroupId } = useParams<{ sessionId?: string; groupId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    return saved ? JSON.parse(saved) : true;
  });

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR_OPEN);
    return saved ? JSON.parse(saved) : true;
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [archivesOpen, setArchivesOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupDeleteDialogOpen, setGroupDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<number | string | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const [chatNotFoundError, setChatNotFoundError] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [groupsSelectMode, setGroupsSelectMode] = useState(false);
  const [groupsSelectedSessionId, setGroupsSelectedSessionId] = useState<number | string | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const {
    user,
    showAuthErrorDialog,
    authErrorMessage,
    handleLogin,
    handleLogout,
    handleSessionExpired,
    closeAuthErrorDialog,
    authInitialized,
  } = useAuth();

  const {
    groups,
    createGroup,
    deleteGroup,
    loadGroupSessions,
    addSessionToGroup,
    ungroupSession,
    groupSessions,
  } = useGroups(!!user);

  const {
    sessions,
    archivedSessions,
    currentSessionId,
    setCurrentSessionId,
    loadSession,
    archiveSession,
    unarchiveSession,
    deleteSession,
    updateSessionTitle,
    pinSession,
    refreshSessions,
    refreshArchivedSessions,
    loading,
  } = useChatHistory(!!user);

  const { messages, setMessages, isLoading, sendMessage, cancelMessage } = useChatMessages(
    t.chat.welcomeMessage,
    currentSessionId,
    refreshSessions,
    sessions
  );

  const { handleRegenerateMessage, handleEditMessage, handleNavigateVersion } = useMessageHandlers(
    currentSessionId,
    messages,
    setMessages
  );

  const { handlePinSession, handleExportPdf, handleDeleteSession: handleDeleteSessionInternal } = useSessionHandlers(
    sessions,
    currentSessionId,
    messages,
    setMessages,
    setCurrentSessionId,
    t.chat.welcomeMessage,
    pinSession,
    loadSession,
    deleteSession
  );

  const sessionOperations = useSessionOperations(
    currentSessionId,
    setCurrentSessionId,
    setMessages,
    t.chat.welcomeMessage,
    archiveSession,
    unarchiveSession,
    deleteSession,
    updateSessionTitle,
    refreshArchivedSessions
  );

  useSessionValidation(!!user, handleSessionExpired);

  useSessionLoader(
    urlSessionId,
    user,
    loading,
    currentSessionId,
    setCurrentSessionId,
    setMessages,
    loadSession,
    t.chat.welcomeMessage,
    () => setChatNotFoundError(true)
  );

  useKeyboardShortcuts({
    onNewChat: sessionOperations.handleNewChat,
    onSearch: () => setSearchDialogOpen(true),
    onToggleSidebar: () => setSidebarOpen(!sidebarOpen),
    onOpenSettings: () => setSettingsOpen(true),
    onOpenArchives: () => setArchivesOpen(true),
    ...(user && { onOpenGroups: () => setGroupsOpen(true) }),
    onFocusInput: () => {
      const input = document.querySelector<HTMLInputElement>('.message-input');
      input?.focus();
    },
    isInputFocused,
  });

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && !isInputFocused) {
        const activeElement = document.activeElement;
        const isInInput = activeElement instanceof HTMLInputElement ||
                         activeElement instanceof HTMLTextAreaElement ||
                         activeElement?.hasAttribute('contenteditable');

        if (!isInInput) {
          e.preventDefault();
          setSettingsOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isInputFocused]);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, String(currentSessionId));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    }
  }, [currentSessionId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_OPEN, JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    if (!authInitialized) return; // wait until auth resolved
    if (user) return; // logged in - do nothing
    const path = location.pathname;
    const protectedPattern = /^\/(c|g)\//;
    if (protectedPattern.test(path)) {
      navigate('/', { replace: true });
    }
  }, [authInitialized, user, location.pathname, navigate]);

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

  const handleDeleteGroup = (groupId: number) => {
    setGroupToDelete(String(groupId));
    setGroupDeleteDialogOpen(true);
  };

  const confirmDeleteGroup = async () => {
    if (groupToDelete !== null) {
      const groupIdToDelete = parseInt(groupToDelete);
      await deleteGroup(groupIdToDelete);
      await refreshSessions();

      dispatchCustomEvent('groupDeleted', { groupId: groupIdToDelete });

      setGroupToDelete(null);
      setGroupDeleteDialogOpen(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    return await sendMessage(message, t, setCurrentSessionId);
  };

  const handleSendMessageInGroup = async (message: string, groupId: number) => {
    sessionOperations.handleNewChat();
    const response = await sendMessage(message, t, setCurrentSessionId);
    if (response && response.session_id) {
      await addSessionToGroup(response.session_id, groupId);
      await refreshSessions();
      await loadGroupSessions(groupId);
      dispatchCustomEvent('groupUpdated', { groupId, sessionId: response.session_id });
    }
  };

  const handleCreateGroup = async (name: string) => {
    await createGroup(name);
  };

  const handleSelectGroup = (groupId: number) => {
    window.location.href = `/g/${groupId}`;
  };

  const handleMoveToGroupSession = (sessionId: number | string) => {
    setGroupsSelectedSessionId(sessionId);
    setGroupsSelectMode(true);
    setGroupsOpen(true);
  };

  const handleMoveToGroup = async (groupId: number) => {
    if (groupsSelectedSessionId !== null && typeof groupsSelectedSessionId === 'number') {
      await addSessionToGroup(groupsSelectedSessionId, groupId);
      await refreshSessions();
      await loadGroupSessions(groupId);
      Object.keys(groupSessions).forEach(async (gId) => {
        const groupIdNum = parseInt(gId);
        if (groupIdNum !== groupId) {
          await loadGroupSessions(groupIdNum);
        }
      });
      dispatchCustomEvent('groupUpdated', { groupId, sessionId: groupsSelectedSessionId });
    }
    setGroupsOpen(false);
    setGroupsSelectMode(false);
    setGroupsSelectedSessionId(null);
  };

  const handleOpenGroups = () => {
    setGroupsSelectMode(false);
    setGroupsSelectedSessionId(null);
    setGroupsOpen(true);
  };

  const handleUngroupSession = async (sessionId: number | string) => {
    if (typeof sessionId === 'number') {
      await ungroupSession(sessionId);
      await refreshSessions();
      Object.keys(groupSessions).forEach(async (gId) => {
        await loadGroupSessions(parseInt(gId));
      });
    }
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <Sidebar
        darkMode={darkMode}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenArchives={() => setArchivesOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenSearch={() => setSearchDialogOpen(true)}
        onOpenGroups={() => handleOpenGroups()}
        language={language}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={sessionOperations.handleNewChat}
        onSelectSession={sessionOperations.handleSelectSession}
        onArchiveSession={sessionOperations.handleArchiveSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={sessionOperations.handleRenameSession}
        onPinSession={handlePinSession}
        onExportPdf={handleExportPdf}
        onUngroupSession={handleUngroupSession}
        groups={groups}
        currentGroupId={urlGroupId || null}
        onSelectGroup={handleSelectGroup}
        onMoveToGroup={handleMoveToGroupSession}
        onDeleteGroup={handleDeleteGroup}
        groupSessions={groupSessions}
        onLoadGroupSessions={loadGroupSessions}
      />

      {urlGroupId ? (
        <GroupView
          language={language}
          darkMode={darkMode}
          onSelectSession={sessionOperations.handleSelectSession}
          onSendMessageInGroup={handleSendMessageInGroup}
          isLoading={isLoading}
          onFocusChange={setIsInputFocused}
        />
      ) : (
        <main className="main-content">
          <BackgroundLogo darkMode={darkMode} />

          <Header
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            currentSessionId={currentSessionId}
            onArchiveSession={sessionOperations.handleArchiveSession}
            onDeleteSession={handleDeleteSession}
            onExportPdf={handleExportPdf}
          />

          <ChatContainer
          messages={messages}
          onSendMessage={handleSendMessage}
          onCancelMessage={cancelMessage}
          onRegenerateMessage={handleRegenerateMessage}
          onEditMessage={handleEditMessage}
          onNavigateVersion={handleNavigateVersion}
          darkMode={darkMode}
          urlSessionId={urlSessionId}
          isLoading={isLoading}
          setMessages={setMessages}
        />

        {(urlSessionId || messages.some(msg => msg.sender === "user")) && (
          <MessageInput
            onSendMessage={handleSendMessage}
            onFocusChange={setIsInputFocused}
            isLoading={isLoading}
            onCancel={cancelMessage}
          />
        )}
        </main>
      )}

      <SettingsDialog
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        darkMode={darkMode}
        onThemeChange={setDarkMode}
        language={language}
        onLanguageChange={setLanguage}
        activeSessions={sessions.filter(s => !s.is_archived)}
        onArchiveMultiple={sessionOperations.handleArchiveMultiple}
        onDeleteMultiple={sessionOperations.handleDeleteMultiple}
        user={user}
      />

      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteSession}
        title={t.sidebar.deleteDialogTitle}
        message={t.sidebar.deleteDialogMessage}
        cancelText={t.sidebar.cancel}
        deleteText={t.sidebar.delete}
      />

      <ArchivesDialog
        isOpen={archivesOpen}
        onClose={() => setArchivesOpen(false)}
        archivedSessions={archivedSessions}
        onUnarchiveSession={sessionOperations.handleUnarchiveSession}
        onDeleteSession={sessionOperations.handleDeleteArchivedSession}
        onDeleteMultiple={sessionOperations.handleDeleteMultiple}
        t={t}
      />

      <SearchDialog
        isOpen={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        sessions={sessions}
        onSelectSession={sessionOperations.handleSelectSession}
        language={language}
      />

      <HelpDialog
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
      />

      <AuthErrorDialog
        isOpen={showAuthErrorDialog}
        message={authErrorMessage}
        onClose={closeAuthErrorDialog}
        title={t.auth.errorTitle}
        okText={t.auth.ok}
      />

      {chatNotFoundError && (
        <ErrorBanner
          message={t.chat.chatNotFoundMessage}
          onClose={() => setChatNotFoundError(false)}
        />
      )}

      {user && (
        <>
          <GroupsDialog
            isOpen={groupsOpen}
            onClose={() => {
              setGroupsOpen(false);
              setGroupsSelectMode(false);
              setGroupsSelectedSessionId(null);
            }}
            language={language}
            groups={groups}
            onCreateGroup={handleCreateGroup}
            onSelectGroup={handleSelectGroup}
            selectMode={groupsSelectMode}
            onMoveToGroup={handleMoveToGroup}
            onDeleteGroup={handleDeleteGroup}
            onUngroup={() => {
              if (groupsSelectedSessionId !== null && typeof groupsSelectedSessionId === 'number') {
                handleUngroupSession(groupsSelectedSessionId);
              }
            }}
            isSessionInGroup={
              groupsSelectedSessionId !== null && typeof groupsSelectedSessionId === 'number'
                ? (sessions.find(s => s.id === groupsSelectedSessionId) as any)?.is_in_group || false
                : false
            }
          />

          <DeleteDialog
            isOpen={groupDeleteDialogOpen}
            onClose={() => setGroupDeleteDialogOpen(false)}
            onConfirm={confirmDeleteGroup}
            title={language === 'pl' ? 'Usuń grupę' : 'Delete group'}
            message={language === 'pl'
              ? 'Spowoduje to trwałe usunięcie grupy oraz wszystkich rozmów w niej zawartych.'
              : 'This will permanently delete the group and all chats within it.'}
            cancelText={t.sidebar.cancel}
            deleteText={language === 'pl' ? 'Usuń' : 'Delete'}
          />
        </>
      )}
    </div>
  );
}

export default App;
