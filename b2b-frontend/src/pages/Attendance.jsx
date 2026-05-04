import React, { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";

const Attendance = () => {
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"));
  const [rows, setRows] = useState([]);
  const [loadMessage, setLoadMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const companyCode = localStorage.getItem("companyCode");

  useEffect(() => {
    fetchMonthData(month);
  }, [month]);
const fetchMonthData = async (targetMonth) => {
    try {
      const res = await fetch(`/api/attendance/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyCode, month: targetMonth }),
      });
      const data = await res.json();

      if (data.success && data.rows && data.rows.length > 0) {
        setLoadMessage("저장된 근태 데이터를 불러왔습니다.");
        
        // 🔥 핵심 수정: DB에서 온 workDate를 리액트에서 사용하는 date 키로 맞춰줌
        const mappedRows = data.rows.map(row => ({
          ...row,
          date: row.workDate || row.date // 백엔드의 workDate를 date로 매핑
        }));
        
        setRows(mappedRows);
      } else {
        setLoadMessage("이번 달 신규 근태 시트를 생성했습니다.");
        generateMonthData(targetMonth);
      }
    } catch (error) {
      console.error("조회 에러:", error);
      setLoadMessage("서버 통신에 실패하여 오프라인 모드로 생성합니다.");
      generateMonthData(targetMonth);
    }
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
        workCalc: work.calc,
        hours: work.hours,
        minutes: work.minutes,
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
    if (end < start) end += 24 * 60;
    const total = end - start;
    return {
      calc: `${Math.floor(total / 60)}시간 ${(total % 60).toString().padStart(2, "0")}분`,
      hours: Math.floor(total / 60),
      minutes: total % 60,
    };
  };

  const updateRow = (index, key, value) => {
    setRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      if (key === "inTime" || key === "outTime") {
        const work = calcWorkTime(updated[index].inTime, updated[index].outTime);
        updated[index].workCalc = work.calc;
        updated[index].hours = work.hours;
        updated[index].minutes = work.minutes;
      }
      return updated;
    });
  };

  const handleArrowKey = (e, idx, field) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIdx = e.key === "ArrowUp" ? Math.max(0, idx - 1) : Math.min(rows.length - 1, idx + 1);
      document.getElementById(`time-${field}-${nextIdx}`)?.focus();
    }
  };

  const saveData = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/attendance/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyCode, month, rows }),
      });
      const result = await res.json();
      if (result.success) {
        alert("성공적으로 저장되었습니다.");
        fetchMonthData(month);
      } else {
        alert("저장에 실패했습니다.");
      }
    } catch (error) {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const { totalH, totalM } = useMemo(() => {
    const h = rows.reduce((s, r) => s + (r.hours || 0), 0);
    const m = rows.reduce((s, r) => s + (r.minutes || 0), 0);
    return { totalH: h + Math.floor(m / 60), totalM: m % 60 };
  }, [rows]);

  return (
    <div className="w-full h-screen bg-slate-50 py-6 px-4 flex flex-col items-center overflow-hidden">
      
      <div className="w-full max-w-5xl flex flex-col gap-4 h-full">
        
        {/* 상단 헤더 & 컨트롤 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">월별 근태 관리</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">{loadMessage}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <input 
              type="month" 
              value={month} 
              onChange={(e) => setMonth(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
            />
            <button 
              onClick={saveData} 
              disabled={isSaving}
              className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl shadow-md font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? "저장 중..." : "근태 저장"}
            </button>
          </div>
        </div>

        {/* 메인 테이블 컨테이너 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
          
          {/* Total Work Time (테이블 상단 부착) */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-end gap-6 shrink-0 z-30">
            <span className="text-slate-500 font-bold tracking-widest text-[11px] uppercase">Total Work Time</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800 tracking-tighter">{totalH}</span>
              <span className="text-sm font-bold text-slate-500 mr-2">시간</span>
              <span className="text-3xl font-black text-slate-800 tracking-tighter">{totalM}</span>
              <span className="text-sm font-bold text-slate-500">분</span>
            </div>
          </div>

          {/* 테이블 내부 스크롤 영역 */}
          <div className="flex-1 overflow-auto relative">
            <table className="w-full text-sm text-left whitespace-nowrap border-separate border-spacing-0">
              
              {/* 테이블 헤더 */}
              <thead className="text-slate-500 text-xs uppercase tracking-wider font-semibold sticky top-0 z-20 shadow-[0_1px_0_0_#e2e8f0]">
                <tr>
                  <th className="bg-slate-50 px-6 py-4 text-center">일자</th>
                  <th className="bg-slate-50 px-6 py-4 text-center">출근 시간</th>
                  <th className="bg-slate-50 px-6 py-4 text-center">퇴근 시간</th>
                  <th className="bg-slate-50 px-6 py-4 text-center">근무 계산</th>
                  <th className="bg-slate-50 px-6 py-4 text-center">시간</th>
                  <th className="bg-slate-50 px-6 py-4 text-center">분</th>
                </tr>
              </thead>
              
              {/* 테이블 바디 */}
              <tbody className="text-slate-700 font-medium">
                {rows.map((r, i) => {
                  const dayNum = dayjs(r.date).day();
                  const isSat = dayNum === 6;
                  const isSun = dayNum === 0;
                  
                  // ✨ 수정: 투명도(/) 문법 제거하여 안전한 색상 사용 (검은줄 방지)
                  const rowBg = isSun ? "bg-red-50" : isSat ? "bg-blue-50" : "bg-white hover:bg-slate-50";
                  const dateColor = isSun ? "text-red-500" : isSat ? "text-blue-500" : "text-slate-700";

                  return (
                    <tr key={r.date} className={`transition-colors ${rowBg}`}>
                      
                      {/* 일자 */}
                      <td className="px-6 py-3 text-center border-b border-slate-200">
                        <span className={`font-bold ${dateColor}`}>
                          {dayjs(r.date).format("MM/DD")}
                        </span>
                        <span className={`ml-1 text-xs ${dateColor} opacity-70`}>
                          ({'일월화수목금토'[dayNum]})
                        </span>
                      </td>

                      {/* 출근 입력 */}
                      <td className="px-6 py-3 border-b border-slate-200">
                        <div className="flex justify-center">
                          <input 
                            id={`time-inTime-${i}`}
                            type="time" 
                            value={r.inTime}
                            onChange={e => updateRow(i, "inTime", e.target.value)}
                            onKeyDown={e => handleArrowKey(e, i, "inTime")}
                            className="w-[120px] bg-white border border-slate-200 text-slate-700 text-center rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all font-semibold shadow-sm hover:border-slate-300"
                          />
                        </div>
                      </td>

                      {/* 퇴근 입력 */}
                      <td className="px-6 py-3 border-b border-slate-200">
                        <div className="flex justify-center">
                          <input 
                            id={`time-outTime-${i}`}
                            type="time" 
                            value={r.outTime}
                            onChange={e => updateRow(i, "outTime", e.target.value)}
                            onKeyDown={e => handleArrowKey(e, i, "outTime")}
                            className="w-[120px] bg-white border border-slate-200 text-slate-700 text-center rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all font-semibold shadow-sm hover:border-slate-300"
                          />
                        </div>
                      </td>

                      {/* 자동 계산 영역 */}
                      <td className="px-6 py-3 text-center text-slate-400 font-medium border-b border-slate-200">
                        {r.workCalc}
                      </td>
                      <td className="px-6 py-3 text-center text-slate-800 font-bold text-base border-b border-slate-200">
                        {r.hours}
                      </td>
                      <td className="px-6 py-3 text-center text-slate-800 font-bold text-base border-b border-slate-200">
                        {r.minutes}
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

export default Attendance;