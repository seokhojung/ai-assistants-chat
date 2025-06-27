import axios from 'axios';
import { LoginRequest, LoginResponse, ChatRequest, ChatResponse } from '../types';

// 동적으로 API URL 설정 (모바일/외부 접근 지원)
const getApiBaseUrl = () => {
  // 개발 환경에서는 현재 호스트를 사용
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000/api/v1';
  }
  // 외부 접근 시에는 현재 호스트의 8000 포트 사용
  return `http://${window.location.hostname}:8000/api/v1`;
};

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 인증 토큰 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 오류 시 로그인 페이지로 리다이렉트
      localStorage.removeItem('access_token');
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 인증 API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// 채팅 API
export const chatApi = {
  sendMessage: async (agentType: string, request: ChatRequest): Promise<ChatResponse> => {
    // 에이전트 타입을 복수형으로 변환
    const agentTypeMap: { [key: string]: string } = {
      'member': 'members',
      'staff': 'staff', 
      'hr': 'hr',
      'inventory': 'inventory'
    };
    
    const endpoint = agentTypeMap[agentType] || agentType;
    const response = await api.post(`/${endpoint}/chat`, request);
    return response.data;
  },
};

// 회원 관리 API
export const memberApi = {
  getMembers: async () => {
    const response = await api.get('/members/');
    return response.data;
  },

  getMember: async (memberId: string) => {
    const response = await api.get(`/members/${memberId}`);
    return response.data;
  },
};

// 직원 관리 API
export const staffApi = {
  getStaff: async () => {
    const response = await api.get('/staff/');
    return response.data;
  },

  getStaffMember: async (staffId: string) => {
    const response = await api.get(`/staff/${staffId}`);
    return response.data;
  },
};

// 인사 관리 API
export const hrApi = {
  getPayroll: async () => {
    const response = await api.get('/hr/payroll');
    return response.data;
  },

  getLeaves: async () => {
    const response = await api.get('/hr/leaves');
    return response.data;
  },
};

// 재고 관리 API
export const inventoryApi = {
  getInventory: async () => {
    const response = await api.get('/inventory/');
    return response.data;
  },

  getItem: async (itemId: string) => {
    const response = await api.get(`/inventory/${itemId}`);
    return response.data;
  },

  getLowStock: async () => {
    const response = await api.get('/inventory/low-stock');
    return response.data;
  },
};

export default api; 