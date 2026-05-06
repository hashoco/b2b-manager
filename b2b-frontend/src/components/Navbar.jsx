import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 현재 페이지 확인
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    alert('로그아웃 되었습니다.');
    navigate('/');
  };

  // 메뉴 리스트 데이터 (업무 관련 메인 메뉴)
  const menuItems = [
    { path: '/dashboard', icon: '📊', label: '대시보드' },
    { path: '/clients', icon: '🏢', label: '거래처 관리' },
    { path: '/dailyWork', icon: '🚚', label: '배송 현황' },
    { path: '/attendance', icon: '📅', label: '근태 관리' },
    { path: '/taxInvoice', icon: '📑', label: '세금계산서 엑셀' },
    { path: '/profitReport', icon: '📒', label: '월별 매출 레포트' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 h-screen bg-slate-900 text-slate-300 shadow-2xl transition-all duration-300 ease-in-out flex flex-col
        ${isHovered ? 'w-64' : 'w-20'}
      `}
      style={{ zIndex: 9999 }} // 🚀 핵심: Tailwind를 무시하고 브라우저에 직접 최상단 고정 명령
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 로고 영역 */}
      <div className="h-20 flex items-center justify-center border-b border-slate-800">
        <span className="text-2xl font-extrabold text-white tracking-wider whitespace-nowrap overflow-hidden">
          {isHovered ? 'B2B MANAGER' : '⚙️'}
        </span>
      </div>

      {/* 메뉴 영역 */}
      <div className="flex-1 py-6 flex flex-col space-y-2 overflow-x-hidden">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-4 mx-2 rounded-xl transition-all duration-200 group
              ${isActive(item.path) ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800 hover:text-white'}
            `}
          >
            <span className="text-xl shrink-0">{item.icon}</span>
            <span 
              className={`ml-4 font-semibold whitespace-nowrap transition-all duration-300
                ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
              `}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>

      {/* 🚀 하단 설정 & 로그아웃 영역 */}
      <div className="p-4 border-t border-slate-800 flex flex-col space-y-2 overflow-x-hidden">
        
        {/* 비밀번호 변경 버튼 추가 */}
        <Link 
          to="/change-password"
          className={`flex items-center w-full px-4 py-3 rounded-xl transition-colors duration-200 
            ${isActive('/change-password') ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
          `}
        >
          <span className="text-xl shrink-0">🔒</span>
          <span className={`ml-4 font-semibold whitespace-nowrap transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            비밀번호 변경
          </span>
        </Link>

        {/* 기존 로그아웃 버튼 */}
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors duration-200 text-slate-400 hover:text-white"
        >
          <span className="text-xl shrink-0">🚪</span>
          <span className={`ml-4 font-semibold whitespace-nowrap transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            로그아웃
          </span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;