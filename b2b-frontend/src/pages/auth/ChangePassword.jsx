import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api'; // 🚀 공통 API 함수 임포트

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  // 비밀번호 변경 처리
  const handleChangePassword = async (e) => {
    e.preventDefault();

    // 1. 유효성 검사 (복잡도 및 일치 여부)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    
    if (!passwordRegex.test(newPassword)) {
      alert('비밀번호는 영문 대소문자, 숫자, 특수문자를 모두 포함하여 8자리 이상이어야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    const userId = localStorage.getItem("userId");

    // 2. 서버로 변경 요청
    try {
      // 🚀 기본 fetch 대신 토큰을 자동으로 담아주는 apiFetch 사용
      const response = await apiFetch(`/api/user/change-password`, {
        method: 'POST',
        body: JSON.stringify({ userId, currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('비밀번호가 성공적으로 변경되었습니다. 메인 화면으로 이동합니다.');
        navigate('/dashboard'); 
      } else {
        alert(data.message || '비밀번호 변경에 실패했습니다. 기존 비밀번호를 확인해 주세요.');
      }
    } catch (error) {
      console.error('통신 에러:', error);
      alert('서버와 연결할 수 없습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 m-4 border border-slate-100">
        
        {/* 헤더 */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            비밀번호 변경
          </h2>
          <p className="text-sm text-rose-500 mt-2 font-medium">
            초기 비밀번호를 사용 중입니다.<br/>안전한 사용을 위해 비밀번호를 변경해 주세요.
          </p>
        </div>

        {/* 폼 영역 */}
        <form onSubmit={handleChangePassword} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              현재 비밀번호 (초기 비밀번호)
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
              placeholder="현재 비밀번호 입력"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              새 비밀번호
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              placeholder="새로운 비밀번호 입력"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              새 비밀번호 확인
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              placeholder="새로운 비밀번호 재입력"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-lg shadow-md shadow-blue-600/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            비밀번호 변경 완료
          </button>
        </form>

      </div>
    </div>
  );
};

export default ChangePassword;