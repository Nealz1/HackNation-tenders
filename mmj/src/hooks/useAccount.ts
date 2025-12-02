import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';

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

const getDefaultAccountInfo = (user: User | null): AccountInfo => ({
  firstName: user?.first_name || '',
  lastName: user?.last_name || '',
  groupName: '',
  studentIndex: '',
  phoneNumber: '',
  email: '',
  emailDomain: '@example.com',
  faculty: '',
  studyLevel: '',
  street: '',
  buildingNumber: '',
  apartmentNumber: '',
  postalCode: '',
  city: '',
});

export const useAccount = (user: User | null) => {
  const [accountInfo, setAccountInfo] = useState<AccountInfo>(() => getDefaultAccountInfo(user));

  useEffect(() => {
    setAccountInfo(prev => ({ ...getDefaultAccountInfo(user), emailDomain: prev.emailDomain, email: prev.email || '' }));
  }, [user]);

  const updateAccountInfo = useCallback((updates: Partial<AccountInfo>) => {
    setAccountInfo(prev => ({ ...prev, ...updates }));
  }, []);

  const resetAccountInfo = useCallback(() => {
    setAccountInfo(getDefaultAccountInfo(user));
  }, [user]);

  const getFullEmail = useCallback(() => {
    if (accountInfo.email && accountInfo.emailDomain) return accountInfo.email + accountInfo.emailDomain;
    return '';
  }, [accountInfo.email, accountInfo.emailDomain]);

  const isComplete = useCallback(() => {
    return !!(accountInfo.firstName && accountInfo.lastName && accountInfo.groupName && accountInfo.studentIndex && accountInfo.email);
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
