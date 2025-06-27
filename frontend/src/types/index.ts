// API 응답 타입
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  success?: boolean;
}

// 사용자 관련 타입
export interface User {
  id: string;
  username: string;
  email?: string;
  is_active: boolean;
  created_at: string;
}

// 로그인 관련 타입
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// 채팅 관련 타입
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  agent_type: string;
}

export interface TableData {
  type: string;
  title: string;
  headers: string[];
  rows: string[][];
  summary?: string;
}

export interface ChatResponse {
  message: string;
  agent_type: string;
  timestamp: string;
  agent_info: {
    name: string;
    role: string;
    status: string;
  };
  table_data?: TableData;
}

// 에이전트 타입
export type AgentType = 'member' | 'staff' | 'hr' | 'inventory';

export interface Agent {
  id: AgentType;
  name: string;
  icon: string;
  description: string;
}

// 회원 관련 타입
export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  membership_type: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

// 직원 관련 타입
export interface Staff {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  hire_date: string;
  is_active: boolean;
}

// 재고 관련 타입
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit_price: number;
} 