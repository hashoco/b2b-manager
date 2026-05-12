import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp'; 
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
import CompanyProfile from './pages/settings/CompanyProfile';
import Checkout from './pages/payment/Checkout'; // Checkout 컴포넌트 임포트 확인
import SubscriptionGuard from './pages/auth/SubscriptionGuard';

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
        {/* 🚀 1. MainLayout 밖의 독립적인 페이지들 (사이드바 없음, 인증 불필요) */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} /> 
        <Route path="/signup" element={<SignUp />} /> 
        <Route path="/change-password-init" element={<ChangePasswordInit />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* 결제 화면도 사이드바 없이 띄우는 것이 일반적입니다 */}
        <Route path="/payment/checkout" element={<Checkout />} /> 

        {/* 🚀 2. 인증 및 구독 확인이 필요한 페이지들 (Guard + MainLayout) */}
        <Route element={<SubscriptionGuard />}>
          {/* MainLayout으로 감싸서 사이드바를 보여줍니다 */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/dailyWork" element={<DailyWork />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/taxInvoice" element={<TaxInvoice />} />
            <Route path="/profitReport" element={<ProfitReport />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/settings/company" element={<CompanyProfile />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;