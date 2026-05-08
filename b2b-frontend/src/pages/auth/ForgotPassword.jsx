import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';

const ForgotPassword = () => {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🚀 백엔드에 리셋 요청
      const res = await apiFetch(`/api/user/forgot-password`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();

      if (data.success) {
        alert(data.message);
        navigate('/login');
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("통신 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 m-4 border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-900">비밀번호 찾기</h2>
          <p className="text-sm text-slate-500 mt-2">가입하신 이메일로 임시 비밀번호를 보내드립니다.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">이메일 주소</label>
            <input
              type="email"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              placeholder="example@gkclean.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-lg shadow-md transition-all active:scale-95 disabled:bg-slate-400"
          >
            {loading ? "발송 중..." : "임시 비밀번호 발급"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => navigate('/login')} className="text-sm font-semibold text-slate-500 hover:text-slate-900">
            ← 로그인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;