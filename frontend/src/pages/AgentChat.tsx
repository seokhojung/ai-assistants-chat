import React from 'react';
import { useParams } from 'react-router-dom';
import ChatWindow from '../components/agents/ChatWindow';

const AgentChat: React.FC = () => {
  const { agentType } = useParams<{ agentType: string }>();

  const agentInfo = {
    member: { name: '회원관리 AI', icon: '👥', color: 'primary' },
    staff: { name: '직원관리 AI', icon: '👷', color: 'success' },
    hr: { name: '인사관리 AI', icon: '💼', color: 'gym' },
    inventory: { name: '재고관리 AI', icon: '📦', color: 'warning' }
  };

  const currentAgent = agentInfo[agentType as keyof typeof agentInfo];

  if (!currentAgent) {
    return (
      <div className="flex items-center justify-center h-full animate-fade-in">
        <div className="card max-w-md text-center">
          <div className="card-body">
            <div className="text-6xl mb-4 animate-bounce-gentle">❌</div>
            <h2 className="text-title-xl font-bold text-gray-800 mb-3">
              에이전트를 찾을 수 없습니다
            </h2>
            <p className="text-body-lg text-gray-600 mb-6">
              올바른 에이전트 타입을 선택해 주세요.
            </p>
            <div className="flex flex-col gap-3">
              <div className="text-body-sm text-neutral-500 mb-2">사용 가능한 에이전트:</div>
              {Object.entries(agentInfo).map(([key, agent]) => (
                <a
                  key={key}
                  href={`/chat/${key}`}
                  className="nav-item-inactive text-left"
                >
                  <span className="text-lg">{agent.icon}</span>
                  <span>{agent.name}</span>
                </a>
              ))}
            </div>
          </div>
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