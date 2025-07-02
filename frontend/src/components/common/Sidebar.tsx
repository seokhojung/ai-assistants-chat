import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { Badge } from '../ui';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { messages } = useChatStore();

  // 메뉴 아이템들
  const menuItems = [
    {
      id: 'dashboard',
      name: '대시보드',
      icon: '🏠',
      path: '/',
      description: '헬스장 현황 한눈에'
    },
    {
      id: 'members',
      name: '회원 관리',
      icon: '👥',
      path: '/chat/member',
      description: '회원 정보 및 결제 관리',
      chatCount: Math.max(0, (messages.member || []).length - 1)
    },
    {
      id: 'staff',
      name: '직원 관리',
      icon: '👷',
      path: '/chat/staff',
      description: '직원 스케줄 및 근태',
      chatCount: Math.max(0, (messages.staff || []).length - 1)
    },
    {
      id: 'hr',
      name: '인사 관리',
      icon: '💼',
      path: '/chat/hr',
      description: '급여 및 인사 업무',
      chatCount: Math.max(0, (messages.hr || []).length - 1)
    },
    {
      id: 'inventory',
      name: '재고 관리',
      icon: '📦',
      path: '/chat/inventory',
      description: '장비 및 용품 관리',
      chatCount: Math.max(0, (messages.inventory || []).length - 1)
    }
  ];

  const otherMenus = [
    {
      id: 'files',
      name: '파일 관리',
      icon: '📁',
      path: '/files',
      description: 'Excel 파일 업로드/관리'
    },
    {
      id: 'components',
      name: 'UI 컴포넌트',
      icon: '🎨',
      path: '/components',
      description: '디자인 시스템',
      badge: 'NEW'
    }
  ];

  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-72 bg-white h-full shadow-lg flex flex-col">
      {/* 상단 헤더 */}
      <div className="p-6 border-b border-neutral-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-2xl">🏋️</div>
          <div>
            <h1 className="text-title-lg font-bold text-neutral-900">Gym AI</h1>
            <p className="text-caption text-neutral-500">헬스장 관리</p>
          </div>
        </div>
        
        {/* 환영 메시지 */}
        <div className="mt-4 p-3 bg-gradient-to-r from-primary-50 to-gym-orange/10 rounded-lg">
          <p className="text-body-sm font-medium text-neutral-700">
            안녕하세요, 관리자님! 💪
          </p>
          <p className="text-caption text-neutral-500">
            오늘 관리할 업무가 여러 개 있습니다
          </p>
        </div>
      </div>

      {/* 메인 메뉴 */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3">
          {/* AI 에이전트 메뉴 */}
          <div className="mb-6">
            <h3 className="px-3 mb-3 text-caption font-semibold text-neutral-400 uppercase tracking-wider">
              AI 에이전트
            </h3>
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = isActiveRoute(item.path);
                
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 shadow-sm'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    <span className={`text-lg transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-body-sm truncate">
                          {item.name}
                        </span>
                        {item.chatCount && item.chatCount > 0 && (
                          <Badge variant="primary" size="sm">
                            {item.chatCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-caption text-neutral-500 truncate">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 기타 메뉴 */}
          <div className="mb-6">
            <h3 className="px-3 mb-3 text-caption font-semibold text-neutral-400 uppercase tracking-wider">
              관리 도구
            </h3>
            <div className="space-y-1">
              {otherMenus.map((item) => {
                const isActive = isActiveRoute(item.path);
                
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-neutral-100 text-neutral-900 shadow-sm'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    <span className={`text-lg transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-body-sm truncate">
                          {item.name}
                        </span>
                        {item.badge && (
                          <Badge variant="gym" size="sm">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-caption text-neutral-500 truncate">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>

      {/* 하단 사용자 정보 */}
      <div className="p-4 border-t border-neutral-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
            {(user?.username || 'A')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-body-sm text-neutral-900 truncate">
              {user?.username || 'Admin'}
            </div>
            <div className="text-caption text-neutral-500">
              관리자
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-2 px-3 py-2 text-caption font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors">
            <span>⚙️</span>
            <span>설정</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-3 py-2 text-caption font-medium text-neutral-700 bg-neutral-200 rounded-lg hover:bg-neutral-300 transition-colors"
          >
            <span>🚪</span>
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 