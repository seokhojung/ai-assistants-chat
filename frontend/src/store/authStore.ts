import { create } from 'zustand';
import { User, LoginRequest } from '../types';
import { authApi } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => void;
}

// localStorage에서 초기 인증 상태 확인
const getInitialAuthState = (): boolean => {
  const token = localStorage.getItem('access_token');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return !!(token && isLoggedIn);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: getInitialAuthState(),
  isLoading: false,
  error: null,
  isInitialized: false,

  login: async (credentials: LoginRequest) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await authApi.login(credentials);
      
      // 토큰 저장
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('isLoggedIn', 'true');
      
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as any).response?.data?.detail || '로그인에 실패했습니다.'
        : '로그인에 실패했습니다.';
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('isLoggedIn');
    
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        set({ isAuthenticated: false, isInitialized: true });
        return;
      }

      set({ isLoading: true });
      
      const user = await authApi.getCurrentUser();
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      // 토큰이 유효하지 않으면 로그아웃
      get().logout();
      set({ isInitialized: true });
    }
  },

  initializeAuth: () => {
    const token = localStorage.getItem('access_token');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (token && isLoggedIn) {
      // 토큰이 있으면 사용자 정보를 가져옴
      get().getCurrentUser();
    } else {
      // 토큰이 없으면 초기화 완료
      set({ isInitialized: true });
    }
  },

  clearError: () => set({ error: null }),
})); 