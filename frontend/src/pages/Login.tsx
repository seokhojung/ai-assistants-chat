import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Button,
  useToast 
} from '../components/ui';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      addToast({
        type: 'warning',
        title: '입력 오류',
        message: '사용자명과 비밀번호를 모두 입력해주세요.'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // 간단한 로그인 로직 (실제로는 서버 인증 필요)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (username === 'admin' && password === 'admin123') {
        await login({ username, password });
        addToast({
          type: 'success',
          title: '로그인 성공',
          message: '헬스장 관리 시스템에 오신 것을 환영합니다!'
        });
        navigate('/dashboard');
      } else {
        addToast({
          type: 'error',
          title: '로그인 실패',
          message: '사용자명 또는 비밀번호가 올바르지 않습니다.'
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: '시스템 오류',
        message: '로그인 처리 중 오류가 발생했습니다.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = () => {
    setUsername('admin');
    setPassword('admin123');
    addToast({
      type: 'info',
      message: 'Demo 계정이 자동으로 입력되었습니다.'
    });
  };

  return (
    <div className="min-h-screen bg-gym-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card variant="elevated" className="backdrop-blur-sm bg-white/95 shadow-gym">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4 animate-bounce-gentle">🏋️</div>
            <h1 className="text-title-xl font-bold text-gym-gradient mb-2">
              Gym AI System
            </h1>
            <p className="text-body-md text-gray-600">
              AI 기반 헬스장 관리 시스템
            </p>
          </CardHeader>

          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 사용자명 입력 */}
              <div>
                <label htmlFor="username" className="block text-body-sm font-medium text-gray-700 mb-2">
                  사용자명
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input w-full focus-gym-ring"
                  placeholder="사용자명을 입력하세요"
                  disabled={isLoading}
                />
              </div>

              {/* 비밀번호 입력 */}
              <div>
                <label htmlFor="password" className="block text-body-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full focus-gym-ring"
                  placeholder="비밀번호를 입력하세요"
                  disabled={isLoading}
                />
              </div>

              {/* 로그인 버튼 */}
              <Button
                type="submit"
                variant="gym"
                size="lg"
                loading={isLoading}
                className="w-full"
              >
                {isLoading ? '로그인 중...' : '🚀 로그인'}
              </Button>

              {/* 데모 계정 버튼 */}
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={demoLogin}
                disabled={isLoading}
                className="w-full"
              >
                📝 Demo 계정 사용
              </Button>
            </form>

            {/* 안내 정보 */}
            <div className="mt-8 space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-gym-orange/10 rounded-lg border border-gym-orange/20">
                  <span className="text-gym-orange text-sm">💡</span>
                  <span className="text-caption text-gym-dark font-medium">
                    Demo: admin / admin123
                  </span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-body-sm font-semibold text-gray-800">
                  🤖 포함된 AI 에이전트:
                </h3>
                <div className="grid grid-cols-2 gap-2 text-caption text-gray-600">
                  <div className="flex items-center gap-1">
                    <span>👥</span>
                    <span>회원관리</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>👷</span>
                    <span>직원관리</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>💼</span>
                    <span>인사관리</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📦</span>
                    <span>재고관리</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-success-light rounded-lg">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-caption text-success-dark font-medium">
                    시스템 준비 완료
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 하단 정보 */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-body-sm text-white/80">
            🚀 30분 만에 실행 가능한 MVP
          </p>
          <div className="flex items-center justify-center gap-4 text-caption text-white/60">
            <span>v1.0.0</span>
            <span>•</span>
            <span>React + TypeScript</span>
            <span>•</span>
            <span>AI Powered</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 