"use client";

import React, { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { apiFetch } from "../../utils/api";

const TaxInvoice = () => {
  const companyCode = localStorage.getItem("companyCode") || "C001";

  // 상태 관리
  const [month, setMonth] = useState(dayjs().subtract(1, "month").format("YYYY-MM"));
  const [list, setList] = useState([]);
  const [vatFilter, setVatFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);
  
  // ✅ 공급자(우리 회사) 정보 상태 추가
  const [providerInfo, setProviderInfo] = useState(null);

  const sysdate = dayjs().format("YYYY-MM-DD");

  // ✅ 1. 화면 로드 시 공급자(사업자) 정보 불러오기
  useEffect(() => {
    const fetchProviderInfo = async () => {
      try {
        const res = await apiFetch(`/api/settings/company?companyCode=${companyCode}`);
        const data = await res.json();
        if (data.success && data.profile) {
          setProviderInfo(data.profile);
        }
      } catch (err) {
        console.error("공급자 정보 로드 실패:", err);
      }
    };
    fetchProviderInfo();
  }, [companyCode]);

  // 데이터 조회
  const loadData = async () => {
    if (!month) return alert("월을 선택하세요.");
    setIsLoading(true);

    const startDate = dayjs(month).startOf("month").format("YYYY-MM-DD");
    const endDate = dayjs(month).endOf("month").format("YYYY-MM-DD");

    try {
      const res = await apiFetch(`/api/tax/list`, { 
        method: "POST",
        body: JSON.stringify({ companyCode, startDate, endDate }),
      });
      const data = await res.json();

      if (data.list) {
        // 숫자 시작명 우선 정렬 (한글 오름차순)
        const sorted = data.list.sort((a, b) => {
          const aIsNum = /^[0-9]/.test(a.partnerName);
          const bIsNum = /^[0-9]/.test(b.partnerName);
          if (aIsNum && !bIsNum) return -1;
          if (!aIsNum && bIsNum) return 1;
          return a.partnerName.localeCompare(b.partnerName, "ko");
        });
        setList(sorted);
      } else {
        setList([]);
      }
    } catch (error) {
      console.error("조회 중 에러 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 부가세 필터링
  const filteredList = useMemo(() => {
    return list.filter(row => vatFilter === "ALL" || row.vatYn === vatFilter);
  }, [list, vatFilter]);

  // 엑셀 다운로드 (국세청 양식 맞춤)
  const downloadExcel = () => {
    if (filteredList.length === 0) return alert("데이터가 없습니다.");
    
    // ✅ 방어 로직: 사업자 정보가 없으면 엑셀 생성 중단
    if (!providerInfo || !providerInfo.bizRegNo) {
      return alert("사업자 정보가 등록되지 않았습니다.\n[사업자 정보 관리] 메뉴에서 정보를 먼저 저장해주세요.");
    }

    // ✅ 2. 하드코딩 제거 및 providerInfo 동적 데이터 매핑
    const excelData = filteredList.map(row => ({
      "전자(세금계산서) 등록 종류": "01",
      "작성일자": sysdate,
      "공급자등록번호": (providerInfo.bizRegNo || "").replace(/-/g, ""), // 하이픈 제거
      "공급자상호": providerInfo.companyName,
      "공급자성명": providerInfo.ownerName,
      "공급자 이메일": providerInfo.email,
      "공급받는자 등록번호": (row.bizRegNo || "").replace(/-/g, ""),
      "공급받는자상호": row.partnerName,
      "공급받는자 성명": row.ownerName,
      "공급가액 합계": row.totalAmount,
      "세액합계": row.taxAmount,
      "일자1": sysdate,
      "공급가액1": row.totalAmount,
      "세액1": row.taxAmount,
      "영수(01)청구(02)": "02"
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "세금계산서");
    
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer]), `TaxInvoice_${month}.xlsx`);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800">
      <div className="max-w-6xl mx-auto space-y-4">
        
      <h1 className="text-2xl font-bold text-slate-800 tracking-tight">세금계산서 발행 현황</h1>
        {/* 상단 검색바 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-6">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">조회 월</span>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">부가세 구분</span>
            <div className="flex gap-3 text-sm">
              {['ALL', 'Y', 'N'].map(v => (
                <label key={v} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="vatFilter"
                    value={v}
                    checked={vatFilter === v}
                    onChange={(e) => setVatFilter(e.target.value)}
                  /> {v === 'ALL' ? '전체' : v}
                </label>
              ))}
            </div>
          </div>

          <div className="ml-auto flex gap-2">
            <button onClick={loadData} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-900">
              {isLoading ? "조회 중..." : "조회"}
            </button>
            <button onClick={downloadExcel} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">
              엑셀 다운로드
            </button>
          </div>
        </div>

        {/* 테이블 영역 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="px-4 py-3">거래처명</th>
                <th className="px-4 py-3">사업자번호</th>
                <th className="px-4 py-3">대표자</th>
                <th className="px-4 py-3 text-right">공급가액</th>
                <th className="px-4 py-3 text-right">세액</th>
                <th className="px-4 py-3 text-center">부가세</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold">{row.partnerName}</td>
                  <td className="px-4 py-3 text-slate-500">{row.bizRegNo}</td>
                  <td className="px-4 py-3">{row.ownerName}</td>
                  <td className="px-4 py-3 text-right font-bold">{(row.totalAmount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-blue-600 font-bold">{(row.taxAmount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-black ${row.vatYn === 'Y' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {row.vatYn}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredList.length === 0 && <p className="text-center py-10 text-slate-400">데이터가 없습니다.</p>}
        </div>
      </div>
    </div>
  );
};

export default TaxInvoice;