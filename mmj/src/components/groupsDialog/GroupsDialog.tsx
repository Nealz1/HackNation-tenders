import { useState, useEffect } from "react";
import "./GroupsDialog.css";
import { CloseIcon, TrashIcon } from "../icons";
import { useTranslations } from "../../hooks/useTranslations";
import { Group } from "../../types";

interface GroupsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  language: "en" | "pl";
  groups: Group[];
  onCreateGroup: (name: string) => void;
  onSelectGroup?: (groupId: number) => void;
  selectMode?: boolean;
  onMoveToGroup?: (groupId: number) => void;
  onDeleteGroup?: (groupId: number) => void;
  onUngroup?: () => void;
  isSessionInGroup?: boolean;
}

export const GroupsDialog = ({
  isOpen,
  onClose,
  language,
  groups,
  onCreateGroup,
  onSelectGroup,
  selectMode = false,
  onMoveToGroup,
  onDeleteGroup,
  onUngroup,
  isSessionInGroup = false,
}: GroupsDialogProps) => {
  const [groupName, setGroupName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const t = useTranslations(language);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;

    setIsProcessing(true);
    try {
      await onCreateGroup(groupName.trim());
      setGroupName("");
    } catch (error) {
      console.error("Failed to create group:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && groupName.trim()) {
      handleCreateGroup();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="groups-overlay" onClick={onClose}>
      <div className="groups-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="groups-close" onClick={onClose} title={t.settings.close}>
          <CloseIcon />
        </button>

        <div className="groups-content">
          <h2 className="groups-title">
            {selectMode
              ? (language === 'pl' ? 'Wybierz grupę' : 'Select Group')
              : t.groups.title
            }
          </h2>

          {!selectMode && (
            <div className="groups-create-section">
              <div className="groups-input-wrapper">
                <input
                  type="text"
                  className="groups-input"
                  placeholder={t.groups.groupName}
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isProcessing}
                  autoFocus
                />
                <button
                  className="groups-confirm-btn"
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || isProcessing}
                >
                  {isProcessing ? "..." : t.groups.confirm}
                </button>
              </div>
            </div>
          )}

          <div className="groups-list">
            {selectMode && isSessionInGroup && onUngroup && (
              <div
                className="groups-list-item ungroup-item"
                onClick={() => {
                  onUngroup();
                  onClose();
                }}
              >
                <div className="groups-list-item-main">
                  <span>{t.sidebar.ungroup}</span>
                </div>
              </div>
            )}
            {groups.length === 0 ? (
              <p className="groups-empty">{t.groups.noGroups}</p>
            ) : (
              groups.map((group) => (
                <div
                  key={group.id}
                  className="groups-list-item"
                >
                  <div
                    className="groups-list-item-main"
                    onClick={() => {
                      if (selectMode && onMoveToGroup) {
                        onMoveToGroup(group.id);
                      } else {
                        onSelectGroup?.(group.id);
                      }
                    }}
                    title={group.description || group.name}
                  >
                    <span>{group.name}</span>
                  </div>
                  {!selectMode && (
                    <button
                      className="groups-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteGroup?.(group.id);
                      }}
                      title={t.groups.deleteGroup}
                    >
                      <TrashIcon width={16} height={16} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
