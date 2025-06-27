import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated, isInitialized } = useAuth();

  // 이미 로그인된 사용자는 대시보드로 리다이렉트
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isInitialized, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login({ username, password });
      navigate('/');
    } catch (error) {
      // 에러는 useAuth에서 처리됨
      // 로그인 실패는 authStore에서 처리
    }
  };

  // 초기화 중일 때 로딩 화면 표시
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">🔄</div>
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🏋️</div>
          <h1 className="text-2xl font-bold text-gray-800">Gym AI MVP</h1>
          <p className="text-gray-600 mt-2">헬스장 관리 시스템</p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              사용자명
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="사용자명을 입력하세요"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 에러 메시지 */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* 테스트 계정 안내 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">
            🧪 테스트 계정
          </h3>
          <div className="text-sm text-blue-700">
            <div>사용자명: <code className="bg-blue-100 px-1 rounded">admin</code></div>
            <div>비밀번호: <code className="bg-blue-100 px-1 rounded">admin123</code></div>
          </div>
        </div>

        {/* 기능 안내 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🚀 30분 안에 실행 가능한 MVP 버전
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 