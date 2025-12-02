import { useDropdownMenu } from "../../hooks/useDropdownMenu";
import { useLanguage } from "../../hooks/useLanguage";
import { MenuIcon, DotsVerticalIcon, TrashIcon, DownloadIcon } from "../icons";
import type { SessionId } from "../../types";
import "./Header.css";

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  currentSessionId: SessionId | null;
  onDeleteSession: (sessionId: SessionId) => void;
  onExportPdf?: (sessionId: SessionId) => void;
}

export const Header = ({
  sidebarOpen,
  onToggleSidebar,
  currentSessionId,
  onDeleteSession,
  onExportPdf
}: HeaderProps) => {
  const { t } = useLanguage();
  const { isOpen, menuRef, toggle, close } = useDropdownMenu();

  const handleDelete = () => {
    close();
    if (currentSessionId) {
      onDeleteSession(currentSessionId);
    }
  };

  const handleExport = () => {
    close();
    if (currentSessionId && onExportPdf) {
      onExportPdf(currentSessionId);
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          title={sidebarOpen ? t.header.closeSidebar : t.header.openSidebar}
        >
          <MenuIcon />
        </button>
      </div>

      <h1 className="title">{t.header.title}</h1>

      <div className="header-menu" ref={menuRef}>
        <button
          className="header-menu-btn"
          onClick={toggle}
          title={t.header.moreOptions}
        >
          <DotsVerticalIcon />
        </button>
        {isOpen && (
          <div className="header-dropdown">
            <button
              className="header-dropdown-item"
              onClick={handleExport}
              disabled={!currentSessionId}
            >
              <DownloadIcon />
              {t.sidebar.exportPdf}
            </button>
            <button
              className="header-dropdown-item danger"
              onClick={handleDelete}
              disabled={!currentSessionId}
            >
              <TrashIcon />
              {t.sidebar.delete}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
