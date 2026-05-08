"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../../utils/api'; // 🚀 공통 API 함수 임포트

const DailyWork = () => {
  const [partners, setPartners] = useState([]);
  const [yearMonth, setYearMonth] = useState(new Date().toISOString().slice(0, 7));
  const [days, setDays] = useState([]);
  const [cells, setCells] = useState([]);
  const [loading, setLoading] = useState(false);
  const companyCode = localStorage.getItem("companyCode");

  // 거래처 목록 조회
  useEffect(() => {
    apiFetch(`/api/partners/list?companyCode=${companyCode}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPartners(data.partners.filter(p => p.useYn === 'Y'));
        }
      })
      .catch(err => console.error("거래처 로드 실패:", err));
  }, [companyCode]);

  // 선택 월의 일자 배열 생성 및 데이터 조회 트리거
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearMonth, partners]);

  // 월간 배송 데이터 조회 및 그리드 셀 매핑
  const loadMonthData = async (dateList) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/daily/list-month?companyCode=${companyCode}&yearMonth=${yearMonth}`);
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

  // 셀 입력값 업데이트 (최대 6자리 숫자 제한)
  const updateCell = (partnerId, workDate, val) => {
    let onlyNumberStr = val.replace(/[^\d]/g, "");
    if (onlyNumberStr.length > 6) onlyNumberStr = onlyNumberStr.slice(0, 6);
    const qty = parseInt(onlyNumberStr) || 0;
    
    setCells(prev => prev.map(c =>
      (c.partnerId === partnerId && c.workDate === workDate) ? { ...c, qty } : c
    ));
  };

  // 방향키 이동 로직
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

  // 전체 데이터 저장
  const saveAll = async () => {
    try {
      const res = await apiFetch(`/api/daily/save-month`, {
        method: "POST",
        body: JSON.stringify({ companyCode, rows: cells })
      });
      const result = await res.json();
      if (result.success) alert("성공적으로 저장되었습니다.");
    } catch (error) {
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // 총 누적 건수 및 금액 계산
  const grandTotal = useMemo(() => cells.reduce((sum, c) => sum + (c.qty || 0), 0), [cells]);

  const getPartnerAmount = (p) => {
    const storeType = (p.storeType || p.store_type || "").trim().toUpperCase();
    const expectedAmount = p.expectedAmount || p.expected_amount || 0;
    const vatYn = (p.vatYn || p.vat_yn || "Y").trim().toUpperCase();

    let amount = 0;
    if (storeType === "MONTH" || storeType === "월별") {
      amount = expectedAmount;
    } else {
      const sumQty = cells.filter(c => c.partnerId === p.id).reduce((acc, cur) => acc + (cur.qty || 0), 0);
      amount = sumQty * expectedAmount;
    }

    if (vatYn === 'Y') amount = Math.floor(amount * 1.1); // 부가세 10% 가산
    return amount;
  };

  const grandTotalAmount = useMemo(() => {
    return partners.reduce((acc, p) => acc + getPartnerAmount(p), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partners, cells]);

  // 그리드 헤더 디자인 설정
  const getCategoryInlineStyle = (p) => {
    const storeType = (p.storeType || p.store_type || "").trim().toUpperCase();
    const vatYn = (p.vatYn || p.vat_yn || "Y").trim().toUpperCase();

    if (storeType === 'BAG' || storeType === '마대') {
      return vatYn === 'Y'
        ? { backgroundColor: '#dbeafe', color: '#1e3a8a', borderColor: '#bfdbfe' }
        : { backgroundColor: '#dcfce7', color: '#14532d', borderColor: '#bbf7d0' };
    } 
    if (storeType === 'MONTH' || storeType === '월별') {
      return vatYn === 'Y'
        ? { backgroundColor: '#fee2e2', color: '#7f1d1d', borderColor: '#fecaca' }
        : { backgroundColor: '#ffedd5', color: '#7c2d12', borderColor: '#fed7aa' };
    }
    return { backgroundColor: '#f1f5f9', color: '#1e293b', borderColor: '#e2e8f0' };
  };

  return (
    <div className="w-full h-screen bg-slate-50 py-6 px-4 flex flex-col items-center">
      <div className="w-full h-full max-w-full lg:max-w-[95%] grid grid-rows-[auto_1fr] gap-4 min-h-0 min-w-0">

        {/* 상단 컨트롤 영역 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full min-w-0">
          <div className="flex flex-col sm:flex-row items-center gap-8 border-slate-100 pr-2">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">배송 현황</h1>
              <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">
                {loading ? "데이터 불러오는 중..." : "일별 상세 배송 관리"}
              </p>
            </div>

            <div className="hidden sm:block w-px h-10 bg-slate-200"></div>
            
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 tracking-tighter">
                  {grandTotal > 0 ? grandTotal.toLocaleString() : "0"}
                </span>
                <span className="text-lg font-black text-slate-900 tracking-tighter ml-1">건</span>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">
                  {grandTotalAmount > 0 ? grandTotalAmount.toLocaleString() : "0"}
                </span>
                <span className="text-lg font-black text-slate-900 tracking-tighter ml-1">원</span>
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
              일괄 저장
            </button>
          </div>
        </div>

        {/* 메인 데이터 그리드 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm w-full grid grid-rows-[auto_1fr] overflow-hidden min-h-0 min-w-0">

          {/* 분류 색상 범례 */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-end gap-3 w-full z-30">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mr-2">매장구분</span>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-black border" style={{ backgroundColor: '#dbeafe', color: '#1e3a8a', borderColor: '#bfdbfe' }}>마대+Y</span>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-black border" style={{ backgroundColor: '#dcfce7', color: '#14532d', borderColor: '#bbf7d0' }}>마대+N</span>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-black border" style={{ backgroundColor: '#fee2e2', color: '#7f1d1d', borderColor: '#fecaca' }}>월별+Y</span>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-black border" style={{ backgroundColor: '#ffedd5', color: '#7c2d12', borderColor: '#fed7aa' }}>월별+N</span>
          </div>

          <div className="overflow-auto w-full h-full bg-white custom-scrollbar">
            <table className="w-max table-fixed border-separate border-spacing-0 text-sm">
              <colgroup>
                <col style={{ width: '100px' }} />
                {partners.map(p => (
                  <col key={`col-${p.id}`} style={{ width: '100px' }} />
                ))}
                <col style={{ width: '100px' }} />
              </colgroup>

              <thead>
                <tr>
                  {/* DATE 컬럼 (좌측 상단 고정) */}
                  <th className="p-0 m-0 border-0 sticky top-0 left-0 bg-slate-800 text-white border-b border-r border-slate-700" style={{ zIndex: 70, width: '100px', minWidth: '100px', maxWidth: '100px', height: '64px', minHeight: '64px', maxHeight: '64px' }}>
                    <div className="flex items-center justify-center font-bold text-[12px] tracking-widest uppercase box-border overflow-hidden">Date</div>
                  </th>

                  {/* 거래처 헤더 반복 */}
                  {partners.map(p => {
                    const amount = getPartnerAmount(p);
                    return (
                      <th key={`name-${p.id}`} className="p-0 m-0 border-0 sticky top-0 bg-white" style={{ zIndex: 60, width: '100px', minWidth: '100px', maxWidth: '100px', height: '64px', minHeight: '64px', maxHeight: '64px' }}>
                        <div className="flex flex-col m-0 p-0 box-border overflow-hidden">
                          <div className="flex items-center justify-center px-1 border-b border-r box-border overflow-hidden" style={{ ...getCategoryInlineStyle(p), minHeight: '32px', maxHeight: '32px' }}>
                            <span className="block w-full min-w-0 truncate font-black text-[12px] text-center" title={p.partnerName}>
                              {p.partnerName || "\u00A0"}
                            </span>
                          </div>
                          <div className="flex items-center justify-center px-1 bg-slate-50 border-b border-r border-slate-200 box-border overflow-hidden" style={{ minHeight: '32px', maxHeight: '32px' }}>
                            <span className="block w-full min-w-0 truncate text-[11px] font-bold text-slate-600 text-center tracking-tighter">
                              {amount !== undefined && amount !== null ? `${amount.toLocaleString()}원` : "\u00A0"}
                            </span>
                          </div>
                        </div>
                      </th>
                    );
                  })}

                  {/* DAILY 합계 컬럼 (우측 상단 고정) */}
                  <th className="p-0 m-0 border-0 sticky top-0 right-0 bg-slate-800 text-white border-b border-l border-slate-700" style={{ zIndex: 70, width: '100px', minWidth: '100px', maxWidth: '100px', height: '64px', minHeight: '64px', maxHeight: '64px' }}>
                    <div className="flex items-center justify-center font-bold text-[12px] tracking-widest uppercase box-border overflow-hidden">Daily</div>
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
                      
                      {/* 좌측 날짜 고정 셀 */}
                      <td className={`p-0 sticky left-0 border-b border-r border-slate-200 ${rowBg}`} style={{ zIndex: 30, width: '100px', minWidth: '100px', maxWidth: '100px', height: '44px', padding: 0 }}>
                        <div className="flex flex-col items-center justify-center box-border overflow-hidden">
                          <span className={`text-[13px] font-black ${dateColor}`}>
                            {day.slice(5).replace('-', '.')}
                          </span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 mt-0.5 rounded leading-none ${dayBadgeColor}`}>
                            {'일월화수목금토'[dayNum]}
                          </span>
                        </div>
                      </td>

                      {/* 중앙 입력 셀 반복 */}
                      {partners.map(p => {
                        const cell = cells.find(c => c.partnerId === p.id && c.workDate === day);
                        return (
                          <td key={`${p.id}-${day}`} className={`p-0 border-b border-r border-slate-200 ${rowBg}`} style={{ zIndex: 10, width: '100px', minWidth: '100px', maxWidth: '100px', height: '44px', padding: 0 }}>
                            <div className="flex items-center justify-center box-border p-0.5 overflow-hidden">
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

                      {/* 우측 일일 합계 고정 셀 */}
                      <td className={`p-0 sticky right-0 border-b border-l border-slate-200 bg-slate-50`} style={{ zIndex: 30, width: '100px', minWidth: '100px', maxWidth: '100px', height: '44px', padding: 0 }}>
                        <div className="flex items-center justify-center font-black text-slate-800 text-[14px] box-border overflow-hidden">
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