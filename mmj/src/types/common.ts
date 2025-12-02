export type SessionId = number | string;

export type Language = "en" | "pl";

export type ThemeMode = "light" | "dark";

export interface BaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ConfirmDialogProps extends BaseDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  cancelText: string;
  confirmText: string;
}

