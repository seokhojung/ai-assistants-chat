import React from 'react';
import { useParams } from 'react-router-dom';
import ChatWindow from '../components/agents/ChatWindow';

const AgentChat: React.FC = () => {
  const { agentType } = useParams<{ agentType: string }>();

  const agentInfo = {
    member: { name: '회원관리 AI', icon: '👥' },
    staff: { name: '직원관리 AI', icon: '👷' },
    hr: { name: '인사관리 AI', icon: '💼' },
    inventory: { name: '재고관리 AI', icon: '📦' }
  };

  const currentAgent = agentInfo[agentType as keyof typeof agentInfo];

  if (!currentAgent) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            에이전트를 찾을 수 없습니다
          </h2>
          <p className="text-gray-600">
            올바른 에이전트 타입을 선택해 주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full max-w-full overflow-hidden">
      <ChatWindow 
        agentType={agentType!} 
        agentName={currentAgent.name}
      />
    </div>
  );
};

export default AgentChat; 