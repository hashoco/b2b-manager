import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import Clients from './pages/Clients'; 


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
        <Route path="/" element={<Login />} />
        
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} /> {/* <-- 주석 해제! */}
          {/* <Route path="/orders" element={<Orders />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;