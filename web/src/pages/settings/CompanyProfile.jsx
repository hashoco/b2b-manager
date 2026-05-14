"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api'; 

const CompanyProfile = () => {
  const navigate = useNavigate();
  const companyCode = localStorage.getItem("companyCode");
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bizRegNo: '',
    companyName: '',
    ownerName: '',
    email: '',
  });

  const [subInfo, setSubInfo] = useState({ endDate: null, status: "INACTIVE" });
  const [history, setHistory] = useState([]);
  const [subLoading, setSubLoading] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      if (!companyCode) return;
      try {
        const profileRes = await apiFetch(`/api/settings/company?companyCode=${companyCode}`);
        const profileData = await profileRes.json();
        if (profileData.success && profileData.profile) {
          setFormData({
            bizRegNo: profileData.profile.bizRegNo || '',
            companyName: profileData.profile.companyName || '',
            ownerName: profileData.profile.ownerName || '',
            email: profileData.profile.email || '',
          });
        }
        const subRes = await apiFetch(`/api/subscription/info?companyCode=${companyCode}`);
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubInfo({ endDate: subData.endDate, status: subData.status });
          setHistory(subData.paymentHistory || []);
        }
      } catch (err) {
        console.error("데이터 로드 실패:", err);
      } finally {
        setSubLoading(false);
      }
    };
    loadAllData();
  }, [companyCode]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch(`/api/settings/company/save`, {
        method: "POST",
        body: JSON.stringify({ ...formData, companyCode })
      });
      const result = await res.json();
      if (result.success) alert("사업자 정보가 성공적으로 업데이트되었습니다.");
    } catch (err) {
      console.error("저장 중 에러 발생:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDday = (endDateStr) => {
    if (!endDateStr) return 0;
    const today = new Date();
    const end = new Date(endDateStr);
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const dDay = calculateDday(subInfo.endDate);

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="max-w-4xl mx-auto space-y-4"> {/* 섹션 간 간격 축소 (space-y-8 -> 4) */}
        
        <h1 className="text-xl font-bold text-slate-800 ml-1">설정 및 구독 관리</h1>

        {/* =========================================
            [섹션 1] 사업자 정보 (간격 대폭 축소)
        ========================================= */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* 헤더 높이 축소 (p-6 -> py-3 px-5) */}
          <div className="py-3 px-5 border-b border-slate-200 bg-slate-50">
            <h2 className="text-sm font-bold text-slate-800">사업자 정보</h2>
          </div>

          {/* 폼 내부 여백 및 요소 간 간격 축소 (p-8 -> p-5, space-y-6 -> 4) */}
          <form onSubmit={handleSave} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3"> {/* 가로 간격 유지, 세로 간격 축소 */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 mb-1">사업자 등록번호</label>
                <input
                  type="text"
                  value={formData.bizRegNo}
                  onChange={(e) => setFormData({...formData, bizRegNo: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 mb-1">공급자 상호(법인명)</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 mb-1">대표자 성명</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 mb-1">대표 이메일 (계산서 발송용)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* 버튼 상단 여백 축소 (pt-4 -> pt-1) */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all text-sm disabled:bg-slate-400"
              >
                {loading ? "저장 중..." : "사업자 정보 저장하기"}
              </button>
            </div>
          </form>
        </div>

        {/* =========================================
            [섹션 2] 구독 및 결제 내역 (통합 섹션)
        ========================================= */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="py-3 px-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800">구독 및 결제 내역</h2>
            {!subLoading && history.length > 0 && (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                TOTAL {history.length}
              </span>
            )}
          </div>

          {subLoading ? (
            <div className="p-6 text-center text-slate-400 text-xs animate-pulse">데이터 로드 중...</div>
          ) : (
            <>
              {/* 구독 현황 (간격 최적화) */}
              <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="text-[11px] font-bold text-slate-400 mb-1">이용 플랜</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-blue-600">WashBiz PRO</span>
                    {dDay > 0 ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded border border-emerald-100">ACTIVE</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded border border-red-100">EXPIRED</span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mt-1">
                    만료일: <span className="font-semibold text-slate-700">{subInfo.endDate || "-"}</span> 
                    {dDay > 0 && <span className="ml-1.5 text-red-500 font-bold">(D-{dDay})</span>}
                  </p>
                </div>
                
                <button 
                  onClick={() => navigate('/payment/checkout')}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  구독 기간 연장
                </button>
              </div>

              {/* 결제 내역 테이블 */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-2.5 font-bold uppercase tracking-tighter">Date</th>
                      <th className="px-6 py-2.5 font-bold uppercase tracking-tighter">Order ID</th>
                      <th className="px-6 py-2.5 font-bold uppercase tracking-tighter text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {history.length === 0 ? (
                      <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-400">내역이 없습니다.</td></tr>
                    ) : (
                      history.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-3 text-slate-600 font-medium">
                            {new Date(item.approvedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-3 font-mono text-slate-400 text-[10px]">{item.orderId}</td>
                          <td className="px-6 py-3 font-bold text-slate-800 text-right">
                            {item.amount.toLocaleString()}원
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;