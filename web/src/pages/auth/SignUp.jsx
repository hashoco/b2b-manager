import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    username: '',
    userId: '', // 이메일로 사용
    password: '',
    passwordConfirm: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // 비밀번호 복잡도 유효성 검사
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      alert('비밀번호는 영문 대소문자, 숫자, 특수문자를 모두 포함하여 8자리 이상이어야 합니다.');
      return;
    }
    // 비밀번호 일치 여부 확인
    if (formData.password !== formData.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await fetch(`/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      
      if (response.ok) {
        alert('회원가입이 완료되었습니다. 로그인해 주세요!');
        navigate('/login');
      } else {
        alert(data.message || '회원가입에 실패했습니다.');
      }
      
    } catch (error) {
      console.error('통신 에러:', error);
      alert('서버와 연결할 수 없습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans py-10">
      {/* 🚀 max-w-lg를 max-w-md로 변경하여 로그인 화면과 넓이 통일 */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 m-4 border border-slate-100">
        
        {/* 상단 로고 및 타이틀 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl mb-4 shadow-md">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            무료로 시작하기
          </h2>
          <p className="text-sm text-slate-400 mt-2 font-medium">
            WashBiz 계정을 생성하고 비즈니스를 관리하세요.
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-5">
          <div className="space-y-4">
            
            {/* 상호명 & 담당자명 (2단 분할) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5 ml-1">상호명</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5 ml-1">담당자명</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* 아이디 (이메일) */}
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5 ml-1">아이디 (이메일)</label>
              <input
                type="email"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all duration-200"
                required
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5 ml-1">비밀번호</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all duration-200"
                placeholder="••••••••"
                required
              />
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5 ml-1">비밀번호 확인</label>
              <input
                type="password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all duration-200"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-lg shadow-md shadow-slate-800/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            계정 생성하기
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          이미 계정이 있으신가요?{' '}
          <button 
            onClick={() => navigate('/login')} 
            className="font-semibold text-slate-800 hover:underline underline-offset-2 transition-colors"
          >
            로그인하기
          </button>
        </div>

      </div>
    </div>
  );
};

export default SignUp;