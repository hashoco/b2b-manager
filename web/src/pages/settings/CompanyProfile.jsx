"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api'; 

const CompanyProfile = () => {
  const companyCode = localStorage.getItem("companyCode");
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bizRegNo: '',
    companyName: '',
    ownerName: '',
    email: '',
  });

  // 1. 화면이 열릴 때 DB에서 기존 정보 불러오기 (GET)
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await apiFetch(`/api/settings/company?companyCode=${companyCode}`);
        const data = await res.json();
        
        // 백엔드에서 null이나 빈 값이 올 것을 대비해 안전하게 세팅
        if (data.success && data.profile) {
          setFormData({
            bizRegNo: data.profile.bizRegNo || '',
            companyName: data.profile.companyName || '',
            ownerName: data.profile.ownerName || '',
            email: data.profile.email || '',
          });
        }
      } catch (err) {
        console.error("프로필 로드 실패", err);
      }
    };

    if (companyCode) {
      loadProfile();
    }
  }, [companyCode]);

  // 2. 작성한 정보 DB에 저장하기 (POST)
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 🚀 백엔드로 저장 요청 날리기
      const res = await apiFetch(`/api/settings/company/save`, {
        method: "POST",
        body: JSON.stringify({ ...formData, companyCode })
      });
      
      const result = await res.json();
      
      if (result.success) {
        alert("사업자 정보가 성공적으로 업데이트되었습니다.");
      } else {
        alert("저장 실패: " + (result.message || "알 수 없는 오류"));
      }
    } catch (err) {
      console.error("저장 중 에러 발생:", err);
      alert("저장 중 네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-slate-800">사업자 정보 관리</h1>
        <p className="text-slate-500 mb-8 text-sm">
          세금계산서 발행 시 '공급자' 정보로 사용되는 공식 정보를 관리합니다.
        </p>

        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-2">사업자 등록번호</label>
              <input
                type="text"
                value={formData.bizRegNo}
                onChange={(e) => setFormData({...formData, bizRegNo: e.target.value})}
                placeholder="000-00-00000"
                className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">공급자 상호(법인명)</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">대표자 성명</label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                placeholder="대표자 이름"
                className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-2">대표 이메일 (계산서 발송용)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="이메일 입력"
                className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg disabled:bg-slate-400"
            >
              {loading ? "저장 중..." : "설정 저장하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfile;