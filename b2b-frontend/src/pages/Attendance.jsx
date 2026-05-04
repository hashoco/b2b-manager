"use client";

import React, { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";

const Attendance = () => {
  const companyCode = typeof window !== 'undefined' ? localStorage.getItem("companyCode") || "C001" : "C001";

  // --- 상태 관리 ---
  const [viewMonth, setViewMonth] = useState(dayjs().format("YYYY-MM")); 
  const [masterList, setMasterList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [appliedWage, setAppliedWage] = useState(0);
  const [rows, setRows] = useState([]);
  
  // 모달 제어
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); 
  const [formData, setFormData] = useState({ id: null, name: "", insurance: "Y", phone: "", wage: 9860, note: "", useYn: "Y" });

  // 1. 마스터 리스트 로드
  const loadMasterList = async () => {
    try {
      const res = await fetch(`/api/attendance/master-list?companyCode=${companyCode}&month=${viewMonth}`);
      const data = await res.json();
      if (data.success) {
        setMasterList(data.rows);
      }
    } catch (e) { console.error("마스터 리스트 조회 실패", e); }
  };

  useEffect(() => {
    loadMasterList();
    setSelectedId(null);
    setRows([]);
  }, [viewMonth]);

  // 2. 직원 선택 시 상세 근태 로드
  useEffect(() => {
    if (selectedId) loadAttendanceDetails(selectedId, viewMonth);
  }, [selectedId, viewMonth]);

  const loadAttendanceDetails = async (empId, month) => {
    try {
      const res = await fetch(`/api/attendance/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyCode, employeeId: empId, month })
      });
      const data = await res.json();

      if (data.success) {
        setAppliedWage(data.appliedWage);
        if (data.rows && data.rows.length > 0) {
          setRows(data.rows.map(r => ({ ...r, date: r.workDate })));
        } else {
          generateMonthData(month);
        }
      }
    } catch (e) { console.error(e); }
  };

  const generateMonthData = (targetMonth) => {
    const start = dayjs(`${targetMonth}-01`);
    const daysInMonth = start.daysInMonth();
    const newRows = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = start.date(i);
      const isSun = dateObj.day() === 0;
      const defaultIn = isSun ? "00:00" : "08:30";
      const defaultOut = isSun ? "00:00" : "12:30";
      const work = calcWorkTime(defaultIn, defaultOut);
      newRows.push({
        date: dateObj.format("YYYY-MM-DD"),
        inTime: defaultIn,
        outTime: defaultOut,
        hours: work.hours,
        minutes: work.minutes,
        workCalc: work.calc
      });
    }
    setRows(newRows);
  };

  const calcWorkTime = (inTime, outTime) => {
    if (!inTime || !outTime) return { calc: "0:00", hours: 0, minutes: 0 };
    const [inH, inM] = inTime.split(":").map(Number);
    const [outH, outM] = outTime.split(":").map(Number);
    let start = inH * 60 + inM;
    let end = outH * 60 + outM;
    if (end < start) end += 1440;
    const total = end - start;
    return {
      calc: `${Math.floor(total / 60)}시간 ${(total % 60).toString().padStart(2, "0")}분`,
      hours: Math.floor(total / 60),
      minutes: total % 60,
    };
  };

  const updateAttendanceRow = (idx, key, val) => {
    const currentRows = [...rows];
    currentRows[idx][key] = val;
    if (key === "inTime" || key === "outTime") {
      const work = calcWorkTime(currentRows[idx].inTime, currentRows[idx].outTime);
      currentRows[idx].hours = work.hours;
      currentRows[idx].minutes = work.minutes;
      currentRows[idx].workCalc = work.calc;
    }
    setRows(currentRows);
  };

  const handleArrowKey = (e, idx, field) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIdx = e.key === "ArrowUp" ? Math.max(0, idx - 1) : Math.min(rows.length - 1, idx + 1);
      document.getElementById(`time-${field}-${nextIdx}`)?.focus();
    }
  };

  const handleMasterRowClick = (id) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  // --- 버튼 이벤트 ---
  const handleAdd = () => {
    setModalMode("add");
    setFormData({ id: null, name: "", insurance: "Y", phone: "", wage: 9860, note: "", useYn: "Y" });
    setIsModalOpen(true);
  };

  const handleEdit = () => {
    if (!selectedId) return alert("수정할 직원을 선택해주세요.");
    const target = masterList.find(e => e.id === selectedId);
    setModalMode("edit");
    setFormData({ ...target });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return alert("삭제할 직원을 선택해주세요.");
    const target = masterList.find(e => e.id === selectedId);
    if (window.confirm(`${target.name}님을 삭제하시겠습니까?`)) {
      await fetch(`/api/employees/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyCode, ...target, useYn: "N" })
      });
      alert("사용안함 처리되었습니다.");
      loadMasterList();
    }
  };

  const handleSaveModal = async () => {
    if (!formData.name) return alert("성명을 입력하세요.");
    await fetch(`/api/employees/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyCode, ...formData })
    });
    setIsModalOpen(false);
    loadMasterList();
  };

  const saveAttendance = async () => {
    const res = await fetch(`/api/attendance/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyCode, employeeId: selectedId, month: viewMonth, appliedWage, rows: rows.map(r => ({ ...r, workDate: r.date })) })
    });
    if ((await res.json()).success) {
      alert("근태가 저장되었습니다.");
      loadMasterList();
    }
  };

  const { liveTotalH, liveTotalM, liveSalary } = useMemo(() => {
    const totalMinutes = rows.reduce((s, r) => s + (r.hours * 60) + (r.minutes || 0), 0);
    return {
      liveTotalH: Math.floor(totalMinutes / 60),
      liveTotalM: totalMinutes % 60,
      liveSalary: Math.floor((totalMinutes / 60) * appliedWage)
    };
  }, [rows, appliedWage]);

  return (
    <div className="relative w-full h-screen bg-slate-50 p-6 flex flex-col gap-6 overflow-hidden min-w-[1000px]">
      
      {/* 상단 헤더 & 검색바 */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter">근태/급여 통합 관리</h1>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 ml-4">
            <input 
              type="month" 
              value={viewMonth} 
              onChange={e => setViewMonth(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-slate-700 outline-none px-2 py-1"
            />
            <button onClick={loadMasterList} style={{ backgroundColor: '#1e293b', color: 'white' }} className="text-xs font-bold px-4 py-1.5 rounded-lg transition-all active:scale-95">조회</button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button onClick={handleAdd} style={{ backgroundColor: '#2563eb', color: 'white' }} className="px-5 py-2 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95">추가</button>
          <button onClick={handleEdit} style={{ backgroundColor: '#16a34a', color: 'white' }} className="px-5 py-2 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95">수정</button>
          <button onClick={handleDelete} style={{ backgroundColor: '#dc2626', color: 'white' }} className="px-5 py-2 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95">삭제</button>
        </div>
      </div>

      {/* 🚀 1, 2번 해결: 인라인 스타일로 높이를 520px로 강제 고정하고 스크롤 생성 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col shrink-0 overflow-hidden">
        <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-6">
          
          <span className="text-[11px] text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-md">행 클릭시 상세내역이 보여집니다.</span>
        </div>
        
        {/* 🚀 핵심: style 속성으로 높이를 강제하여 Tailwind 버전 이슈를 원천 차단 */}
        <div style={{ height: '340px', overflowY: 'auto' }} className="custom-scrollbar">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead className="sticky top-0 z-10">
              <tr style={{ backgroundColor: '#1e293b', color: 'white' }} className="font-bold text-xs uppercase tracking-tighter h-[45px]">
                <th className="p-3 border-r border-slate-700 text-center w-16">ID</th>
                <th className="p-3 border-r border-slate-700 text-center">성명</th>
                <th className="p-3 border-r border-slate-700 text-center w-24">사대보험</th>
                <th className="p-3 border-r border-slate-700 text-center">연락처</th>
                <th className="p-3 border-r border-slate-700 text-right">기본시급</th>
                <th className="p-3 border-r border-slate-700 text-center">근무년월</th>
                <th className="p-3 border-r border-slate-700 text-center">월총시간</th>
                <th className="p-3 border-r border-slate-700 text-right" style={{ backgroundColor: '#1e3a8a' }}>월총급여</th>
                <th className="p-3 border-r border-slate-700 text-center">비고</th>
                <th className="p-3 text-center w-20">사용</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 text-slate-700">
              {masterList.map(emp => (
                <tr 
                  key={emp.id} 
                  onClick={() => handleMasterRowClick(emp.id)}
                  style={{ height: '30px' }} // 🚀 로우 높이를 증가시켜 가독성 확보
                  className={`cursor-pointer transition-colors ${selectedId === emp.id ? 'bg-blue-50 ring-1 ring-inset ring-blue-200' : 'hover:bg-slate-50'}`}
                >
                  <td className="px-3 text-center border-r border-slate-100 font-medium text-slate-400">{emp.id}</td>
                  <td className="px-3 text-center border-r border-slate-100 font-black text-slate-800">{emp.name}</td>
                  <td className="px-3 text-center border-r border-slate-100"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${emp.insurance === 'Y' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{emp.insurance}</span></td>
                  <td className="px-3 text-center border-r border-slate-100 text-slate-500">{emp.phone}</td>
                  <td className="px-3 text-right border-r border-slate-100 font-bold">{emp.wage.toLocaleString()}원</td>
                  <td className="px-3 text-center border-r border-slate-100 font-bold text-slate-400">{viewMonth}</td>
                  <td className="px-3 text-center border-r border-slate-100"><span className="text-blue-600 font-black">{emp.totalHours}</span> h</td>
                  <td className="px-3 text-right border-r border-slate-100 font-black text-rose-600 bg-blue-50/30">{emp.totalSalary.toLocaleString()}원</td>
                  <td className="px-3 text-left border-r border-slate-100 text-xs truncate max-w-[100px]">{emp.note}</td>
                  <td className={`px-3 text-center font-bold ${emp.useYn === 'Y' ? 'text-blue-500' : 'text-rose-500'}`}>{emp.useYn}</td>
                </tr>
              ))}
              {masterList.length === 0 && (
                <tr><td colSpan="10" className="p-10 text-center text-slate-300 font-bold">등록된 직원이 없습니다. 조회 버튼을 눌러주세요.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚀 3번 해결: 같은 로우 클릭 시 닫기 (토글) 및 디테일 그리드 */}
      {selectedId && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div style={{ backgroundColor: '#1e293b', color: 'white' }} className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <h2 className="font-bold text-sm tracking-tight flex items-center gap-2">
                📅 [{masterList.find(e=>e.id===selectedId)?.name}] 상세 근태 명세
              </h2>
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-md border border-slate-600">
                <span className="text-xs text-slate-400">이번 달 적용 시급:</span>
                <input type="number" value={appliedWage} onChange={e => setAppliedWage(Number(e.target.value))} className="w-20 bg-transparent outline-none font-bold text-blue-400" />
              </div>
            </div>

            <div className="flex gap-6 text-xs font-bold items-center">
              <span>총 시간: <span className="text-blue-400 text-lg">{liveTotalH}시간 {liveTotalM}분</span></span>
              <span>지급액: <span className="text-rose-400 text-lg">{liveSalary.toLocaleString()}원</span></span>
              <button onClick={saveAttendance} style={{ backgroundColor: 'white', color: '#1e293b' }} className="px-4 py-1.5 rounded-lg font-bold transition-all active:scale-95">근태 저장</button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full border-collapse text-sm text-center">
              <thead className="sticky top-0 z-10 bg-slate-100 text-slate-500 font-bold text-[11px] uppercase border-b border-slate-200 shadow-sm">
                <tr >
                  <th className="p-3 border-r border-slate-200 w-32">일자</th>
                  <th className="p-3 border-r border-slate-200">출근시간</th>
                  <th className="p-3 border-r border-slate-200">퇴근시간</th>
                  <th className="p-3 border-r border-slate-200">근무 계산</th>
                  <th className="p-3 border-r border-slate-200 w-24">시간</th>
                  <th className="p-3 w-24">분</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, i) => {
                  const dayNum = dayjs(r.date).day();
                  const isSun = dayNum === 0;
                  const isSat = dayNum === 6;
                  return (
                    <tr key={r.date} style={{ height: '30px' }} className={`${isSun ? 'bg-rose-50/30' : isSat ? 'bg-blue-50/30' : 'bg-white'} hover:bg-slate-50`}>
                      <td className={`p-3 border-r border-slate-100 font-black ${isSun ? 'text-rose-500' : isSat ? 'text-blue-500' : 'text-slate-800'}`}>
                        {dayjs(r.date).format("MM.DD")} ({'일월화수목금토'[dayNum]})
                      </td>
                      <td className="p-1 border-r border-slate-100">
                        <div className="flex justify-center w-full">
                          <input id={`time-inTime-${i}`} type="time" value={r.inTime} onChange={e=>updateAttendanceRow(i, "inTime", e.target.value)} onKeyDown={e=>handleArrowKey(e, i, "inTime")} className="w-[110px] text-center bg-transparent font-bold outline-none text-slate-700 py-1.5 focus:bg-blue-100 rounded transition-all cursor-pointer" />
                        </div>
                      </td>
                      <td className="p-1 border-r border-slate-100">
                         <div className="flex justify-center w-full">
                          <input id={`time-outTime-${i}`} type="time" value={r.outTime} onChange={e=>updateAttendanceRow(i, "outTime", e.target.value)} onKeyDown={e=>handleArrowKey(e, i, "outTime")} className="w-[110px] text-center bg-transparent font-bold outline-none text-slate-700 py-1.5 focus:bg-blue-100 rounded transition-all cursor-pointer" />
                        </div>
                      </td>
                      <td className="p-3 border-r border-slate-100 text-slate-400 font-medium italic">{r.workCalc}</td>
                      <td className="p-3 border-r border-slate-100 font-black text-slate-800 text-base">{r.hours}</td>
                      <td className="p-3 font-black text-slate-800 text-base">{r.minutes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 모달 강제 렌더링 영역 (변화 없음) */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', width: '100%', maxWidth: '450px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="text-xl font-black">{modalMode === "add" ? "직원 신규 등록" : "직원 정보 수정"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-2xl font-bold opacity-70 hover:opacity-100">×</button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">성명</label>
                <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">사대보험</label>
                  <select value={formData.insurance} onChange={e=>setFormData({...formData, insurance:e.target.value})} className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                    <option value="Y">Y (가입)</option><option value="N">N (미가입)</option>
                  </select>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">기본 시급</label>
                  <input type="number" value={formData.wage} onChange={e=>setFormData({...formData, wage:Number(e.target.value)})} className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">연락처</label>
                <input type="text" value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">비고</label>
                <input type="text" value={formData.note} onChange={e=>setFormData({...formData, note:e.target.value})} className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3 border-t border-slate-200">
              <button onClick={() => setIsModalOpen(false)} style={{ backgroundColor: 'white', color: '#64748b' }} className="flex-1 border border-slate-200 py-3 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-sm">취소</button>
              <button onClick={handleSaveModal} style={{ backgroundColor: '#1e293b', color: 'white' }} className="flex-1 py-3 rounded-2xl font-bold shadow-lg hover:bg-black transition-all">저장하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;