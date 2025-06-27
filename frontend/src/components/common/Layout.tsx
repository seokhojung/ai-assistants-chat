import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <div className="h-screen flex">
      {/* 사이드바 */}
      <div className="w-64 bg-white border-r">
        <Sidebar />
      </div>
      
      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-hidden bg-gray-50 p-4">
          <div className="h-full max-w-full">
          <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 