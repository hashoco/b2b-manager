import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberId, setRememberId] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    const savedId = localStorage.getItem("savedUserId");
    if (savedId) {
      setUserId(savedId);
      setRememberId(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, password }), 
      });

      const data = await response.json();

      if (response.ok && data.success !== false) { 
        
        if (rememberId) {
          localStorage.setItem("savedUserId", userId);
        } else {
          localStorage.removeItem("savedUserId");
        }

        // 기존 데이터 저장
        localStorage.setItem("token", data.token);
        localStorage.setItem("companyCode", data.companyCode);
        localStorage.setItem("userId", data.userId);      
        localStorage.setItem("username", data.username);  
        localStorage.setItem("role", data.role);          
        
        // 🚀 [신규 추가] 구독 정보 저장
        if (data.subscriptionStatus) {
            localStorage.setItem("subscriptionStatus", data.subscriptionStatus);
        }
        if (data.subscriptionEndDate) {
            localStorage.setItem("subscriptionEndDate", data.subscriptionEndDate);
        }

        // 초기 비밀번호 변경 로직 (기존 유지)
        if (data.isFirstLogin === 'Y' || data.isFirstLogin === true) {
          alert('안전한 서비스 이용을 위해 초기 비밀번호를 변경해 주세요.');
          navigate('/change-password-init'); 
          return; 
        }

        alert(`${data.username || '관리자'}님, 환영합니다!`);
        navigate('/dashboard'); 
        
      } else {
        alert(data.message || '아이디 또는 비밀번호가 틀렸습니다.');
      }
    } catch (error) {
      console.error('통신 에러:', error);
      alert('서버와 연결할 수 없습니다. 백엔드 서버가 켜져 있는지 확인해 주세요.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 m-4 border border-slate-100">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl mb-5 shadow-lg shadow-slate-200">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            로그인
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            WashBiz 서비스에 오신 것을 환영합니다.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              아이디 (이메일)
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200"
              placeholder="admin@google.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberId}
                onChange={(e) => setRememberId(e.target.checked)}
                className="mr-2 w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
              />
              아이디 저장 
            </label>
            
            {/* 🚀 이 부분에 onClick 이벤트를 추가했습니다! */}
            <button
              type="button"
              onClick={() => navigate('/forgot-password')} 
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              비밀번호 찾기
            </button>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-lg shadow-md shadow-slate-800/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            로그인
          </button>
        </form>

        <div className="mt-10 text-center text-sm text-slate-500">
          아직 계정이 없으신가요?{' '}
          <button 
            onClick={() => navigate('/signup')} 
            className="font-semibold text-slate-800 hover:underline underline-offset-2 transition-colors"
          >
            회원가입
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;