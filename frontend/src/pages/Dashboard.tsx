import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, DashboardStats, RecentActivity } from '../services/dashboard';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeStaff: 0,
    lowStockItems: 0,
    todayAttendance: 0
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, activitiesData] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRecentActivities()
        ]);
        setStats(statsData);
        setActivities(activitiesData);
      } catch (error) {
        // 데이터 로드 실패 시 기본값 사용
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const statsCards = [
    { title: '총 회원 수', value: `${stats.totalMembers}명`, icon: '👥', color: 'bg-blue-500' },
    { title: '활성 직원', value: `${stats.activeStaff}명`, icon: '👷', color: 'bg-green-500' },
    { title: '재고 부족', value: `${stats.lowStockItems}개`, icon: '📦', color: 'bg-red-500' },
    { title: '오늘 출석', value: `${stats.todayAttendance}명`, icon: '📊', color: 'bg-purple-500' }
  ];

  const quickActions = [
    { name: '회원관리 AI', icon: '👥', type: 'member', description: '회원 등록 및 관리' },
    { name: '직원관리 AI', icon: '👷', type: 'staff', description: '스케줄 및 근태 관리' },
    { name: '인사관리 AI', icon: '💼', type: 'hr', description: '급여 및 휴가 관리' },
    { name: '재고관리 AI', icon: '📦', type: 'inventory', description: '재고 및 발주 관리' }
  ];

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          🏋️ 헬스장 관리 대시보드
        </h1>
        <p className="text-gray-600">
          AI 에이전트들이 헬스장 운영을 도와드립니다. 궁금한 것이 있으시면 언제든지 물어보세요!
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // 로딩 스켈레톤
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          ))
        ) : (
          statsCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} text-white p-3 rounded-full text-xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI 에이전트 바로가기 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          🤖 AI 에이전트 바로가기
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.type}
              to={`/chat/${action.type}`}
              className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{action.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-1">{action.name}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          📈 최근 활동
        </h2>
        
        <div className="space-y-3">
          {isLoading ? (
            // 로딩 스켈레톤
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded animate-pulse">
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
                <div className="flex-1 h-4 bg-gray-300 rounded"></div>
                <div className="w-12 h-3 bg-gray-300 rounded"></div>
              </div>
            ))
          ) : (
            activities.map(activity => {
              const typeColors = {
                success: 'text-green-500',
                info: 'text-blue-500',
                warning: 'text-yellow-500',
                error: 'text-red-500'
              };
              
              const typeIcons = {
                success: '✅',
                info: '📋',
                warning: '⚠️',
                error: '❌'
              };

              return (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <span className={typeColors[activity.type]}>
                    {typeIcons[activity.type]}
                  </span>
                  <span className="text-sm">{activity.message}</span>
                  <span className="text-xs text-gray-500 ml-auto">{activity.timestamp}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 빠른 시작 가이드 */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          🚀 빠른 시작 가이드
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 p-4 rounded">
            <h3 className="font-semibold mb-2">1. AI 에이전트 선택</h3>
            <p className="text-sm opacity-90">
              왼쪽 사이드바에서 원하는 AI 에이전트를 클릭하세요.
            </p>
          </div>
          
          <div className="bg-white bg-opacity-20 p-4 rounded">
            <h3 className="font-semibold mb-2">2. 질문하기</h3>
            <p className="text-sm opacity-90">
              채팅창에서 자연어로 질문하거나 요청하세요.
            </p>
          </div>
          
          <div className="bg-white bg-opacity-20 p-4 rounded">
            <h3 className="font-semibold mb-2">3. 답변 받기</h3>
            <p className="text-sm opacity-90">
              AI가 데이터를 분석하여 즉시 답변해드립니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 