import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

/* ============================
      헬퍼 함수 & 커스텀 컴포넌트
============================ */
const formatNumber = (v) => v?.toLocaleString() ?? "0";
const API_BASE_URL = process.env.REACT_APP_API_URL;
const getBadgeColor = (diff) => {
  if (diff > 0) return "text-emerald-600 bg-emerald-50 border-emerald-100";
  if (diff < 0) return "text-rose-600 bg-rose-50 border-rose-100";
  return "text-slate-600 bg-slate-50 border-slate-100";
};

// Y축 라벨이 길 경우 처리
const CustomYAxisTick = ({ x, y, payload }) => (
  <text x={x} y={y} dy={4} textAnchor="end" fill="#64748b" fontSize="12" fontWeight="500">
    {payload.value.length > 8 ? payload.value.slice(0, 8) + "…" : payload.value}
  </text>
);

const Dashboard = () => {
  /* ============================
        상태 관리 (데이터 서버 연동)
  ============================ */
  const [summary, setSummary] = useState(null);
  const [monthlySales, setMonthlySales] = useState([]);
  const [partnerPie, setPartnerPie] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      const companyCode = localStorage.getItem("companyCode");
      
      try {
        // 실제 백엔드 API 호출 (주소는 환경에 맞게 조정 가능)
        const [s, m, p] = await Promise.all([
          fetch(`${API_BASE_URL}/api/dashboard/summary?companyCode=${companyCode}`).then(r => r.json()),
          fetch(`${API_BASE_URL}/api/dashboard/monthly-sales?companyCode=${companyCode}`).then(r => r.json()),
          fetch(`${API_BASE_URL}/api/dashboard/partners?companyCode=${companyCode}`).then(r => r.json())
        ]);
        // 1. Summary는 객체이므로 그대로 설정 (백엔드 구조에 따라 s.data 등이 될 수 있음)
        setSummary(s); 

        // 2. 월별 매출이 { monthlySales: [...] } 형태라면 m.monthlySales로 추출
        setMonthlySales(Array.isArray(m) ? m : m.monthlySales || []);

        // 3. 🔵 가장 중요한 부분: p가 배열인지 확인하고, 아니라면 내부 배열(partners 등)을 추출
        // 백엔드에서 response.put("partners", ...)로 보냈다면 p.partners를 써야 합니다.
        const partnerArray = Array.isArray(p) ? p : (p.partners || []);
        setPartnerPie(partnerArray);

      } catch (err) {
        console.error("대시보드 로딩 실패", err);
        // 에러 시 빈 배열로 초기화하여 .map() 에러 방지
        setMonthlySales([]);
        setPartnerPie([]);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading || !summary) {
    return <div className="p-10 text-slate-400 font-medium">데이터 분석 중입니다...</div>;
  }

  // 전월 대비 계산
  const salesDiff = summary.thisMonthSales - summary.lastMonthSales;

  return (
    <div className="w-full min-h-screen bg-slate-50 p-6 lg:p-10">
      
      {/* 1. 상단 헤더 영역 */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">업무 지원 대시보드</h1>
        <p className="text-sm text-slate-500 mt-1">실시간 매출 통계 및 거래처 현황을 분석합니다.</p>
      </div>

      {/* 2. KPI 요약 카드 (3개 구성) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* 전월 매출 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">전월 총 매출</h3>
          <p className="text-3xl font-bold text-slate-900 mt-3">
            ₩ {formatNumber(summary.lastMonthSales)}
          </p>
          <div className={`inline-flex items-center gap-1 mt-4 px-2.5 py-1 rounded-lg border text-xs font-bold ${getBadgeColor(salesDiff)}`}>
            {salesDiff > 0 ? "▲" : "▼"} {Math.abs(summary.changeRate)}%
          </div>
        </div>

        {/* 당월 매출 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">당월 실시간 매출</h3>
          <p className="text-3xl font-bold text-slate-900 mt-3">
            ₩ {formatNumber(summary.thisMonthSales)}
          </p>
          <p className="text-xs text-slate-400 mt-4 font-medium italic">마지막 업데이트: 오늘 15:30</p>
        </div>

        {/* 거래처 수 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">활성 거래처 수</h3>
          <p className="text-3xl font-bold text-slate-900 mt-3">
            {summary.partnerCount} <span className="text-lg font-medium text-slate-400">곳</span>
          </p>
          <p className="text-xs text-blue-600 mt-4 font-bold hover:underline cursor-pointer">거래처 관리 바로가기 →</p>
        </div>
      </div>

      {/* 3. 차트 영역 (2열 구성) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 라인 차트: 월별 추이 */}
        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-800">월별 매출 추이</h2>
            <select className="text-xs bg-slate-50 border-none rounded-md px-2 py-1 text-slate-500 font-semibold focus:ring-0">
              <option>최근 6개월</option>
              <option>2024년 전체</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySales} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                formatter={(value) => [`₩${formatNumber(value)}`, '매출액']}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#3b82f6" 
                strokeWidth={4} 
                dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 바 차트: 거래처별 매출 비중 */}
        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-8">거래처별 매출 비중 (당년)</h2>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={partnerPie} 
              layout="vertical" 
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100} 
                tick={<CustomYAxisTick />} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                formatter={(value) => [`₩${formatNumber(value)}`, '누적 매출']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                {partnerPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#cbd5e1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-center gap-6">
             <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
               <span className="w-3 h-3 bg-blue-500 rounded-sm"></span> TOP 1 거래처
             </div>
             <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
               <span className="w-3 h-3 bg-slate-300 rounded-sm"></span> 기타 거래처
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;