export const useAuth = () => ({
  user: null,
  showAuthErrorDialog: false,
  authErrorMessage: '',
  handleLogin: () => {},
  handleLogout: () => {},
  handleSessionExpired: () => {},
  closeAuthErrorDialog: () => {},
  authInitialized: true,
});
