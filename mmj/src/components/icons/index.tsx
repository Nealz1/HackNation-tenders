interface IconProps {
  width?: number;
  height?: number;
  className?: string;
}

export const MenuIcon = ({ width = 24, height = 24, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12h18M3 6h18M3 18h18"/>
  </svg>
);

export const SunIcon = ({ width = 16, height = 16, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);

export const MoonIcon = ({ width = 16, height = 16, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export const DotsVerticalIcon = ({ width = 16, height = 16, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1"/>
    <circle cx="12" cy="5" r="1"/>
    <circle cx="12" cy="19" r="1"/>
  </svg>
);

export const ArchiveIcon = ({ width = 16, height = 16, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/>
  </svg>
);

export const TrashIcon = ({ width = 16, height = 16, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

export const UserIcon = ({ width = 20, height = 20, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export const PlusIcon = ({ width = 18, height = 18, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

export const SearchIcon = ({ width = 16, height = 16, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

export const ChatIcon = ({ width = 16, height = 16, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

export const SettingsIcon = ({ width = 16, height = 16, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6m0 6v6M1 12h6m6 0h6"/>
  </svg>
);

export const HelpIcon = ({ width = 16, height = 16, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m.08 4h.01"/>
  </svg>
);

export const LogoutIcon = ({ width = 16, height = 16, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14l5-5-5-5m5 5H9"/>
  </svg>
);

export const LoginIcon = ({ width = 16, height = 16, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4m-5-4l-5-5 5-5m-5 5h14"/>
  </svg>
);

export const CloseIcon = ({ width = 20, height = 20, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

export const ChevronDownIcon = ({ width = 16, height = 16, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

export const CheckIcon = ({ width = 16, height = 16, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

export const EditIcon = ({ width = 16, height = 16, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

export const PinIcon = ({ width = 16, height = 16, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 17v5m-7-5h14V7.764a2 2 0 0 0-.586-1.414l-1.764-1.764A2 2 0 0 0 15.236 4H8.764a2 2 0 0 0-1.414.586L5.586 6.35A2 2 0 0 0 5 7.764V17z"/>
  </svg>
);

export const DownloadIcon = ({ width = 16, height = 16, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

export const ThumbsUpIcon = ({ width = 16, height = 16, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
  </svg>
);

export const ThumbsDownIcon = ({ width = 16, height = 16, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
  </svg>
);

export const CopyIcon = ({ width = 16, height = 16, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

export const RegenerateIcon = ({ width = 16, height = 16, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
  </svg>
);

export const MicrophoneIcon = ({ width = 20, height = 20, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

export const FolderIcon = ({ width = 20, height = 20, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);

export const ArrowLeftIcon = ({ width = 20, height = 20, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5"/>
    <path d="M12 19l-7-7 7-7"/>
  </svg>
);

export const SpeakerIcon = ({ width = 20, height = 20, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="m19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);

export const ExplainIcon = ({ width = 16, height = 16, className }: IconProps) => (
  <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
