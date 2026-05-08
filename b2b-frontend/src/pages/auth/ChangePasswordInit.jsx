import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api'; // 🚀 기존에 만든 apiFetch 사용 (경로 확인 필요)

const ChangePasswordInit = () => {
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. 비밀번호 복잡도 유효성 검사 (회원가입과 동일한 기준)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      alert('비밀번호는 영문 대소문자, 숫자, 특수문자를 모두 포함하여 8자리 이상이어야 합니다.');
      return;
    }

    // 2. 비밀번호 일치 여부 확인
    if (newPassword !== newPasswordConfirm) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      // 🚀 apiFetch를 사용하면 헤더에 Authorization(토큰)이 자동으로 들어갑니다!
      const response = await apiFetch(`/api/user/change-password-init`, {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        alert('비밀번호 변경이 완료되었습니다. 대시보드로 이동합니다!');
        navigate('/dashboard'); // 성공 시 대시보드로 이동
      } else {
        alert(data.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('통신 에러:', error);
      alert('서버와 통신 중 에러가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans py-10">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 m-4 border border-slate-100">
        
        {/* 상단 아이콘 및 타이틀 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-50 text-red-600 rounded-2xl mb-4 shadow-sm border border-red-100">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            초기 비밀번호 변경
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-medium break-keep">
            안전한 서비스 이용을 위해 발급받으신 임시 비밀번호를 새 비밀번호로 변경해 주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            
            {/* 새 비밀번호 */}
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5 ml-1">새 비밀번호</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all duration-200"
                placeholder="영문 대소문자, 숫자, 특수문자 포함 8자 이상"
                required
              />
            </div>

            {/* 새 비밀번호 확인 */}
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5 ml-1">새 비밀번호 확인</label>
              <input
                type="password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all duration-200"
                placeholder="비밀번호를 한 번 더 입력해 주세요"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-lg shadow-md shadow-slate-800/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:bg-slate-400 disabled:transform-none"
          >
            {loading ? '변경 중...' : '비밀번호 변경 및 시작하기'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default ChangePasswordInit;