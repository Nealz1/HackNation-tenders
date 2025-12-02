export const isMacPlatform = (): boolean => {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
};

export const getModifierKey = (): string => {
  return isMacPlatform() ? '⌘' : 'Ctrl';
};

export const getEscapeKey = (): string => {
  return isMacPlatform() ? '⎋' : 'Esc';
};