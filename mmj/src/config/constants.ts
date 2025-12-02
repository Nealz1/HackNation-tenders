export const API_BASE_URL = 'http://localhost:8000';

export const STORAGE_KEYS = {
  SIDEBAR_OPEN: 'sidebarOpen',
  AUTH_TOKEN: 'auth_token',
  CURRENT_SESSION: 'currentSessionId',
  DRAFT_MESSAGE: 'draft_message',
  LAST_VALIDATION: 'last_validation',
  GUEST_MESSAGES: 'guest_messages',
} as const;

export const VALIDATION_INTERVALS = {
  SESSION_CHECK: 2 * 60 * 1000,
  ACTIVITY_DEBOUNCE: 1000,
  VALIDATION_CACHE: 30 * 1000,
} as const;

export const UI_FEEDBACK_DURATIONS = {
  COPY_SUCCESS: 800,
  TOAST_MESSAGE: 3000,
} as const;

export const EMAIL_DOMAINS = {
  STUDENT_ACTIVE: '@student.wat.edu.pl',
  STAFF: '@wat.edu.pl',
} as const;

export const POLISH_CHAR_MAPPINGS = {
  'ą': 'a',
  'ć': 'c',
  'ę': 'e',
  'ł': 'l',
  'ń': 'n',
  'ó': 'o',
  'ś': 's',
  'ż': 'z',
  'ź': 'z',
} as const;

export const CONTENT_TYPES = {
  WORD_DOCUMENT: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  HTML: "text/html",
  JSON: "application/json",
} as const;
