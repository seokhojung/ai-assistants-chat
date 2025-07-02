import React, { useState, useEffect, useRef } from 'react';
import { chatApi } from '../../services/api';
import { useChatStore, Message, AgentType } from '../../store/chatStore';
import { TableData } from '../../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatWindowProps {
  agentType: string;
  agentName: string;
}

// 표 렌더링 컴포넌트 - 가로 표시 최적화
const TableComponent: React.FC<{ tableData: TableData }> = ({ tableData }) => {
  return (
    <div className="mt-4 w-full">
      <h4 className="text-title-sm font-semibold text-gray-800 mb-3 flex items-center">
        📊 {tableData.title}
      </h4>
      
      {/* 가로 스크롤 가능한 표 */}
      <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-soft">
        <table className="w-full min-w-full text-body-sm">
          <thead className="bg-primary-50">
            <tr>
              {tableData.headers.map((header, index) => (
                <th 
                  key={index}
                  className="px-4 py-3 text-left text-caption font-semibold text-primary-800 uppercase tracking-wider border-b border-gray-200 whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tableData.rows.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                className={`hover:bg-neutral-50 transition-colors ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-neutral-25'}`}
              >
                {row.map((cell, cellIndex) => (
                  <td 
                    key={cellIndex}
                    className="px-4 py-3 text-body-sm text-gray-900 whitespace-nowrap"
                    title={cell} // 툴팁으로 전체 내용 표시
                  >
                    <div className="max-w-[200px] truncate">
                      {cell}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {tableData.summary && (
        <div className="mt-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
          <p className="text-body-sm text-primary-800 font-medium">
            📈 {tableData.summary}
          </p>
        </div>
      )}
    </div>
  );
};

const ChatWindow: React.FC<ChatWindowProps> = ({ agentType, agentName }) => {
  const { messages, addMessage, initializeAgent, clearMessages } = useChatStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const currentAgentType = agentType as AgentType;
  const currentMessages = messages[currentAgentType] || [];

  // 스크롤을 맨 아래로 이동하는 함수
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 컴포넌트 마운트 시 해당 에이전트 초기화
  useEffect(() => {
    initializeAgent(currentAgentType, agentName);
  }, [currentAgentType, agentName, initializeAgent]);

  // 메시지가 변경될 때마다 스크롤을 아래로 이동
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    // 사용자 메시지 추가
    addMessage(currentAgentType, userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(agentType, {
        message: input,
        agent_type: agentType
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        sender: 'ai',
        timestamp: new Date(),
        tableData: response.table_data
      };

      // AI 응답 메시지 추가
      addMessage(currentAgentType, aiMessage);
    } catch (error: unknown) {
      
      const errorText = error instanceof Error && 'response' in error
        ? (error as any).response?.data?.detail || error.message
        : error instanceof Error
        ? error.message
        : '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해 주세요.';
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        sender: 'ai',
        timestamp: new Date()
      };

      // 오류 메시지 추가
      addMessage(currentAgentType, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('이 에이전트의 모든 대화 기록을 삭제하시겠습니까?')) {
      clearMessages(currentAgentType);
      // 초기 메시지 다시 추가
      initializeAgent(currentAgentType, agentName);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // 빠른 질문 버튼 클릭 핸들러
  const handleQuickQuestion = (question: string) => {
    setInput(question);
    // 자동으로 전송
    setTimeout(() => {
      const event = new KeyboardEvent('keypress', { key: 'Enter' });
      document.dispatchEvent(event);
    }, 100);
  };

  // 에이전트별 헤더 색상 가져오기
  const getAgentHeaderColor = () => {
    const colorMap: { [key: string]: string } = {
      member: 'from-primary-50 to-primary-100',
      staff: 'from-success-light/50 to-success-light',
      hr: 'from-gym-orange/10 to-gym-orange/20',
      inventory: 'from-warning-light/50 to-warning-light'
    };
    return colorMap[agentType] || 'from-primary-50 to-primary-100';
  };

  const quickQuestions = [
    { text: '💡 도움말', query: '도움말', color: 'btn-secondary' },
    { text: '📋 전체 목록', query: '전체 목록 보여줘', color: 'btn-primary' },
    { text: '📊 통계 정보', query: '최근 통계를 알려줘', color: 'btn-gym' },
    { text: '❓ 자주 묻는 질문', query: '자주 묻는 질문은?', color: 'btn-ghost' }
  ];

  return (
    <div className="chat-container animate-fade-in">
      {/* 채팅 헤더 */}
      <div className={`chat-header bg-gradient-to-r ${getAgentHeaderColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-title-xl font-bold text-gray-800 mb-1">
              {agentName}
            </h2>
            <p className="text-body-md text-gray-600 mb-2">
              궁금한 것을 자유롭게 물어보세요! 💬
            </p>
            <div className="flex items-center gap-4 text-body-sm text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span>온라인</span>
              </div>
              <div className="flex items-center gap-1">
                <span>💬</span>
                <span>대화 기록: {currentMessages.length - 1}개</span>
              </div>
            </div>
          </div>
          {currentMessages.length > 1 && (
            <button
              onClick={handleClearChat}
              className="btn-danger btn-sm hover-scale"
              title="대화 기록 삭제"
            >
              🗑️ 기록 삭제
            </button>
          )}
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="chat-messages">
        {currentMessages.map(message => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            <div className={`${
              message.sender === 'user' 
                ? 'message-user max-w-[80%]' 
                : message.tableData 
                  ? 'w-full max-w-4xl message-ai' 
                  : 'message-ai max-w-[85%]'
            }`}>
              {message.sender === 'ai' ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({node, ...props}) => (
                        <div className="overflow-x-auto my-3 bg-white rounded-lg border border-gray-200 shadow-soft">
                          <table className="w-full min-w-full text-body-sm" {...props} />
                        </div>
                      ),
                      thead: ({node, ...props}) => (
                        <thead className="bg-primary-50" {...props} />
                      ),
                      th: ({node, ...props}) => (
                        <th className="px-4 py-3 text-left text-caption font-semibold text-primary-800 uppercase tracking-wider border-b border-gray-200 whitespace-nowrap" {...props} />
                      ),
                      td: ({node, ...props}) => (
                        <td className="px-4 py-3 text-body-sm text-gray-900 border-b border-gray-200 whitespace-nowrap" {...props} />
                      ),
                      tr: ({node, ...props}) => (
                        <tr className="hover:bg-neutral-50 transition-colors" {...props} />
                      ),
                      p: ({node, ...props}) => (
                        <p className="mb-2 text-gray-800 leading-relaxed text-body-md" {...props} />
                      ),
                      strong: ({node, ...props}) => (
                        <strong className="font-semibold text-primary-600" {...props} />
                      ),
                      em: ({node, ...props}) => (
                        <em className="text-success" {...props} />
                      ),
                      h1: ({node, ...props}) => (
                        <h1 className="text-title-lg font-bold text-gray-800 mb-2" {...props} />
                      ),
                      h2: ({node, ...props}) => (
                        <h2 className="text-title-md font-bold text-gray-800 mb-2" {...props} />
                      ),
                      h3: ({node, ...props}) => (
                        <h3 className="text-title-sm font-semibold text-gray-800 mb-1" {...props} />
                      ),
                      ul: ({node, ...props}) => (
                        <ul className="list-disc list-inside mb-2 text-gray-800 space-y-1" {...props} />
                      ),
                      ol: ({node, ...props}) => (
                        <ol className="list-decimal list-inside mb-2 text-gray-800 space-y-1" {...props} />
                      ),
                      li: ({node, ...props}) => (
                        <li className="text-gray-800" {...props} />
                      ),
                      code: ({node, ...props}) => (
                        <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-body-sm text-gray-800 font-mono" {...props} />
                      ),
                      blockquote: ({node, ...props}) => (
                        <blockquote className="border-l-4 border-primary-300 pl-4 italic text-gray-700 bg-primary-50 py-2 rounded-r" {...props} />
                      )
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-body-md break-words">{message.text}</div>
              )}
              
              {/* 표 데이터가 있으면 렌더링 */}
              {message.tableData && message.sender === 'ai' && (
                <TableComponent tableData={message.tableData} />
              )}
              
              <div className="message-time">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {/* 로딩 표시 */}
        {isLoading && (
          <div className="flex justify-start animate-slide-up">
            <div className="message-ai max-w-[70%]">
              <div className="chat-typing-indicator">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="ml-2">AI가 응답을 준비하고 있습니다...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* 스크롤 타겟 요소 */}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="chat-input-area">
        {/* 빠른 질문 버튼들 */}
        <div className="mb-3 flex flex-wrap gap-2">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question.query)}
              className={`${question.color} btn-sm transition-all duration-200 hover-scale`}
              disabled={isLoading}
            >
              {question.text}
            </button>
          ))}
        </div>
        
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="메시지를 입력하세요..."
            className="input flex-1 focus-gym-ring"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="btn-gym hover-scale flex-shrink-0"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="spinner-sm spinner-gym"></div>
                전송중
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>전송</span>
                <span>🚀</span>
              </div>
            )}
          </button>
        </div>
        
        <div className="mt-2 text-caption text-neutral-500 text-center">
          Enter를 눌러 메시지를 전송하거나 위의 빠른 질문 버튼을 클릭하세요
        </div>
      </div>
    </div>
  );
};

export default ChatWindow; 