import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    isInitialized,
    login,
    logout,
    clearError,
    initializeAuth,
  } = useAuthStore();

  useEffect(() => {
    // 앱 초기화 시 인증 상태 확인
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isInitialized,
    login,
    logout,
    clearError,
  };
}; 