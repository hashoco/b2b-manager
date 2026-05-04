"use client";

import React, { useState, useEffect, useMemo } from 'react';

const DailyWork = () => {
  const [partners, setPartners] = useState([]);
  const [yearMonth, setYearMonth] = useState(new Date().toISOString().slice(0, 7));
  const [days, setDays] = useState([]);
  const [cells, setCells] = useState([]);
  const [loading, setLoading] = useState(false);
const API_BASE_URL = process.env.REACT_APP_API_URL || "";
  const companyCode = typeof window !== 'undefined' ? localStorage.getItem("companyCode") || "C001" : "C001";

  // 1. 거래처 데이터 로드
  useEffect(() => {
    fetch(`/api/partners/list?companyCode=${companyCode}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const active = data.partners.filter(p => p.useYn === 'Y');
          setPartners(active);
        }
      })
      .catch(err => console.error("데이터 로드 실패:", err));
  }, []);

  // 2. 날짜 생성 및 데이터 매핑
  useEffect(() => {
    if (partners.length > 0) {
      const [year, month] = yearMonth.split('-').map(Number);
      const lastDay = new Date(year, month, 0).getDate();
      const dateList = Array.from({ length: lastDay }, (_, i) => 
        `${yearMonth}-${String(i + 1).padStart(2, '0')}`
      );
      setDays(dateList);
      loadMonthData(dateList);
    }
  }, [yearMonth, partners]);

  const loadMonthData = async (dateList) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/daily/list-month?companyCode=${companyCode}&yearMonth=${yearMonth}`);
      const data = await res.json();
      
      const map = new Map();
      if (data.success && data.rows) {
        data.rows.forEach(row => map.set(`${row.partnerId}_${row.workDate}`, row.qty));
      }

      const fullCells = [];
      dateList.forEach(d => {
        partners.forEach(p => {
          fullCells.push({ partnerId: p.id, workDate: d, qty: map.get(`${p.id}_${d}`) || 0 });
        });
      });
      setCells(fullCells);
    } catch (error) {
      console.error("월 데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateCell = (partnerId, workDate, val) => {
    let onlyNumberStr = val.replace(/[^\d]/g, "");
    if (onlyNumberStr.length > 6) onlyNumberStr = onlyNumberStr.slice(0, 6);
    const qty = parseInt(onlyNumberStr) || 0;
    setCells(prev => prev.map(c => 
      (c.partnerId === partnerId && c.workDate === workDate) ? { ...c, qty } : c
    ));
  };

  const handleArrowKey = (e, day, pId) => {
    const rIdx = days.indexOf(day);
    const cIdx = partners.findIndex(p => p.id === pId);
    let nR = rIdx, nC = cIdx;
    
    if (e.key === "ArrowUp") nR = Math.max(0, rIdx - 1);
    else if (e.key === "ArrowDown") nR = Math.min(days.length - 1, rIdx + 1);
    else if (e.key === "ArrowLeft") nC = Math.max(0, cIdx - 1);
    else if (e.key === "ArrowRight") nC = Math.min(partners.length - 1, cIdx + 1);
    else return;
    
    e.preventDefault();
    document.getElementById(`cell-${days[nR]}-${partners[nC].id}`)?.focus();
  };

  const saveAll = async () => {
    try {
      const res = await fetch(`/api/daily/save-month`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyCode, rows: cells })
      });
      const result = await res.json();
      if (result.success) alert("성공적으로 저장되었습니다.");
    } catch (error) {
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // 인라인 테마 + 우선순위 40층으로 하향 조정 (사이드바 침범 방지)
  const getCategoryInlineStyle = (p) => {
    const storeType = (p.storeType || p.store_type || "").trim().toUpperCase();
    const vatYn = (p.vatYn || p.vat_yn || "Y").trim().toUpperCase();
    
    let baseStyle = {};
    if (storeType === 'BAG' || storeType === '마대') {
      baseStyle = vatYn === 'Y' 
        ? { backgroundColor: '#dbeafe', color: '#1e3a8a', borderColor: '#bfdbfe' } 
        : { backgroundColor: '#dcfce7', color: '#14532d', borderColor: '#bbf7d0' }; 
    } else if (storeType === 'MONTH' || storeType === '월별') {
      baseStyle = vatYn === 'Y' 
        ? { backgroundColor: '#fee2e2', color: '#7f1d1d', borderColor: '#fecaca' } 
        : { backgroundColor: '#ffedd5', color: '#7c2d12', borderColor: '#fed7aa' }; 
    } else {
      baseStyle = { backgroundColor: '#f1f5f9', color: '#1e293b', borderColor: '#e2e8f0' };
    }
    
    return { ...baseStyle, zIndex: 40 };
  };

  const grandTotal = useMemo(() => cells.reduce((sum, c) => sum + (c.qty || 0), 0), [cells]);

  return (
    // 🚀 핵심 1: 최상위 div에 `isolate`와 `z-0`을 주어 새로운 Stacking Context(격리실) 생성!
    // 이렇게 하면 표 내부에서 어떤 z-index를 쓰든 사이드바(Navbar) 위로 절대 튀어나오지 못합니다.
    <div className="w-full h-screen bg-slate-50 py-6 px-4 flex flex-col items-center overflow-hidden relative z-0 isolate">
      
      <div className="w-full max-w-full lg:max-w-[95%] flex flex-col gap-4 h-full">
        
        {/* 상단 컨트롤 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
          <div className="flex flex-col sm:flex-row items-center gap-8 border-slate-100 pr-2">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">배송 현황</h1>
              <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">
                {loading ? "데이터 불러오는 중..." : "일별 상세 배송 관리"}
              </p>
            </div>
            
            <div className="hidden sm:block w-px h-10 bg-slate-200"></div>

            <div className="flex flex-col items-center sm:items-start">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-0.5">총합</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 tracking-tighter">
                  {grandTotal > 0 ? grandTotal.toLocaleString() : "0"}
                </span>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">건</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <input 
              type="month" 
              value={yearMonth} 
              onChange={e => setYearMonth(e.target.value)} 
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
            />
            <button 
              onClick={saveAll} 
              className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl shadow-md font-bold text-sm transition-all active:scale-95 flex items-center gap-2"
            >
              전체 저장
            </button>
          </div>
        </div>

        {/* 메인 테이블 컨테이너 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col relative">
          
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-end gap-3 shrink-0 z-30">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mr-2">매장구분</span>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-black border" style={{ backgroundColor: '#dbeafe', color: '#1e3a8a', borderColor: '#bfdbfe' }}>마대+Y</span>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-black border" style={{ backgroundColor: '#dcfce7', color: '#14532d', borderColor: '#bbf7d0' }}>마대+N</span>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-black border" style={{ backgroundColor: '#fee2e2', color: '#7f1d1d', borderColor: '#fecaca' }}>월별+Y</span>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-black border" style={{ backgroundColor: '#ffedd5', color: '#7c2d12', borderColor: '#fed7aa' }}>월별+N</span>
          </div>

          {/* 🚀 핵심 2: translateZ(0)를 주어 브라우저 GPU 렌더링을 강제 실행! (화면 크기 조절 안 해도 렌더링 완벽 방어) */}
          <div className="flex-1 overflow-auto relative custom-scrollbar bg-white" style={{ transform: 'translateZ(0)' }}>
            <table className="w-max min-w-full table-fixed border-separate border-spacing-0 text-sm">
              
              <thead>
                {/* 1행: 헤더 (교차점 50층, 중앙 40층) */}
                <tr>
                  <th className="p-0 sticky top-0 left-0 bg-slate-800 text-white shadow-[1px_0_0_0_#334155] border-b border-slate-700" style={{ zIndex: 50 }}>
                    <div className="w-[100px] h-[50px] flex items-center justify-center font-bold text-[12px] tracking-widest uppercase box-border">
                      Date
                    </div>
                  </th>
                  
                  {partners.map(p => (
                    <th key={p.id} className="p-0 sticky top-0 border-b border-inherit" style={getCategoryInlineStyle(p)}>
                      <div className="w-[85px] h-[50px] flex items-center justify-center border-r border-inherit box-border px-1">
                        <div className="truncate font-black text-[12px] text-center leading-tight">
                          {p.partnerName}
                        </div>
                      </div>
                    </th>
                  ))}
                  
                  <th className="p-0 sticky top-0 right-0 bg-slate-800 text-white shadow-[-1px_0_0_0_#334155] border-b border-slate-700" style={{ zIndex: 50 }}>
                    <div className="w-[90px] h-[50px] flex items-center justify-center font-bold text-[12px] tracking-widest uppercase box-border">
                      Daily
                    </div>
                  </th>
                </tr>

                {/* 2행: 월 합계 (교차점 50층, 중앙 40층 / top은 49px로 밀착) */}
                <tr>
                  <th className="p-0 sticky left-0 bg-blue-600 shadow-[1px_0_0_0_#cbd5e1] border-b border-slate-300" style={{ top: '39px', zIndex: 50 }}>
                    <div className="w-[100px] h-[40px] flex items-center justify-center font-black text-slate-800 text-[11px] uppercase tracking-widest box-border">
                      Monthly
                    </div>
                  </th>
                  
                  {partners.map(p => {
                    const monthlyTotal = cells.filter(c => c.partnerId === p.id).reduce((sum, c) => sum + (c.qty || 0), 0);
                    return (
                      <th key={`total-${p.id}`} className="p-0 sticky bg-slate-100 border-b border-r border-slate-300" style={{ top: '39px', zIndex: 40 }}>
                        <div className="w-[85px] h-[40px] flex items-center justify-center font-black text-blue-700 text-[13px] box-border">
                          {monthlyTotal > 0 ? monthlyTotal.toLocaleString() : "-"}
                        </div>
                      </th>
                    );
                  })}
                  
                  <th className="p-0 sticky right-0 bg-blue-600 text-white shadow-[-1px_0_0_0_#1d4ed8] border-b border-blue-700" style={{ top: '39px', zIndex: 50 }}>
                    <div className="w-[90px] h-[40px] flex items-center justify-center font-black text-[14px] box-border">
                      {grandTotal > 0 ? grandTotal.toLocaleString() : "0"}
                    </div>
                  </th>
                </tr>
              </thead>
              
              <tbody className="text-slate-700 font-medium bg-white">
                {days.map(day => {
                  const dayNum = new Date(day).getDay();
                  const isSat = dayNum === 6;
                  const isSun = dayNum === 0;
                  const dailyTotal = cells.filter(c => c.workDate === day).reduce((sum, c) => sum + (c.qty || 0), 0);

                  const rowBg = isSun ? "bg-red-50/60" : isSat ? "bg-blue-50/60" : "bg-white";
                  const dateColor = isSun ? "text-red-500" : isSat ? "text-blue-500" : "text-slate-800";
                  const dayBadgeColor = isSun ? "bg-red-100 text-red-600" : isSat ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500";

                  return (
                    <tr key={day} className={`transition-colors hover:bg-slate-50`}>
                      
                      {/* 본문 행 모서리: 30층 (위쪽의 40~50층 헤더 밑으로 자연스럽게 들어감) */}
                      <td className={`p-0 sticky left-0 border-b border-slate-300 shadow-[1px_0_0_0_#cbd5e1] ${rowBg}`} style={{ zIndex: 30 }}>
                        <div className={`w-[100px] h-[44px] flex flex-col items-center justify-center box-border`}>
                           <span className={`text-[13px] font-black ${dateColor}`}>
                            {day.slice(5).replace('-', '.')}
                          </span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 mt-0.5 rounded leading-none ${dayBadgeColor}`}>
                            {'일월화수목금토'[dayNum]}
                          </span>
                        </div>
                      </td>
                      
                      {partners.map(p => {
                        const cell = cells.find(c => c.partnerId === p.id && c.workDate === day);
                        
                        return (
                          <td key={`${p.id}-${day}`} className={`p-0 border-b border-r border-slate-200 ${rowBg}`}>
                            <div className="w-[85px] h-[44px] flex items-center justify-center box-border p-0.5">
                              <input
                                id={`cell-${day}-${p.id}`}
                                type="text"
                                value={cell?.qty > 0 ? cell.qty.toLocaleString() : ""}
                                onChange={e => updateCell(p.id, day, e.target.value)}
                                onKeyDown={e => handleArrowKey(e, day, p.id)}
                                className="w-full h-full px-1 text-center outline-none bg-transparent font-bold text-[13px] text-slate-800 placeholder:text-slate-300 focus:bg-blue-100 focus:ring-2 focus:ring-blue-500 rounded transition-colors"
                                placeholder="0"
                              />
                            </div>
                          </td>
                        );
                      })}

                      <td className="p-0 sticky right-0 bg-slate-50 border-b border-slate-300 shadow-[-1px_0_0_0_#cbd5e1]" style={{ zIndex: 30 }}>
                        <div className="w-[90px] h-[44px] flex items-center justify-center font-black text-slate-800 text-[14px] box-border">
                          {dailyTotal > 0 ? dailyTotal.toLocaleString() : "-"}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyWork;