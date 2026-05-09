import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../utils/api'; 
import dayjs from "dayjs";

/* ============================
      헬퍼 함수 & 커스텀 컴포넌트
============================ */
const formatNumber = (v) => v?.toLocaleString() ?? "0";

const getBadgeColor = (diff) => {
  if (diff > 0) return "text-emerald-600 bg-emerald-50 border-emerald-100";
  if (diff < 0) return "text-rose-600 bg-rose-50 border-rose-100";
  return "text-slate-600 bg-slate-50 border-slate-100";
};

const CustomYAxisTick = ({ x, y, payload }) => (
  <text x={x} y={y} dy={4} textAnchor="end" fill="#64748b" fontSize="11" fontWeight="500">
    {payload.value && payload.value.length > 6 ? payload.value.slice(0, 6) + "…" : payload.value}
  </text>
);

const Dashboard = () => {
  /* ============================
        상태 관리 (데이터 서버 연동)
  ============================ */
  const [summary, setSummary] = useState(null);
  const [monthlySales, setMonthlySales] = useState([]);
  const [partnerSales, setPartnerSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   async function loadDashboardData() {
      const companyCode = localStorage.getItem("companyCode");
      
      try {
        const [s, m, p] = await Promise.all([
          apiFetch(`/api/dashboard/summary?companyCode=${companyCode}`).then(r => r.json()),
          apiFetch(`/api/dashboard/monthly-sales?companyCode=${companyCode}`).then(r => r.json()),
          apiFetch(`/api/dashboard/partners?companyCode=${companyCode}`).then(r => r.json())
        ]);

        setSummary(s); 

        // 2. 월별 매출 배열 추출 (기존 로직)
        const rawMonthlyData = m?.monthlySales || m;
        const validMonthlyData = Array.isArray(rawMonthlyData) ? rawMonthlyData : [];

        const filledMonthlyData = [];
        const today = new Date(dayjs().format("YYYY-MM-DD")); 
        today.setMonth(today.getMonth() - 1); // 지난달을 마지막으로 설정
        
        for (let i = 11; i >= 0; i--) {
            const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
            const existingData = validMonthlyData.find(item => item.month === monthStr);
            
            filledMonthlyData.push({
                month: monthStr,
                amount: existingData ? existingData.amount : 0 // 데이터가 없으면 0원
            });
        }
        
        // 가공된 12개월치 데이터를 세팅
        setMonthlySales(filledMonthlyData);

        // 3. 파트너 매출 배열 추출 및 세팅 (map 에러 완벽 차단)
        const partnerData = p?.partners || p;
        setPartnerSales(Array.isArray(partnerData) ? partnerData : []);

      } catch (err) {
        console.error("대시보드 데이터 로딩 실패:", err);
        // 에러 시 무조건 빈 배열로 초기화하여 화면 붕괴 방지
        setMonthlySales([]);
        setPartnerSales([]);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-slate-400 font-bold animate-pulse">데이터를 정산 중입니다...</div>
      </div>
    );
  }
const data = summary || { thisMonthSales: 0, lastMonthSales: 0, changeRate: 0, partnerCount: 0 };
  
  const changeRateValue = Number(data.changeRate) || 0;
  const isPositiveGrowth = changeRateValue >= 0;

  // 렌더링 시 map() 에러를 방지하는 2중 안전 장치 변수
  const safeMonthlySales = Array.isArray(monthlySales) ? monthlySales : [];
  const safePartnerSales = Array.isArray(partnerSales) ? partnerSales : [];

  return (
    <div className="w-full min-h-screen bg-slate-50 p-6 lg:p-10 text-slate-800">
      
      {/* 1. 상단 헤더 */}
      <div className="mb-10 flex justify-between items-end">
        <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">대시보드</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">매출 통계 및 거래처별 현황</p>
        </div>
      </div>

      {/* 2. KPI 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* 전월 매출 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-hover hover:shadow-md">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">전월 총 매출액</h3>
          <p className="text-3xl font-black text-slate-900 mt-2">
            ₩ {formatNumber(data.lastMonthSales)}
          </p>
          {/* 🚀 수정된 로직 적용: 증감률(changeRate) 자체를 기준으로 색상과 기호 결정 */}
          <div className={`inline-flex items-center gap-1 mt-4 px-2 py-0.5 rounded border text-[11px] font-black ${getBadgeColor(changeRateValue)}`}>
            {isPositiveGrowth ? "▲" : "▼"} {Math.abs(changeRateValue)}%
          </div>
        </div>

        {/* 전월 총 근무시간 */}
     {/* 직원 수 현황 (기존 근태 관리 카드 대체) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-hover hover:shadow-md">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">직원 수 현황</h3>
          <p className="text-3xl font-black text-slate-900 mt-2">
            {data.employeeCount || 0} <span className="text-base font-bold text-slate-400">명</span>
          </p>
          <Link 
            to="/attendance" 
            className="text-[11px] text-blue-600 mt-4 font-bold cursor-pointer hover:text-blue-800 block w-fit"
          >
            근태 관리 이동 →
          </Link>
        </div>

        {/* 활성 거래처 수 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-hover hover:shadow-md">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">거래처 현황</h3>
          <p className="text-3xl font-black text-slate-900 mt-2">
            {data.partnerCount} <span className="text-base font-bold text-slate-400">곳</span>
          </p>
          <Link 
            to="/clients" 
            className="text-[11px] text-blue-600 mt-4 font-bold cursor-pointer hover:text-blue-800 block w-fit"
          >
            거래처 관리 이동 →
          </Link>
        </div>
      </div>

      {/* 3. 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 라인 차트: 매출 추이 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-w-0">
          <h2 className="text-lg font-black text-slate-800 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
            월별 매출 성장 추이
          </h2>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={safeMonthlySales}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                formatter={(value) => [`₩${formatNumber(value)}`, '매출']}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#2563eb" 
                strokeWidth={4} 
                dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 바 차트: 거래처별 매출 비중 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-w-0">
          <h2 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-slate-800 rounded-full"></span>
            거래처별 매출 기여도 (TOP 10)
          </h2>
          
          <ResponsiveContainer width="100%" height={200}>
            <BarChart 
              data={safePartnerSales} 
              layout="vertical" 
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={80} 
                tick={<CustomYAxisTick />} 
                axisLine={false} 
                tickLine={false} 
                interval={0}
              />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                formatter={(value) => [`₩${formatNumber(value)}`, '누적 매출']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                {safePartnerSales.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#2563eb' : '#e2e8f0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;