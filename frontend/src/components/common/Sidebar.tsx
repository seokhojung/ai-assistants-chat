import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { messages } = useChatStore();
  
  const agents = [
    {
      id: 'member',
      name: '회원관리 AI',
      icon: '👥',
      description: '회원 등록, 출석, 결제 관리'
    },
    {
      id: 'staff',
      name: '직원관리 AI',
      icon: '👷',
      description: '스케줄, 근태, 업무 배치'
    },
    {
      id: 'hr',
      name: '인사관리 AI',
      icon: '💼',
      description: '급여, 휴가, 교육 관리'
    },
    {
      id: 'inventory',
      name: '재고관리 AI',
      icon: '📦',
      description: '재고 조회, 발주, 입출고'
    }
  ];

  // 각 에이전트별 메시지 개수 계산 (초기 메시지 제외)
  const getMessageCount = (agentId: string) => {
    const agentMessages = messages[agentId as keyof typeof messages] || [];
    return Math.max(0, agentMessages.length - 1); // 초기 메시지 제외
  };

  return (
    <div className="h-full flex flex-col">
      {/* 로고 영역 */}
      <div className="p-6 border-b">
        <Link to="/" className="text-xl font-bold text-blue-600">
          🏋️ Gym AI
        </Link>
        <p className="text-sm text-gray-500 mt-1">
          AI 관리 시스템
        </p>
      </div>

      {/* 메인 메뉴 */}
      <div className="p-4 border-b">
        <div className="space-y-2">
          <Link
            to="/"
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              location.pathname === '/' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">📊</span>
            <span className="font-medium">대시보드</span>
          </Link>
          
          <Link
            to="/files"
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              location.pathname === '/files' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">📁</span>
            <span className="font-medium">파일 관리</span>
          </Link>
        </div>
      </div>

      {/* AI 에이전트 목록 */}
      <div className="flex-1 p-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          AI 에이전트
        </h3>
        
        <div className="space-y-2">
          {agents.map((agent) => {
            const messageCount = getMessageCount(agent.id);
            const isActive = location.pathname === `/chat/${agent.id}`;
            
            return (
              <Link
                key={agent.id}
                to={`/chat/${agent.id}`}
                className={`block p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{agent.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{agent.name}</div>
                      {messageCount > 0 && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          isActive 
                            ? 'bg-blue-200 text-blue-800' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {messageCount}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {agent.description}
                    </div>
                    {messageCount > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        💬 {messageCount}개 대화
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="p-4 border-t">
        <div className="text-xs text-gray-500 text-center">
          <div>v1.0.0 MVP</div>
          <div>🚀 30분 실행 가능</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 