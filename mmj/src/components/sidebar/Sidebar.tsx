import "./Sidebar.css";
import { useDropdownMenu } from "../../hooks/useDropdownMenu";
import { useTranslations } from "../../hooks/useTranslations";
import { Tooltip } from "../tooltip";

import {
  PlusIcon,
  SearchIcon,
  ChatIcon,
  DotsVerticalIcon,
  ChevronDownIcon,
  TrashIcon,
  UserIcon,
  FolderIcon,
  SettingsIcon,
  LogoutIcon,
  LoginIcon,
  EditIcon,
  DownloadIcon,
  MenuIcon
} from "../icons";
import type { User, ChatSession, Group } from "../../types";
import { useState } from "react";

interface SidebarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenSearch?: () => void;
  onOpenGroups?: () => void;
  sessions: ChatSession[];
  currentSessionId: number | string | null;
  onNewChat: () => void;
  onSelectSession: (sessionId: number | string) => void;
  onDeleteSession: (sessionId: number | string) => void;
  onRenameSession?: (sessionId: number | string, newTitle: string) => void;
  onExportPdf?: (sessionId: number | string) => void;
  onMoveToGroup?: (sessionId: number | string) => void;
  onUngroupSession?: (sessionId: number | string) => void;
  groups: Group[];
  currentGroupId: string | null;
  onSelectGroup?: (groupId: number) => void;
  onDeleteGroup?: (groupId: number) => void;
  groupSessions?: Record<number, ChatSession[]>;
  onLoadGroupSessions?: (groupId: number) => Promise<ChatSession[]>;
}

const ChatHistoryItem = ({
  session,
  isActive,
  onSelect,
  onDelete,
  onRename,
  onExport,
  onMoveToGroup,
  onUngroup,
  t,
  isLoggedIn,
  isInGroup,
}: {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename?: (newTitle: string) => void;
  onExport?: () => void;
  onMoveToGroup?: (sessionId: number | string) => void;
  onUngroup?: () => void;
  t: any;
  isLoggedIn: boolean;
  isInGroup: boolean;
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
            {!session.is_archived && isLoggedIn && (
              <>
                {isInGroup && onUngroup ? (
                  <button
                    className="chat-dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUngroup();
                      chatMenu.close();
                    }}
                  >
                    <FolderIcon />
                    {t.sidebar.ungroup}
                  </button>
                ) : onMoveToGroup && (
                  <button
                    className="chat-dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveToGroup(session.id);
                      chatMenu.close();
                    }}
                  >
                    <FolderIcon />
                    {t.sidebar.moveToGroup}
                  </button>
                )}
              </>
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

const GroupPreviewChatItem = ({
  session,
  isActive,
  onSelectSession,
  onRenameSession,
  onMoveToGroup,
  onExportPdf,
  onDeleteSession,
  t,
}: {
  session: ChatSession;
  isActive: boolean;
  onSelectSession: (id: number | string) => void;
  onRenameSession?: (sessionId: number | string, currentTitle: string) => void;
  onMoveToGroup?: (sessionId: number | string) => void;
  onExportPdf?: (sessionId: number | string) => void;
  onDeleteSession: (sessionId: number | string) => void;
  t: any;
}) => {
  const chatMenu = useDropdownMenu();

  return (
    <div className={`group-preview-chat ${isActive ? 'active' : ''}`}>
      <div className="group-preview-chat-main" onClick={() => onSelectSession(session.id)}>
        <ChatIcon width={12} height={12} />
        <span>{session.title}</span>
      </div>
      <div className="chat-item-menu" ref={chatMenu.menuRef}>
        <button
          className="chat-menu-btn"
          onClick={(e) => {
            e.stopPropagation();
            chatMenu.toggle();
          }}
          title={t.header.moreOptions}
        >
          <DotsVerticalIcon width={14} height={14} />
        </button>
        {chatMenu.isOpen && (
          <div className="chat-dropdown">
            {onRenameSession && (
              <button
                className="chat-dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  onRenameSession(session.id, session.title);
                  chatMenu.close();
                }}
              >
                <EditIcon />
                {t.sidebar.rename}
              </button>
            )}
            {onMoveToGroup && (
              <button
                className="chat-dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveToGroup(session.id);
                  chatMenu.close();
                }}
              >
                <FolderIcon />
                {t.sidebar.moveToGroup}
              </button>
            )}

            {onExportPdf && (
              <button
                className="chat-dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  onExportPdf(session.id);
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
                onDeleteSession(session.id);
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

const GroupItem = ({
  group,
  currentGroupId,
  currentSessionId,
  groupSessions,
  isExpanded,
  onToggleExpand,
  onSelectGroup,
  onSelectSession,
  onRenameSession,
  onMoveToGroup,
  onExportPdf,
  onDeleteSession,
  t,
}: {
  group: Group;
  currentGroupId: string | null;
  currentSessionId: number | string | null;
  groupSessions: Record<number, ChatSession[]>;
  isExpanded: boolean;
  onToggleExpand: (groupId: number) => void;
  onSelectGroup?: (groupId: number) => void;
  onSelectSession: (sessionId: number | string) => void;
  onRenameSession?: (sessionId: number | string, currentTitle: string) => void;
  onMoveToGroup?: (sessionId: number | string) => void;
  onExportPdf?: (sessionId: number | string) => void;
  onDeleteSession: (sessionId: number | string) => void;
  onLoadGroupSessions?: (groupId: number) => Promise<ChatSession[]>;
  t: any;
}) => {
  const getGroupChatPreview = () => {
    if (groupSessions[group.id]) {
      return groupSessions[group.id];
    }
    return [];
  };

  return (
    <div key={group.id}>
      <div className={`group-item ${currentGroupId === String(group.id) ? 'active' : ''}`}>
        <div className="group-item-left" onClick={() => onSelectGroup?.(group.id)}>
          <FolderIcon width={16} height={16} />
          <span>{group.name}</span>
        </div>
        <button
          className="group-expand-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(group.id);
          }}
          aria-label="Expand group"
        >
          <ChevronDownIcon
            className={`group-expand-icon ${isExpanded ? 'rotated' : ''}`}
            width={16}
            height={16}
          />
        </button>
      </div>
      {isExpanded && (
        <div className="group-chat-preview">
          {getGroupChatPreview().map((session) => (
            <GroupPreviewChatItem
              key={session.id}
              session={session}
              isActive={session.id === currentSessionId}
              onSelectSession={onSelectSession}
              onRenameSession={onRenameSession}
              onMoveToGroup={onMoveToGroup}
              onExportPdf={onExportPdf}
              onDeleteSession={onDeleteSession}
              t={t}
            />
          ))}
          {getGroupChatPreview().length === 0 && (
            <div className="group-preview-empty">
              Brak rozmów
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const Sidebar = ({
  sidebarOpen,
  user,
  onLogin,
  onLogout,
  onOpenSettings,
  onOpenSearch,
  onOpenGroups,
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  onExportPdf,
  onMoveToGroup,
  onUngroupSession,
  groups,
  currentGroupId,
  onSelectGroup,
  groupSessions = {},
  onLoadGroupSessions,
  onToggleSidebar
}: SidebarProps & { onOpenHelp?: () => void, onToggleSidebar?: () => void }) => {
  const userMenu = useDropdownMenu();
  const { t } = useTranslations();
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  const isLoggedIn = !!user;
  const displayName = user ? `${user.first_name} ${user.last_name}` : t.sidebar.guest;

  const toggleGroupExpansion = async (groupId: number) => {
    const isExpanding = !expandedGroups.has(groupId);

    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });

    if (isExpanding && onLoadGroupSessions && !groupSessions[groupId]) {
      await onLoadGroupSessions(groupId);
    }
  };

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

        {isLoggedIn && (
          sidebarOpen ? (
            <button
              className="groups-btn"
              onClick={onOpenGroups}
            >
              <FolderIcon />
              <span>{t.sidebar.groups}</span>
            </button>
          ) : (
            <Tooltip text={t.sidebar.groups} shortcut="Ctrl+I">
              <button
                className="groups-btn"
                onClick={onOpenGroups}
              >
                <FolderIcon width={18} height={18} />
              </button>
            </Tooltip>
          )
        )}
      </div>

      {isLoggedIn && sidebarOpen && groups.length > 0 && (
        <div className="groups-section">
          <h3>{t.groups.title}</h3>
          {groups.slice(0, 5).map((group) => (
            <GroupItem
              key={group.id}
              group={group}
              currentGroupId={currentGroupId}
              currentSessionId={currentSessionId}
              groupSessions={groupSessions}
              isExpanded={expandedGroups.has(group.id)}
              onToggleExpand={toggleGroupExpansion}
              onSelectGroup={onSelectGroup}
              onSelectSession={onSelectSession}
              onRenameSession={onRenameSession}
              onMoveToGroup={onMoveToGroup}
              onExportPdf={onExportPdf}
              onDeleteSession={onDeleteSession}
              onLoadGroupSessions={onLoadGroupSessions}
              t={t}
            />
          ))}
          {groups.length > 5 && (
            <div
              className="groups-more-indicator"
              onClick={onOpenGroups}
            >
              <FolderIcon width={14} height={14} />
              <span>{'+' + (groups.length - 5) + ' więcej'}</span>
            </div>
          )}
        </div>
      )}

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
                  onMoveToGroup={() => onMoveToGroup?.(session.id)}
                  onUngroup={() => onUngroupSession?.(session.id)}
                  t={t}
                  isLoggedIn={isLoggedIn}
                  isInGroup={(session as any).is_in_group || false}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    userMenu.close();
                    onOpenSettings();
                  }}
                >
                  <SettingsIcon />
                  {t.sidebar.settings}
                </button>
                <div className="user-dropdown-divider"></div>
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
