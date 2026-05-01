import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      // 1. 백엔드(8080)로 로그인 요청
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      // 2. 서버의 응답을 객체(JSON) 형태로 읽어옵니다.
      const data = await response.json();

      if (response.ok && data.success) {
        // 🔵 핵심: 서버에서 받은 해당 관리자의 법인코드를 브라우저(localStorage)에 저장합니다.
        // 이제 '거래처 관리' 페이지에서 이 값을 꺼내 "내 법인 데이터"만 조회/저장하게 됩니다.
        localStorage.setItem("companyCode", data.companyCode);
        localStorage.setItem("username", data.username);
        
        alert('로그인에 성공했습니다!');
        navigate('/dashboard'); 
      } else {
        // 서버에서 보낸 에러 메시지가 있다면 그걸 띄우고, 없으면 기본 메시지 출력
        alert(data.message || '아이디 또는 비밀번호가 틀렸습니다.');
      }
    } catch (error) {
      console.error('통신 에러:', error);
      alert('서버와 연결할 수 없습니다. 백엔드 서버가 켜져 있는지 확인해 주세요.');
    }
  };

  return (
    // 전체 배경 (화면 꽉 차게, 아주 옅은 슬레이트 톤)
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      
      {/* 로그인 카드 박스 (흰색 배경, 부드러운 그림자, 둥근 모서리) */}
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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
              placeholder="아이디를 입력하세요"
              required
            />
          </div>

          {/* 비밀번호 입력칸 */}
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

          {/* 로그인 버튼 (네이비 톤, 호버 효과) */}
          <button
            type="submit"
            className="w-full mt-4 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-lg shadow-md shadow-slate-800/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            대시보드 입장
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;