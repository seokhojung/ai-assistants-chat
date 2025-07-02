import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { Button, Badge } from '../ui';

const Header: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { messages } = useChatStore();

  const handleLogout = () => {
    logout();
  };

  // 에이전트별 메시지 수 계산
  const getMessageCount = (agentId: string) => {
    const agentMessages = messages[agentId as keyof typeof messages] || [];
    return Math.max(0, agentMessages.length - 1);
  };

  const agents = [
    { id: 'member', name: '회원관리', icon: '👥', color: 'primary' },
    { id: 'staff', name: '직원관리', icon: '👷', color: 'success' },
    { id: 'hr', name: '인사관리', icon: '💼', color: 'gym' },
    { id: 'inventory', name: '재고관리', icon: '📦', color: 'warning' }
  ];

  const isActiveRoute = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 영역 */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="text-2xl group-hover:animate-bounce-gentle">🏋️</div>
              <div>
                <div className="text-title-lg font-bold text-gym-gradient">Gym AI</div>
                <div className="text-caption text-gray-500">관리 시스템</div>
              </div>
            </Link>

            {/* 메인 네비게이션 */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-body-md font-medium transition-all duration-200 ${
                  isActiveRoute('/') 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <span>📊</span>
                <span>대시보드</span>
              </Link>

              <Link
                to="/files"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-body-md font-medium transition-all duration-200 ${
                  isActiveRoute('/files') 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <span>📁</span>
                <span>파일관리</span>
              </Link>

              <Link
                to="/components"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-body-md font-medium transition-all duration-200 ${
                  isActiveRoute('/components') 
                    ? 'bg-gym-orange text-white' 
                    : 'text-gray-600 hover:text-gym-orange hover:bg-gym-orange/10'
                }`}
              >
                <span>🎨</span>
                <span>컴포넌트</span>
                <Badge variant="gym" size="sm">NEW</Badge>
              </Link>
            </nav>
          </div>

          {/* AI 에이전트 빠른 링크 */}
          <div className="hidden lg:flex items-center gap-2">
            {agents.map((agent) => {
              const messageCount = getMessageCount(agent.id);
              const isActive = location.pathname === `/chat/${agent.id}`;
              
              return (
                <Link
                  key={agent.id}
                  to={`/chat/${agent.id}`}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-body-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 shadow-soft'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                  title={`${agent.name} AI`}
                >
                  <span className="text-sm">{agent.icon}</span>
                  <span className="hidden xl:block">{agent.name}</span>
                  {messageCount > 0 && (
                    <Badge variant={agent.color as any} size="sm">
                      {messageCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>

          {/* 사용자 영역 */}
          <div className="flex items-center gap-4">
            {/* 알림 */}
            <button className="relative p-2 text-gray-500 hover:text-primary-600 transition-colors">
              <span className="text-lg">🔔</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </button>

            {/* 사용자 정보 */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-body-sm font-medium text-gray-900">
                  {user?.username || 'Admin'}
                </div>
                <div className="text-caption text-gray-500">관리자</div>
              </div>
              
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-semibold">
                    {(user?.username || 'A')[0].toUpperCase()}
                  </div>
                  <span className="text-gray-400">▼</span>
                </button>
                
                {/* 드롭다운 메뉴 */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-4 border-b border-gray-100">
                    <div className="font-medium text-gray-900">{user?.username || 'Admin'}</div>
                    <div className="text-sm text-gray-500">gym.admin@example.com</div>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      <span>👤</span>
                      <span>프로필</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      <span>⚙️</span>
                      <span>설정</span>
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded w-full text-left"
                    >
                      <span>🚪</span>
                      <span>로그아웃</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 네비게이션 (선택사항) */}
      <div className="md:hidden border-t border-gray-200 bg-white">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm">
              <span>📊</span>
              <span>대시보드</span>
            </Link>
            <Link to="/files" className="flex items-center gap-2 px-3 py-2 text-sm">
              <span>📁</span>
              <span>파일</span>
            </Link>
            <Link to="/chat/member" className="flex items-center gap-2 px-3 py-2 text-sm">
              <span>🤖</span>
              <span>AI</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 