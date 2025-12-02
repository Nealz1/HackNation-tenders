import { useState, useEffect } from 'react';
import { authService, User } from '../services/authService';
import { guestChatService } from '../services/guestChatService';

const AUTH_ERROR_MESSAGES = {
  usos_logout: 'Zostałeś wylogowany z systemu USOS. Musisz wylogować się również z chatbota.',
  user_info_failed: 'Nie udało się pobrać informacji o użytkowniku z USOS.',
  default: 'Wystąpił nieznany błąd podczas logowania.',
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthErrorDialog, setShowAuthErrorDialog] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState('');
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authError = urlParams.get('auth_error');

      if (authError) {
        const message = AUTH_ERROR_MESSAGES[authError as keyof typeof AUTH_ERROR_MESSAGES]
          || AUTH_ERROR_MESSAGES.default;
        setAuthErrorMessage(message);
        setShowAuthErrorDialog(true);
        window.history.replaceState({}, document.title, window.location.pathname);
        await authService.logout();
        setUser(null);
        setAuthInitialized(true);
      } else {
        authService.handleCallback();
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          guestChatService.clearAllSessions();
        }
        setUser(currentUser);
        setAuthInitialized(true);
      }
    };
    initAuth();
  }, []);

  const handleLogin = async () => {
    await authService.login();
  };

  const handleLogout = async () => {
    const { usosLogoutUrl } = await authService.logout();
    setUser(null);

    if (usosLogoutUrl) {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = usosLogoutUrl;
      document.body.appendChild(iframe);

      setTimeout(() => {
        document.body.removeChild(iframe);
        window.location.href = '/';
      }, 1000);
    } else {
      window.location.href = '/';
    }
  };

  const handleSessionExpired = (message: string) => {
    setAuthErrorMessage(message);
    setShowAuthErrorDialog(true);
    setUser(null);
  };

  const closeAuthErrorDialog = () => {
    setShowAuthErrorDialog(false);
    window.location.reload();
  };

  return {
    user,
    showAuthErrorDialog,
    authErrorMessage,
    handleLogin,
    handleLogout,
    handleSessionExpired,
    closeAuthErrorDialog,
    authInitialized,
  };
};
