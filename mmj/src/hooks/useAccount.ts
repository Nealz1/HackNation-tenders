import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { EMAIL_DOMAINS, POLISH_CHAR_MAPPINGS } from '../config/constants';
import { authService } from '../services/authService';

export interface AccountInfo {
  firstName: string;
  lastName: string;
  groupName: string;
  studentIndex: string;
  phoneNumber: string;
  email: string;
  emailDomain: string;
  faculty: string;
  studyLevel: string;
  street: string;
  buildingNumber: string;
  apartmentNumber: string;
  postalCode: string;
  city: string;
}

const normalizePolishChars = (text: string): string => {
  let normalized = text.toLowerCase();

  Object.entries(POLISH_CHAR_MAPPINGS).forEach(([polishChar, asciiChar]) => {
    const regex = new RegExp(polishChar, 'g');
    normalized = normalized.replace(regex, asciiChar);
  });

  return normalized;
};

const generateDefaultEmail = (firstName: string, lastName: string): string => {
  const normalizedFirst = normalizePolishChars(firstName);
  const normalizedLast = normalizePolishChars(lastName);

  if (normalizedFirst && normalizedLast) {
    return `${normalizedFirst}.${normalizedLast}`;
  }

  return '';
};

const getDefaultAccountInfo = (user: User | null): AccountInfo => {
  const accountInfo: AccountInfo = {
    firstName: '',
    lastName: '',
    groupName: '',
    studentIndex: '',
    phoneNumber: '',
    email: '',
    emailDomain: EMAIL_DOMAINS.STAFF,
    faculty: '',
    studyLevel: '',
    street: '',
    buildingNumber: '',
    apartmentNumber: '',
    postalCode: '',
    city: '',
  };

  if (user) {
    accountInfo.firstName = user.first_name || '';
    accountInfo.lastName = user.last_name || '';

    if (user.student_status === 2) {
      accountInfo.emailDomain = EMAIL_DOMAINS.STUDENT_ACTIVE;
    } else {
      accountInfo.emailDomain = EMAIL_DOMAINS.STAFF;
    }
  }

  return accountInfo;
};

export const useAccount = (user: User | null) => {
  const [accountInfo, setAccountInfo] = useState<AccountInfo>(() => getDefaultAccountInfo(user));
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!user || isInitialized) return;

    authService.getAccountPreferences()
      .then(response => {
        const preferences = response.preferences || {};

        const defaultInfo = getDefaultAccountInfo(user);
        const loadedInfo: AccountInfo = {
          firstName: preferences.first_name || defaultInfo.firstName,
          lastName: preferences.last_name || defaultInfo.lastName,
          groupName: preferences.group_name || defaultInfo.groupName,
          studentIndex: preferences.student_index || defaultInfo.studentIndex,
          phoneNumber: preferences.phone_number || defaultInfo.phoneNumber,
          email: preferences.email_username || (defaultInfo.firstName && defaultInfo.lastName
            ? generateDefaultEmail(defaultInfo.firstName, defaultInfo.lastName)
            : ''),
          emailDomain: defaultInfo.emailDomain,
          faculty: preferences.faculty || '',
          studyLevel: preferences.study_level || '',
          street: preferences.street || '',
          buildingNumber: preferences.building_number || '',
          apartmentNumber: preferences.apartment_number || '',
          postalCode: preferences.postal_code || '',
          city: preferences.city || '',
        };

        setAccountInfo(loadedInfo);
      })
      .catch(error => {
        console.error('Failed to load account preferences:', error);
        setAccountInfo(getDefaultAccountInfo(user));
      })
      .finally(() => {
        setIsInitialized(true);
      });
  }, [user, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;

    const newInfo = getDefaultAccountInfo(user);
    setAccountInfo(prev => ({
      ...newInfo,
      groupName: prev.groupName,
      studentIndex: prev.studentIndex,
      phoneNumber: prev.phoneNumber,
      email: prev.email || newInfo.email,
      faculty: prev.faculty,
      studyLevel: prev.studyLevel,
      street: prev.street,
      buildingNumber: prev.buildingNumber,
      apartmentNumber: prev.apartmentNumber,
      postalCode: prev.postalCode,
      city: prev.city,
    }));
  }, [user, isInitialized]);

  const updateAccountInfo = useCallback((updates: Partial<AccountInfo>) => {
    setAccountInfo(prev => {
      const newInfo = { ...prev, ...updates };

      const dbUpdates = {
        first_name: newInfo.firstName,
        last_name: newInfo.lastName,
        group_name: newInfo.groupName,
        student_index: newInfo.studentIndex,
        phone_number: newInfo.phoneNumber,
        email_username: newInfo.email,
        faculty: newInfo.faculty,
        study_level: newInfo.studyLevel,
        street: newInfo.street,
        building_number: newInfo.buildingNumber,
        apartment_number: newInfo.apartmentNumber,
        postal_code: newInfo.postalCode,
        city: newInfo.city,
      };

      authService.updateAccountPreferences(dbUpdates).catch(error => {
        console.error('Failed to save account preferences:', error);
      });

      return newInfo;
    });
  }, []);

  const resetAccountInfo = useCallback(() => {
    authService.resetAccountPreferences()
      .then(() => {
        setAccountInfo(getDefaultAccountInfo(user));
      })
      .catch(error => {
        console.error('Failed to reset account preferences:', error);
      });
  }, [user]);

  const getFullEmail = useCallback(() => {
    if (accountInfo.email && accountInfo.emailDomain) {
      return accountInfo.email + accountInfo.emailDomain;
    }
    return '';
  }, [accountInfo.email, accountInfo.emailDomain]);

  const isComplete = useCallback(() => {
    return !!(accountInfo.firstName && accountInfo.lastName &&
              accountInfo.groupName && accountInfo.studentIndex &&
              accountInfo.email);
  }, [accountInfo]);

  return {
    accountInfo,
    updateAccountInfo,
    resetAccountInfo,
    getFullEmail,
    isComplete,
  };
};

export default useAccount;
