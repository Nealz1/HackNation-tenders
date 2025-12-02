import { useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/authService';
import { VALIDATION_INTERVALS, STORAGE_KEYS } from '../config/constants';
import { useLanguage } from './useLanguage';

export const useSessionValidation = (
  isAuthenticated: boolean,
  onSessionExpired: (message: string) => void
) => {
  const { t } = useLanguage();
  const activityTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const shouldValidate = useCallback(() => {
    const lastValidation = localStorage.getItem(STORAGE_KEYS.LAST_VALIDATION);
    if (!lastValidation) return true;

    const timeSinceLastValidation = Date.now() - parseInt(lastValidation, 10);
    return timeSinceLastValidation > VALIDATION_INTERVALS.VALIDATION_CACHE;
  }, []);

  const validateSession = useCallback(async () => {
    if (!isAuthenticated) return;
    if (!shouldValidate()) return;

    const isValid = await authService.validateUsosSession();
    if (!isValid) {
      onSessionExpired(t.auth.logoutDetected);
      localStorage.removeItem(STORAGE_KEYS.LAST_VALIDATION);
    } else {
      localStorage.setItem(STORAGE_KEYS.LAST_VALIDATION, Date.now().toString());
    }
  }, [isAuthenticated, onSessionExpired, t.auth.logoutDetected, shouldValidate]);

  const scheduleActivityCheck = useCallback(() => {
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }

    activityTimeoutRef.current = setTimeout(() => {
      validateSession();
    }, VALIDATION_INTERVALS.ACTIVITY_DEBOUNCE);
  }, [validateSession]);

  useEffect(() => {
    if (!isAuthenticated) return;

    validateSession();

    const interval = setInterval(validateSession, VALIDATION_INTERVALS.SESSION_CHECK);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        validateSession();
      }
    };

    const handleActivity = () => {
      scheduleActivityCheck();
    };

    window.addEventListener('focus', validateSession);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      clearInterval(interval);
      clearTimeout(activityTimeoutRef.current);
      window.removeEventListener('focus', validateSession);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [validateSession, scheduleActivityCheck, isAuthenticated]);
};
