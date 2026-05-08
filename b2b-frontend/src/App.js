import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp'; // 🚀 추가: 회원가입 컴포넌트 임포트
import Dashboard from './pages/dashboard/Dashboard';
import Navbar from './components/Navbar';
import Clients from './pages/partners/Clients'; 
import DailyWork from './pages/work/DailyWork';
import Attendance from './pages/hr/Attendance';
import TaxInvoice from './pages/finance/TaxInvoice';
import ProfitReport from './pages/finance/ProfitReport';
import ChangePassword from './pages/auth/ChangePassword'; 
import ChangePasswordInit from './pages/auth/ChangePasswordInit'
import ForgotPassword from './pages/auth/ForgotPassword'; 



const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 좌측 고정형 사이드바 */}
      <Navbar />
      
      {/* 우측 메인 컨텐츠 영역 (사이드바 기본 너비만큼 좌측 여백 추가) */}
      <div className="flex-1 ml-20 transition-all duration-300">
        <Outlet />
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🚀 MainLayout 밖의 독립적인 페이지들 (사이드바 없음) */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} /> {/* 명시적 로그인 경로 추가 추천 */}
        <Route path="/signup" element={<SignUp />} /> {/* 🚀 추가: 회원가입 라우트 */}
        <Route path="/change-password-init" element={<ChangePasswordInit />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* MainLayout 안의 페이지들 (사이드바 있음) */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} /> 
          <Route path="/dailyWork" element={<DailyWork />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/taxInvoice" element={<TaxInvoice />} />
          <Route path="/profitReport" element={<ProfitReport />} />
          <Route path="/change-password" element={<ChangePassword />} />
          
          
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;