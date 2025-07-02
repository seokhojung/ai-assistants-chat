import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Button, 
  Badge,
  useToast
} from '../components/ui';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';

// 샘플 데이터
const todayTasks = [
  {
    id: 1,
    title: '김철수 회원 결제 확인',
    type: 'member',
    icon: '👥',
    priority: 'high',
    time: '10:00',
    status: '대기중'
  },
  {
    id: 2,
    title: '새로운 트레이너 면접',
    type: 'staff',
    icon: '👷',
    priority: 'medium',
    time: '14:00',
    status: '완료'
  },
  {
    id: 3,
    title: '프로틴 파우더 재고 부족',
    type: 'inventory',
    icon: '📦',
    priority: 'high',
    time: '16:00',
    status: '대기중'
  },
  {
    id: 4,
    title: '이영희 휴가 승인',
    type: 'hr',
    icon: '💼',
    priority: 'low',
    time: '18:00',
    status: '처리중'
  }
];

const Dashboard: React.FC = () => {
  const { messages } = useChatStore();
  const { user } = useAuthStore();
  const { addToast } = useToast();
  const [stats, setStats] = useState({
    totalMembers: 1247,
    activeMembers: 1189,
    todayAttendance: 184,
    totalChats: 0
  });

  // 회원/직원 상태 데이터
  const statusData = [
    { name: '매우 건강함', count: 892, color: 'bg-emerald-500', icon: '💪' },
    { name: '건강함', count: 297, color: 'bg-primary-500', icon: '😊' },
    { name: '관심 필요', count: 45, color: 'bg-gym-orange', icon: '⚠️' },
    { name: '어려움', count: 13, color: 'bg-neutral-400', icon: '🚨' }
  ];

  // 주간 활동 데이터 (차트용)
  const weeklyData = [
    { day: '월', value: 85 },
    { day: '화', value: 92 },
    { day: '수', value: 78 },
    { day: '목', value: 96 },
    { day: '금', value: 104 },
    { day: '토', value: 112 },
    { day: '일', value: 88 }
  ];

  useEffect(() => {
    // 통계 데이터 로드
    const totalChats = Object.values(messages).reduce((total, agentMessages) => {
      return total + Math.max(0, agentMessages.length - 1);
    }, 0);

    setStats(prev => ({
      ...prev,
      totalChats
    }));

    addToast({
      type: 'success',
      message: '대시보드가 업데이트되었습니다.'
    });
  }, [messages, addToast]);

  const handleTaskAction = (taskId: number, action: string) => {
    const task = todayTasks.find(t => t.id === taskId);
    if (task) {
      addToast({
        type: 'info',
        title: `${task.title}`,
        message: `${action} 처리되었습니다.`
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-neutral-700 bg-neutral-200';
      case 'medium': return 'text-neutral-600 bg-neutral-100';
      case 'low': return 'text-emerald-700 bg-emerald-100';
      default: return 'text-neutral-600 bg-neutral-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '완료': return 'success';
      case '처리중': return 'warning';
      case '대기중': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="h-full bg-neutral-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* 상단 환영 메시지 */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary-500 to-gym-orange p-6 rounded-2xl text-white shadow-lg">
            <h1 className="text-display-lg font-bold mb-2">
              안녕하세요, {user?.username || '관리자'}님! 🏋️‍♂️
            </h1>
            <p className="text-body-lg opacity-90">
              오늘 관리할 업무가 {todayTasks.filter(t => t.status !== '완료').length}개 있습니다
            </p>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="elevated" hover>
            <CardBody className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <div className="text-display-sm font-bold text-primary-600 mb-1">
                {stats.totalMembers.toLocaleString()}
              </div>
              <p className="text-body-sm text-neutral-600">전체 회원</p>
            </CardBody>
          </Card>

          <Card variant="elevated" hover>
            <CardBody className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <div className="text-display-sm font-bold text-emerald-600 mb-1">
                {stats.activeMembers.toLocaleString()}
              </div>
              <p className="text-body-sm text-neutral-600">활성 회원</p>
            </CardBody>
          </Card>

          <Card variant="elevated" hover>
            <CardBody className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gym-orange/20 rounded-full mx-auto mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <div className="text-display-sm font-bold text-gym-orange mb-1">
                {stats.todayAttendance}
              </div>
              <p className="text-body-sm text-neutral-600">오늘 출석</p>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 왼쪽: 오늘의 관리 */}
          <div className="lg:col-span-2">
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⏰</span>
                  <h3 className="text-title-lg font-semibold">오늘의 관리</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {todayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm">
                        <span className="text-lg">{task.icon}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-body-md truncate">
                            {task.title}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-caption font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority === 'high' ? '긴급' : task.priority === 'medium' ? '보통' : '낮음'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-body-sm text-neutral-500">
                          <span>⏰ {task.time}</span>
                          <Badge variant={getStatusColor(task.status) as any} size="sm">
                            {task.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {task.status !== '완료' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleTaskAction(task.id, '완료')}
                          >
                            ✓
                          </Button>
                        )}
                        <Link to={`/chat/${task.type}`}>
                          <Button variant="ghost" size="sm">
                            🤖
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 오른쪽: 회원 건강 상태 */}
          <div>
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <h3 className="text-title-lg font-semibold">회원 건강 상태</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {statusData.map((status, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-body-sm font-medium text-neutral-700">
                            {status.icon} {status.name}
                          </span>
                          <span className="text-title-md font-bold text-neutral-900">
                            {status.count}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* 하단: 주간 관리 활동 차트 */}
        <div className="mt-8">
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📈</span>
                  <h3 className="text-title-lg font-semibold">주간 관리 활동</h3>
                </div>
                <Badge variant="gym" size="lg">
                  이번 주
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              <div className="flex items-end gap-4 h-48">
                {weeklyData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-primary-500 to-primary-300 rounded-t-lg mb-2 transition-all duration-300 hover:from-gym-orange hover:to-gym-orange/80"
                      style={{ height: `${(data.value / 120) * 100}%` }}
                    ></div>
                    <div className="text-body-sm font-medium text-neutral-700 mb-1">
                      {data.value}
                    </div>
                    <div className="text-caption text-neutral-500">
                      {data.day}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <p className="text-body-sm text-neutral-600">
                  주간 평균: {Math.round(weeklyData.reduce((sum, d) => sum + d.value, 0) / weeklyData.length)}회
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 빠른 액션 */}
        <div className="mt-8 text-center">
          <Card variant="outlined" className="max-w-2xl mx-auto">
            <CardBody>
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="text-title-lg font-semibold mb-2 text-gym-orange">
                AI와 함께 스마트한 헬스장 관리
              </h3>
              <p className="text-body-md text-neutral-600 mb-4">
                AI 에이전트가 회원 관리부터 재고 관리까지 모든 업무를 도와드립니다
              </p>
              <div className="flex justify-center gap-3">
                <Link to="/chat/member">
                  <Button variant="primary">
                    👥 회원 관리 시작
                  </Button>
                </Link>
                <Link to="/files">
                  <Button variant="secondary">
                    📁 파일 관리
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 