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
      <h4 className="font-semibold text-gray-800 mb-3 flex items-center text-sm">
        📊 {tableData.title}
      </h4>
      
      {/* 가로 스크롤 가능한 표 */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full min-w-full text-sm">
          <thead className="bg-blue-50">
            <tr>
              {tableData.headers.map((header, index) => (
                <th 
                  key={index}
                  className="px-4 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider border-b border-gray-200 whitespace-nowrap"
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
                className={`hover:bg-gray-50 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
              >
                {row.map((cell, cellIndex) => (
                  <td 
                    key={cellIndex}
                    className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                    title={cell} // 툴크으로 전체 내용 표시
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
        <div className="mt-3 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800 font-medium">
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

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* 채팅 헤더 */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-blue-800">
          {agentName}
        </h2>
        <p className="text-sm text-blue-600">
              궁금한 것을 자유롭게 물어보세요! 💬
        </p>
            <div className="text-xs text-blue-500 mt-1">
              💬 대화 기록: {currentMessages.length - 1}개 메시지
            </div>
          </div>
          {currentMessages.length > 1 && (
            <button
              onClick={handleClearChat}
              className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
              title="대화 기록 삭제"
            >
              🗑️ 기록 삭제
            </button>
          )}
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {currentMessages.map(message => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`${
              message.sender === 'user' 
                ? 'max-w-[80%] min-w-[100px]' // 사용자 메시지: 최대 80%, 최소 100px
                : message.tableData 
                  ? 'w-full max-w-4xl' // AI 표 데이터: 전체 너비
                  : 'max-w-[85%] min-w-[120px]' // AI 일반 메시지: 최대 85%, 최소 120px
            } px-4 py-3 rounded-lg shadow-sm ${
              message.sender === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-800 border border-gray-200'
            }`}>
              {message.sender === 'ai' ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({node, ...props}) => (
                        <div className="overflow-x-auto my-3 bg-white rounded-lg border border-gray-200">
                          <table className="w-full min-w-full text-sm" {...props} />
                        </div>
                      ),
                      thead: ({node, ...props}) => (
                        <thead className="bg-blue-50" {...props} />
                      ),
                      th: ({node, ...props}) => (
                        <th className="px-4 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider border-b border-gray-200 whitespace-nowrap" {...props} />
                      ),
                      td: ({node, ...props}) => (
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200 whitespace-nowrap" {...props} />
                      ),
                      tr: ({node, ...props}) => (
                        <tr className="hover:bg-gray-50" {...props} />
                      ),
                      p: ({node, ...props}) => (
                        <p className="mb-2 text-gray-800 leading-relaxed" {...props} />
                      ),
                      strong: ({node, ...props}) => (
                        <strong className="font-bold text-blue-600" {...props} />
                      ),
                      em: ({node, ...props}) => (
                        <em className="text-green-600" {...props} />
                      ),
                      h1: ({node, ...props}) => (
                        <h1 className="text-lg font-bold text-gray-800 mb-2" {...props} />
                      ),
                      h2: ({node, ...props}) => (
                        <h2 className="text-md font-bold text-gray-800 mb-2" {...props} />
                      ),
                      h3: ({node, ...props}) => (
                        <h3 className="text-sm font-bold text-gray-800 mb-1" {...props} />
                      ),
                      ul: ({node, ...props}) => (
                        <ul className="list-disc list-inside mb-2 text-gray-800" {...props} />
                      ),
                      ol: ({node, ...props}) => (
                        <ol className="list-decimal list-inside mb-2 text-gray-800" {...props} />
                      ),
                      li: ({node, ...props}) => (
                        <li className="mb-1 text-gray-800" {...props} />
                      ),
                      code: ({node, ...props}) => (
                        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm text-gray-800" {...props} />
                      ),
                      blockquote: ({node, ...props}) => (
                        <blockquote className="border-l-4 border-blue-300 pl-4 italic text-gray-700" {...props} />
                      )
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="break-words">{message.text}</div>
              )}
              
              {/* 표 데이터가 있으면 렌더링 */}
              {message.tableData && message.sender === 'ai' && (
                <TableComponent tableData={message.tableData} />
              )}
              
              <div className={`text-xs mt-2 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {/* 로딩 표시 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 text-gray-800 px-4 py-3 rounded-lg shadow-sm max-w-[70%]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-sm text-gray-600 ml-2">AI가 응답을 준비하고 있습니다...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* 스크롤 타겟 요소 */}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="메시지를 입력하세요..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? '전송중...' : '전송'}
          </button>
        </div>
        
        {/* 빠른 질문 버튼들 */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickQuestion('도움말')}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            disabled={isLoading}
          >
            💡 도움말
          </button>
          <button
            onClick={() => handleQuickQuestion('전체 목록 보여줘')}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
            disabled={isLoading}
          >
            📋 전체 목록
          </button>
          <button
            onClick={() => handleQuickQuestion('통계 알려줘')}
            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
            disabled={isLoading}
          >
            📊 통계
          </button>
          <button
            onClick={() => handleQuickQuestion('사용법 알려줘')}
            className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
            disabled={isLoading}
          >
            📖 사용법
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow; 