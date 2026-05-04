import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const Login = () => {
  
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

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
        
        localStorage.setItem("companyCode", data.companyCode);
        localStorage.setItem("userId", data.userId);      // 로그인 ID
        localStorage.setItem("username", data.username);  // 사용자 이름/닉네임
        localStorage.setItem("role", data.role);          // 권한 (예: SUPER_ADMIN, USER 등)
        
        alert(`${data.username || '관리자'}님, 환영합니다!`);
        
        if (data.role === 'SUPER_ADMIN') {
          navigate('/dashboard'); 
        } else {
          navigate('/dashboard'); 
        }
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
        
        {/* 타이틀 영역 */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            B2B 세탁 관리자
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            최고 관리자 계정으로 로그인해 주세요.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* 아이디 입력칸 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              아이디
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
              placeholder="아이디를 입력하세요"
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
              className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-lg shadow-md shadow-slate-800/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            로그인
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;