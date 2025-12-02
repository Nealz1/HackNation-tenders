import { useState } from 'react';

export interface DialogState {
  settingsOpen: boolean;
  archivesOpen: boolean;
  helpOpen: boolean;
  searchDialogOpen: boolean;
  deleteDialogOpen: boolean;
  deleteDialogItem: number | string | null;
  chatNotFoundError: boolean;
  authError: string | null;

  openSettings: () => void;
  closeSettings: () => void;
  openArchives: () => void;
  closeArchives: () => void;
  openHelp: () => void;
  closeHelp: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openDeleteDialog: (itemId: number | string) => void;
  closeDeleteDialog: () => void;
  setChatNotFoundError: (show: boolean) => void;
  setAuthError: (error: string | null) => void;
}

export const useDialogState = (): DialogState => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [archivesOpen, setArchivesOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogItem, setDeleteDialogItem] = useState<number | string | null>(null);
  const [chatNotFoundError, setChatNotFoundError] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  return {
    settingsOpen,
    archivesOpen,
    helpOpen,
    searchDialogOpen,
    deleteDialogOpen,
    deleteDialogItem,
    chatNotFoundError,
    authError,

    openSettings: () => setSettingsOpen(true),
    closeSettings: () => setSettingsOpen(false),
    openArchives: () => setArchivesOpen(true),
    closeArchives: () => setArchivesOpen(false),
    openHelp: () => setHelpOpen(true),
    closeHelp: () => setHelpOpen(false),
    openSearch: () => setSearchDialogOpen(true),
    closeSearch: () => setSearchDialogOpen(false),
    openDeleteDialog: (itemId) => {
      setDeleteDialogItem(itemId);
      setDeleteDialogOpen(true);
    },
    closeDeleteDialog: () => {
      setDeleteDialogOpen(false);
      setDeleteDialogItem(null);
    },
    setChatNotFoundError,
    setAuthError,
  };
};

export default useDialogState;
