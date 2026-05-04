"use client";

import React, { useState, useEffect } from 'react';

const DailyWork = () => {
  const [partners, setPartners] = useState([]);
  const [yearMonth, setYearMonth] = useState(new Date().toISOString().slice(0, 7));
  const [days, setDays] = useState([]);
  const [cells, setCells] = useState([]);
  const [loading, setLoading] = useState(false);
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
  }, [companyCode]);

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
    
    // 넓이 100px 강제 고정
    return { 
      ...baseStyle, 
      zIndex: 40,
      width: '100px', 
      minWidth: '100px', 
      maxWidth: '100px' 
    };
  };

  return (
    // 전체 뷰포트를 채우는 배경 래퍼
    <div className="w-full h-screen bg-slate-50 py-6 px-4 flex flex-col items-center">
      
      {/* 🚀 핵심 1: CSS Grid 적용.
          grid-rows-[auto_1fr] -> 첫 번째 행(상단 컨트롤)은 내용물 높이만큼, 두 번째 행(하단 카드)은 남은 영역 전부를 강제 할당.
          min-h-0 min-w-0 -> 내부 요소가 팽창하려고 할 때 Grid 사이즈를 뚫지 못하게 하는 강력한 방어선. */}
      <div className="w-full h-full max-w-full lg:max-w-[95%] grid grid-rows-[auto_1fr] gap-4 min-h-0 min-w-0">
        
        {/* 상단 컨트롤 영역 (밀림 현상 원천 차단) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full min-w-0">
          <div className="flex flex-col sm:flex-row items-center gap-8 border-slate-100 pr-2">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">배송 현황</h1>
              <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">
                {loading ? "데이터 불러오는 중..." : "일별 상세 배송 관리"}
              </p>
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

        {/* 🚀 핵심 2: 하단 테이블 카드 (이 안에서도 Grid 적용) 
            내부 상단 범례(auto)와 하단 스크롤 테이블(1fr) 영역으로 나눔 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm w-full grid grid-rows-[auto_1fr] overflow-hidden min-h-0 min-w-0">
          
          {/* 테이블 상단 매장구분 범례 (고정) */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-end gap-3 w-full z-30">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mr-2">매장구분</span>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-black border" style={{ backgroundColor: '#dbeafe', color: '#1e3a8a', borderColor: '#bfdbfe' }}>마대+Y</span>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-black border" style={{ backgroundColor: '#dcfce7', color: '#14532d', borderColor: '#bbf7d0' }}>마대+N</span>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-black border" style={{ backgroundColor: '#fee2e2', color: '#7f1d1d', borderColor: '#fecaca' }}>월별+Y</span>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-black border" style={{ backgroundColor: '#ffedd5', color: '#7c2d12', borderColor: '#fed7aa' }}>월별+N</span>
          </div>

          {/* 🚀 스크롤 영역: Grid의 1fr (남은 공간) 안에서 100%를 차지하며, 여기서만 스크롤이 돎 */}
          <div className="overflow-auto w-full h-full bg-white custom-scrollbar" style={{ transform: 'translateZ(0)' }}>
            
            <table className="w-max table-fixed border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th 
                    className="p-0 sticky top-0 left-0 bg-slate-800 text-white shadow-[1px_0_0_0_#334155] border-b border-slate-700" 
                    style={{ zIndex: 50, width: '100px', minWidth: '100px', maxWidth: '100px' }}
                  >
                    <div className="w-full h-[50px] flex items-center justify-center font-bold text-[12px] tracking-widest uppercase box-border">
                      Date
                    </div>
                  </th>
                  
                  {partners.map(p => (
                    <th key={p.id} className="p-0 sticky top-0 border-b border-inherit" style={getCategoryInlineStyle(p)}>
                      {/* 글씨가 100px을 넘어가면 ... 처리 (truncate) */}
                      <div className="w-full h-[50px] flex items-center justify-center border-r border-inherit box-border px-2 overflow-hidden">
                        <div className="w-full truncate font-black text-[12px] text-center leading-tight" title={p.partnerName}>
                          {p.partnerName}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody className="text-slate-700 font-medium bg-white">
                {days.map(day => {
                  const dayNum = new Date(day).getDay();
                  const isSat = dayNum === 6;
                  const isSun = dayNum === 0;

                  const rowBg = isSun ? "bg-red-50/60" : isSat ? "bg-blue-50/60" : "bg-white";
                  const dateColor = isSun ? "text-red-500" : isSat ? "text-blue-500" : "text-slate-800";
                  const dayBadgeColor = isSun ? "bg-red-100 text-red-600" : isSat ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500";

                  return (
                    <tr key={day} className={`transition-colors hover:bg-slate-50`}>
                      <td 
                        className={`p-0 sticky left-0 border-b border-slate-300 shadow-[1px_0_0_0_#cbd5e1] ${rowBg}`} 
                        style={{ zIndex: 30, width: '100px', minWidth: '100px', maxWidth: '100px' }}
                      >
                        <div className={`w-full h-[44px] flex flex-col items-center justify-center box-border`}>
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
                          <td 
                            key={`${p.id}-${day}`} 
                            className={`p-0 border-b border-r border-slate-200 ${rowBg}`}
                            style={{ width: '100px', minWidth: '100px', maxWidth: '100px' }}
                          >
                            <div className="w-full h-[44px] flex items-center justify-center box-border p-0.5">
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