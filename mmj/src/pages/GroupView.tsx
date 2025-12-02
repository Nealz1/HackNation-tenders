import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./GroupView.css";
import { ChatIcon, ArrowLeftIcon } from "../components/icons";
import { MessageInput } from "../components/messageInput";
import { groupsService } from "../services/groupsService";
import { formatRelativeDate } from "../utils/dateUtils";
import type { Group, ChatSession } from "../types";

interface GroupViewProps {
  onSelectSession: (sessionId: number) => void;
  onSendMessageInGroup: (message: string, groupId: number) => Promise<void>;
  isLoading: boolean;
  onFocusChange: (focused: boolean) => void;
}

export const GroupView = ({ onSelectSession, onSendMessageInGroup, isLoading, onFocusChange }: GroupViewProps) => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGroupData = async () => {
      if (!groupId) return;

      try {
        setLoading(true);
        const groupSessions = await groupsService.getGroupSessions(parseInt(groupId));
        setSessions(groupSessions);

        const allGroups = await groupsService.getGroups();
        const currentGroup = allGroups.find(g => g.id === parseInt(groupId));
        setGroup(currentGroup || null);
      } catch (error) {
        console.error("Failed to load group data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGroupData();

    const handleGroupUpdate = (_event: CustomEvent) => {
      loadGroupData();
    };

    const handleGroupDeleted = (event: CustomEvent) => {
      if (event.detail.groupId === parseInt(groupId || '0')) {
        navigate('/');
      }
    };

    window.addEventListener('groupUpdated' as any, handleGroupUpdate as any);
    window.addEventListener('groupDeleted' as any, handleGroupDeleted as any);

    return () => {
      window.removeEventListener('groupUpdated' as any, handleGroupUpdate as any);
      window.removeEventListener('groupDeleted' as any, handleGroupDeleted as any);
    };
  }, [groupId, navigate]);

  const handleBack = () => {
    navigate("/");
  };

  const handleSendMessage = async (message: string) => {
    if (!groupId) return;
    await onSendMessageInGroup(message, parseInt(groupId));
  };

  if (loading) {
    return (
      <div className="group-view">
        <div className="group-view-loading">
          Ładowanie...
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="group-view">
        <div className="group-view-error">
          Grupa nie znaleziona
        </div>
      </div>
    );
  }

  return (
    <div className="group-view light">
      <div className="group-view-header">
        <button className="group-back-btn" onClick={handleBack}>
          <ArrowLeftIcon />
        </button>
        <div className="group-view-title">
          <h1>{group.name}</h1>
          <span className="group-chat-count">
            {sessions.length} rozmów
          </span>
        </div>
      </div>

      <div className="group-view-content">
        {sessions.length === 0 ? (
          <div className="group-empty-state">
            <ChatIcon width={48} height={48} />
            <h2>Brak rozmów w tej grupie</h2>
            <p>Rozpocznij nową rozmowę poniżej</p>
          </div>
        ) : (
          <div className="group-chats-list">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="group-chat-item"
                onClick={() => onSelectSession(session.id)}
              >
                <div className="group-chat-item-content">
                  <div className="group-chat-item-header">
                    <ChatIcon width={18} height={18} />
                    <h3>{session.title}</h3>
                    <span className="group-chat-date">{formatRelativeDate(session.updated_at, 'pl')}</span>
                  </div>
                  {session.lastMessage && (
                    <p className="group-chat-preview">{session.lastMessage}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <MessageInput
        onSendMessage={handleSendMessage}
        onFocusChange={onFocusChange}
        isLoading={isLoading}
        onCancel={() => {}}
      />
    </div>
  );
};
