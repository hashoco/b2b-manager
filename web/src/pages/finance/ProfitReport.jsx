"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { apiFetch } from "../../utils/api"; // 🚀 공통 API 함수 임포트

const DEFAULT_EXPENSES = [
  { id: 1, name: "월세", amount: 0 },
  { id: 2, name: "가스", amount: 0 },
  { id: 3, name: "전기", amount: 0 },
  { id: 4, name: "수도", amount: 0 },
  { id: 5, name: "주유", amount: 0 },
  { id: 6, name: "밴딩", amount: 0 },
  { id: 7, name: "인터넷잡비", amount: 0 },
  { id: 8, name: "기타", amount: 0 },
  { id: 9, name: "보험", amount: 0 },
  { id: 10, name: "식대", amount: 0 },
];

const ProfitReport = () => {
  const companyCode = localStorage.getItem("companyCode");
  const [viewMonth, setViewMonth] = useState(dayjs().format("YYYY-MM"));
  const reportRef = useRef(null);

  const [systemData, setSystemData] = useState({ sales: "", labor: "" });
  const [manualExpenses, setManualExpenses] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  // ==========================================
  // API 연동 로직
  // ==========================================

  // 1. 시스템 데이터(매출, 인건비) 동기화
  const syncSystemData = async (showMsg = false) => {
    try {
      const res = await apiFetch(`/api/profit/sync?companyCode=${companyCode}&month=${viewMonth}`);
      const data = await res.json();
      if (data.success) {
        setSystemData({ sales: data.sales, labor: data.labor });
        if (showMsg) alert(`${viewMonth} 저장된 레포트가 없어 시스템 데이터와 기본 세팅으로 불러왔습니다.`);
      }
    } catch (e) {
      console.error("동기화 실패", e);
    }
  };

  // 2. 저장된 레포트 데이터 로드
  const loadReportData = async (showMsg = false) => {
    try {
      const res = await apiFetch(`/api/profit/read?companyCode=${companyCode}&month=${viewMonth}`);
      const data = await res.json();

      if (data.success) {
        setSystemData({ sales: data.sales, labor: data.labor });
        setManualExpenses(data.manualExpenses || []);
        if (showMsg) alert(`${viewMonth} 데이터를 성공적으로 불러왔습니다.`);
      } else {
        setManualExpenses(DEFAULT_EXPENSES);
        syncSystemData(showMsg);
      }
    } catch (e) {
      console.error("조회 실패", e);
      if (showMsg) alert("데이터 조회 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    loadReportData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMonth]);

  // 3. 레포트 데이터 저장
  const handleSaveReport = async () => {
    try {
      const payload = {
        companyCode,
        month: viewMonth,
        sales: Number(systemData.sales) || 0,
        labor: Number(systemData.labor) || 0,
        netProfit,
        manualExpenses: manualExpenses.map(exp => ({
          name: exp.name,
          amount: Number(exp.amount) || 0
        }))
      };

      const res = await apiFetch(`/api/profit/save`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        alert("레포트가 성공적으로 저장되었습니다.");
        loadReportData(false); 
      }
    } catch (e) {
      console.error("저장 실패", e);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // ==========================================
  // 계산 및 이벤트 핸들러 로직
  // ==========================================
  const totalSystemData = (Number(systemData.sales) || 0) + (Number(systemData.labor) || 0);
  
  const totalManualExpense = useMemo(() => {
    return manualExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [manualExpenses]);

  const totalExpense = (Number(systemData.labor) || 0) + totalManualExpense;
  const netProfit = (Number(systemData.sales) || 0) - totalExpense;

  // 숫자만 입력 가능하도록 포맷팅
  const updateSystemData = (key, rawValue) => {
    const numericValue = rawValue.replace(/[^0-9]/g, ''); 
    setSystemData(prev => ({ ...prev, [key]: numericValue === '' ? '' : Number(numericValue) }));
  };

  const updateExpenseAmount = (id, rawValue) => {
    const numericValue = rawValue.replace(/[^0-9]/g, '');
    const val = numericValue === '' ? '' : Number(numericValue);
    setManualExpenses(prev => 
      prev.map(exp => exp.id === id ? { ...exp, amount: val } : exp)
    );
  };

  const removeExpense = (id) => {
    setManualExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  const addNewExpense = () => {
    if (!newCategoryName.trim()) return alert("항목명을 입력하세요.");
    const newId = Date.now();
    setManualExpenses([...manualExpenses, { id: newId, name: newCategoryName, amount: "" }]);
    setNewCategoryName("");
  };

  // ==========================================
  // PDF 다운로드 로직
  // ==========================================
  const downloadPDF = async () => {
    const element = reportRef.current;
    if (!element) return;

    // 스크롤 잘림 방지 (전체 영역 노출)
    const scrollAreas = element.querySelectorAll('.custom-scrollbar');
    const originalStyles = [];
    scrollAreas.forEach(area => {
      originalStyles.push({
        el: area,
        maxHeight: area.style.maxHeight,
        overflowY: area.style.overflowY
      });
      area.style.maxHeight = 'none';
      area.style.overflowY = 'visible';
    });

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          // 1. oklch 색상 에러 차단
          const styles = clonedDoc.querySelectorAll('style');
          styles.forEach(style => {
            if (style.innerHTML.includes('oklch')) {
              style.innerHTML = style.innerHTML.replace(/oklch\([^)]+\)/g, '#cbd5e1');
            }
          });

          const reportElement = clonedDoc.querySelector('.pdf-content-area');
          if (reportElement) {
            reportElement.style.backgroundColor = "#ffffff";

            // 2. input 태그 -> span 강제 변환 (글씨 깨짐 방지)
            const inputs = reportElement.querySelectorAll('input');
            inputs.forEach(input => {
              const span = clonedDoc.createElement('span');
              span.innerText = input.value || input.placeholder || '0';
              span.className = input.className;
              
              let fontColor = '#1e293b'; 
              if (input.classList.contains('text-blue-600')) fontColor = '#2563eb'; 
              if (input.classList.contains('text-rose-600')) fontColor = '#e11d48'; 
              
              span.style.color = fontColor;
              span.style.display = 'inline-block';
              span.style.backgroundColor = 'transparent';
              
              input.parentNode.replaceChild(span, input);
            });

            // 3. 주요 라벨 폰트 색상 명시적 주입
            const allElements = reportElement.querySelectorAll('*');
            allElements.forEach(el => {
              const computed = window.getComputedStyle(el);
              if (el.classList.contains('bg-slate-800')) {
                el.style.backgroundColor = '#1e293b';
                el.style.color = '#ffffff';
              } else if (el.classList.contains('text-blue-500') || el.classList.contains('text-blue-700')) {
                el.style.color = '#3b82f6';
              } else if (el.classList.contains('text-rose-500') || el.classList.contains('text-rose-700') || el.classList.contains('text-red-500')) {
                el.style.color = '#ef4444';
              } else if (el.classList.contains('text-emerald-500') || el.classList.contains('text-emerald-600')) {
                el.style.color = '#10b981';
              } else if (el.classList.contains('text-slate-700')) {
                el.style.color = '#334155';
              } else if (el.classList.contains('text-slate-800') || el.classList.contains('text-slate-900')) {
                el.style.color = '#1e293b';
              } else if (computed.color.includes('oklch') || computed.color === 'rgba(0, 0, 0, 0)') {
                el.style.color = '#1e293b';
              }
            });
          }
        }
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`월별매출레포트_${viewMonth}.pdf`);
      
    } catch (error) {
      console.error("PDF 생성 오류", error);
      alert("PDF 생성 중 오류가 발생했습니다.");
    } finally {
      // 캡처 완료 후 화면 스크롤 원상 복구
      originalStyles.forEach(({ el, maxHeight, overflowY }) => {
        el.style.maxHeight = maxHeight;
        el.style.overflowY = overflowY;
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 p-6 flex flex-col items-center overflow-auto custom-scrollbar">
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .pdf-content-area {
            --p: #3b82f6 !important;
            --s: #64748b !important;
            --an: #374151 !important;
            --b1: #ffffff !important;
          }
        }
        :root {
          --p-hex: #3b82f6;
          --s-hex: #64748b;
        }
      `}} />

      {/* 상단 컨트롤 패널 */}
      <div className="w-full flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-4 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">월별 매출 레포트</h1>
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 ml-2">
            <input 
              type="month" 
              value={viewMonth} 
              onChange={e => setViewMonth(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-700 outline-none px-2 py-0.5 cursor-pointer"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => loadReportData(true)} style={{ backgroundColor: '#1e293b', color: 'white' }} className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 hover:bg-black">
            조회
          </button>
          <button onClick={handleSaveReport} style={{ backgroundColor: '#1e293b', color: 'white' }} className="px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95">
            저장
          </button>
          <button onClick={downloadPDF} style={{ backgroundColor: '#ef4444', color: 'white' }} className="px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1">
            PDF 다운로드
          </button>
        </div>
      </div>

      {/* PDF 캡처 영역 */}
      <div ref={reportRef} className="pdf-content-area w-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col p-8 shrink-0">
        
        <div className="flex flex-col items-center mb-6 border-b-2 border-slate-800 pb-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{dayjs(viewMonth).format("YYYY년 MM월")} 영업 손익 레포트</h2>
        </div>

        <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-lg p-4 mb-8">
          <div className="flex flex-col items-center flex-1 border-r border-slate-200">
            <span className="text-[11px] font-bold text-blue-500 tracking-widest uppercase mb-1">총 매출액 (A)</span>
            <span className="text-xl font-black text-blue-700">{(Number(systemData.sales) || 0).toLocaleString()}원</span>
          </div>
          <div className="flex flex-col items-center flex-1 border-r border-slate-200">
            <span className="text-[11px] font-bold text-rose-500 tracking-widest uppercase mb-1">총 지출액 (B)</span>
            <span className="text-xl font-black text-rose-700">{totalExpense.toLocaleString()}원</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className={`text-[11px] font-bold tracking-widest uppercase mb-1 ${netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>월 순이익 (A - B)</span>
            <span className={`text-2xl font-black tracking-tighter ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {netProfit > 0 ? "+" : ""}{netProfit.toLocaleString()}원
            </span>
          </div>
        </div>

        <div className="flex gap-6 items-start">
          <div className="flex-1 flex flex-col gap-3">
            <div className="bg-slate-800 text-white font-bold px-4 py-2 rounded-t-lg flex justify-between items-center">
              <span className="text-sm">시스템 연동 항목</span>
              <span className="text-[11px] bg-blue-500 px-2 py-0.5 rounded">합계: {totalSystemData.toLocaleString()}원</span>
            </div>
            
            <div className="flex flex-col border border-slate-200 rounded-b-lg -mt-3 bg-slate-50">
              <div className="flex justify-between items-center p-3 border-b border-slate-200 hover:bg-slate-100">
                <span className="font-bold text-sm text-slate-700 flex items-center gap-2"><span className="text-blue-500 text-base">📈</span> 매출 총액</span>
                <div className="flex items-center gap-1 shrink-0">
                  <input 
                    type="text" 
                    value={systemData.sales === '' ? '' : Number(systemData.sales).toLocaleString()} 
                    onChange={(e) => updateSystemData('sales', e.target.value)}
                    placeholder="0"
                    className="text-right font-black text-blue-600 bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-blue-300 rounded px-2 py-1 w-32"
                  />
                  <span className="text-xs font-bold text-slate-400 w-4">원</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 hover:bg-slate-100">
                <span className="font-bold text-sm text-slate-700 flex items-center gap-2"><span className="text-rose-500 text-base">👨‍🔧</span> 인건비 총액</span>
                <div className="flex items-center gap-1 shrink-0">
                  <input 
                    type="text" 
                    value={systemData.labor === '' ? '' : Number(systemData.labor).toLocaleString()} 
                    onChange={(e) => updateSystemData('labor', e.target.value)}
                    placeholder="0"
                    className="text-right font-black text-rose-600 bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-rose-300 rounded px-2 py-1 w-32"
                  />
                  <span className="text-xs font-bold text-slate-400 w-4">원</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-3">
             <div className="bg-slate-800 text-white font-bold px-4 py-2 rounded-t-lg flex justify-between items-center">
              <span className="text-sm">직접 지출 비용 내역</span>
              <span className="text-[11px] bg-rose-500 px-2 py-0.5 rounded">합계: {totalManualExpense.toLocaleString()}원</span>
            </div>

            <div className="flex flex-col border border-slate-200 rounded-b-lg -mt-3 bg-white">
              <div style={{ maxHeight: '550px', overflowY: 'auto' }} className="custom-scrollbar flex flex-col">
                {manualExpenses.length === 0 && (
                   <div className="p-8 text-center text-sm font-bold text-slate-300">
                     등록된 지출 항목이 없습니다. 하단에서 추가해주세요.
                   </div>
                )}
                {manualExpenses.map((exp) => (
                  <div key={exp.id} className="flex justify-between items-center py-4 px-3 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <span className="font-bold text-base text-slate-700 pl-2 flex-1 truncate">{exp.name}</span>
                    <div className="flex items-center gap-2 shrink-0 justify-end bg-transparent">
                      <input 
                        type="text" 
                        value={exp.amount === '' ? '' : Number(exp.amount).toLocaleString()} 
                        onChange={(e) => updateExpenseAmount(exp.id, e.target.value)}
                        placeholder="0"
                        className="text-right font-black text-slate-800 bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-2 py-1.5 w-36 text-base"
                      />
                      <span className="text-sm font-bold text-slate-400 w-4">원</span>
                      <button 
                        onClick={() => removeExpense(exp.id)} 
                        data-html2canvas-ignore 
                        className="text-slate-400 hover:text-red-500 ml-2 transition-colors text-sm font-bold px-1 shrink-0"
                        title="항목 삭제"
                      >
                        ✖ 삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div data-html2canvas-ignore className="p-2.5 bg-slate-50 flex gap-2 border-t border-slate-200 rounded-b-lg shrink-0">
                <input 
                  type="text" 
                  placeholder="새 항목명 (예: 영업비)" 
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3 py-1 text-xs font-bold border border-slate-300 rounded outline-none focus:border-blue-500"
                />
                <button onClick={addNewExpense} className="bg-slate-800 text-white px-3 text-xs font-bold rounded hover:bg-slate-900 transition-colors">추가</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-10 shrink-0"></div>
    </div>
  );
};

export default ProfitReport;