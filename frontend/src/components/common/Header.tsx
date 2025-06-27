import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b px-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">
          🏋️ Gym AI MVP
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {user ? `안녕하세요, ${user.username}님` : '헬스장 관리 시스템'}
          </div>
          
          <button 
            onClick={handleLogout}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 