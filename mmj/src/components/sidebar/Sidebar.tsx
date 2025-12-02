import "./Sidebar.css";
import { useDropdownMenu } from "../../hooks/useDropdownMenu";
import { useTranslations } from "../../hooks/useTranslations";
import { Tooltip } from "../tooltip";

import {
  PlusIcon,
  SearchIcon,
  ChatIcon,
  DotsVerticalIcon,
  TrashIcon,
  UserIcon,
  LogoutIcon,
  LoginIcon,
  EditIcon,
  DownloadIcon,
  MenuIcon
} from "../icons";
import type { User, ChatSession } from "../../types";
import { useState } from "react";

interface SidebarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenSearch?: () => void;
  sessions: ChatSession[];
  currentSessionId: number | string | null;
  onNewChat: () => void;
  onSelectSession: (sessionId: number | string) => void;
  onDeleteSession: (sessionId: number | string) => void;
  onRenameSession?: (sessionId: number | string, newTitle: string) => void;
  onExportPdf?: (sessionId: number | string) => void;
}

const ChatHistoryItem = ({
  session,
  isActive,
  onSelect,
  onDelete,
  onRename,
  onExport,
  t,
}: {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename?: (newTitle: string) => void;
  onExport?: () => void;
  t: any;
}) => {
  const chatMenu = useDropdownMenu();
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(session.title);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

  const updateDropdownPosition = () => {
    if (chatMenu.menuRef.current) {
      const rect = chatMenu.menuRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.right - 160 // 160px is min-width of dropdown
      });
    }
  };

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue !== session.title) {
      onRename?.(renameValue.trim());
    }
    setIsRenaming(false);
  };

  const handleRenameCancel = () => {
    setRenameValue(session.title);
    setIsRenaming(false);
  };

  return (
    <div
      className={`chat-history-item ${isActive ? 'active' : ''}`}
      onClick={() => !isRenaming && onSelect()}
    >
      <ChatIcon />
      {isRenaming ? (
        <input
          type="text"
          className="chat-rename-input"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleRenameSubmit();
            } else if (e.key === 'Escape') {
              handleRenameCancel();
            }
          }}
          onClick={(e) => e.stopPropagation()}
          onFocus={(e) => e.target.select()}
          autoFocus
        />
      ) : (
        <span>{session.title}</span>
      )}
      <div className="chat-item-menu" ref={chatMenu.menuRef}>
        <button
          className="chat-menu-btn"
          onClick={(e) => {
            e.stopPropagation();
            updateDropdownPosition();
            chatMenu.toggle();
          }}
          title={t.header.moreOptions}
        >
          <DotsVerticalIcon />
        </button>
        {chatMenu.isOpen && dropdownPosition && (
          <div 
            className="chat-dropdown"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`
            }}
          >
            {onRename && (
              <button
                className="chat-dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRenaming(true);
                  chatMenu.close();
                }}
              >
                <EditIcon />
                {t.sidebar.rename}
              </button>
            )}

            {onExport && (
              <button
                className="chat-dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  onExport();
                  chatMenu.close();
                }}
              >
                <DownloadIcon />
                {t.sidebar.exportPdf}
              </button>
            )}

            <button
              className="chat-dropdown-item danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                chatMenu.close();
              }}
            >
              <TrashIcon />
              {t.sidebar.delete}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};



export const Sidebar = ({
  sidebarOpen,
  user,
  onLogin,
  onLogout,
  onOpenSearch,
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  onExportPdf,
  onToggleSidebar
}: SidebarProps & { onOpenHelp?: () => void, onToggleSidebar?: () => void }) => {
  const userMenu = useDropdownMenu();
  const { t } = useTranslations();

  const isLoggedIn = !!user;
  const displayName = user ? `${user.first_name} ${user.last_name}` : t.sidebar.guest;

  const formatSessionDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t.sidebar.today;
    if (diffDays === 1) return 'Wczoraj';
    if (diffDays <= 7) return 'Ostatnie 7 dni';
    if (diffDays <= 30) return 'Ostatnie 30 dni';
    return 'Starsze';
  };

  const sessionsNotInGroups = sessions.filter(session => !(session as any).is_in_group);

  const groupedSessions = sessionsNotInGroups.reduce((acc, session) => {
    const group = formatSessionDate(session.updated_at);
    if (!acc[group]) acc[group] = [];
    acc[group].push(session);
    return acc;
  }, {} as Record<string, ChatSession[]>);

  return (
    <aside className={`sidebar ${sidebarOpen ? '' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">
          {/* menu toggle to the left of title */}
          <button
            className="sidebar-toggle"
            onClick={() => onToggleSidebar && onToggleSidebar()}
            title={sidebarOpen ? 'Zamknij panel' : 'Otwórz panel'}
          >
            <MenuIcon />
          </button>

          {/* removed background logo per request */}
          {sidebarOpen && <h2>DataServe</h2>}
        </div>

        {sidebarOpen ? (
          <button className="new-chat-btn" onClick={onNewChat}>
            <PlusIcon />
            <span>{t.sidebar.newChat}</span>
            <span className="button-shortcut">Ctrl+Alt+N</span>
          </button>
        ) : (
          <Tooltip text={t.sidebar.newChat} shortcut="Ctrl+Alt+N">
            <button className="new-chat-btn" onClick={onNewChat}>
              <PlusIcon />
            </button>
          </Tooltip>
        )}

        {sidebarOpen ? (
          <button
            className="search-chat-btn"
            onClick={onOpenSearch}
          >
            <SearchIcon />
            <span>{t.sidebar.searchChats}</span>
            <span className="button-shortcut">Ctrl+K</span>
          </button>
        ) : (
          <Tooltip text={t.sidebar.searchChats} shortcut="Ctrl+K">
            <button
              className="search-btn"
              onClick={onOpenSearch}
            >
              <SearchIcon width={18} height={18} />
            </button>
          </Tooltip>
        )}
      </div>



      {sidebarOpen && sessionsNotInGroups.length > 0 && (
        <div className="chat-history">
          {Object.entries(groupedSessions).map(([group, groupSessions]) => (
            <div className="chat-history-section" key={group}>
              <h3>{group}</h3>
              {groupSessions.map((session) => (
                <ChatHistoryItem
                  key={session.id}
                  session={session}
                  isActive={currentSessionId === session.id}
                  onSelect={() => onSelectSession(session.id)}
                  onDelete={() => onDeleteSession(session.id)}
                  onRename={(newTitle) => onRenameSession?.(session.id, newTitle)}
                  onExport={() => onExportPdf?.(session.id)}
                  t={t}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="sidebar-footer">
        <div className="user-menu">
          <div
            className="user-info"
            onClick={(e) => {
              if (!sidebarOpen) {
                e.stopPropagation();
                userMenu.toggle();
              }
            }}
            style={{ cursor: !sidebarOpen ? 'pointer' : 'default' }}
          >
            <UserIcon />
            {sidebarOpen && <span>{displayName}</span>}
          </div>
          <div className="user-menu-dropdown" ref={userMenu.menuRef}>
            {sidebarOpen && (
              <button
                className="user-menu-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  userMenu.toggle();
                }}
                title={t.sidebar.userMenu}
              >
                <DotsVerticalIcon />
              </button>
            )}
            {userMenu.isOpen && (
              <div className="user-dropdown">
                <button
                  className="user-dropdown-item"
                  onClick={() => {
                    if (isLoggedIn) {
                      onLogout();
                    } else {
                      onLogin();
                    }
                    userMenu.close();
                  }}
                >
                  {isLoggedIn ? <LogoutIcon /> : <LoginIcon />}
                  {isLoggedIn ? t.sidebar.logout : t.sidebar.login}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
