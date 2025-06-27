import { create } from 'zustand';
import { TableData } from '../types';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  tableData?: TableData;
}

export type AgentType = 'member' | 'staff' | 'hr' | 'inventory';

interface ChatState {
  // 각 에이전트별 메시지 저장
  messages: Record<AgentType, Message[]>;
  
  // Actions
  addMessage: (agentType: AgentType, message: Message) => void;
  clearMessages: (agentType: AgentType) => void;
  initializeAgent: (agentType: AgentType, agentName: string) => void;
}

// 각 에이전트별 초기 메시지 생성
const createInitialMessage = (agentName: string): Message => ({
  id: '0',
  text: `안녕하세요! ${agentName}입니다. 무엇을 도와드릴까요?`,
  sender: 'ai',
  timestamp: new Date()
});

export const useChatStore = create<ChatState>((set, get) => ({
  messages: {
    member: [],
    staff: [],
    hr: [],
    inventory: []
  },

  addMessage: (agentType: AgentType, message: Message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [agentType]: [...state.messages[agentType], message]
      }
    }));
  },

  clearMessages: (agentType: AgentType) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [agentType]: []
      }
    }));
  },

  initializeAgent: (agentType: AgentType, agentName: string) => {
    const currentMessages = get().messages[agentType];
    
    // 해당 에이전트의 메시지가 비어있으면 초기 메시지 추가
    if (currentMessages.length === 0) {
      const initialMessage = createInitialMessage(agentName);
      set((state) => ({
        messages: {
          ...state.messages,
          [agentType]: [initialMessage]
        }
      }));
    }
  }
})); 