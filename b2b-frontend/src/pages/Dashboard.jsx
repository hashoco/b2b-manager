import React from 'react';

const Dashboard = () => {
  return (
    // 전체 컨텐츠 영역 설정 (최대 너비 고정, 중앙 정렬)
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 상단 타이틀 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">대시보드</h1>
        <p className="text-slate-500 mt-1">오늘의 비즈니스 현황을 한눈에 파악하세요.</p>
      </div>

      {/* 요약 카드 영역 (상단 3개 배치) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-32 flex items-center justify-center text-slate-400">
          신규 수거 요청 영역
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-32 flex items-center justify-center text-slate-400">
          세탁 진행 중 영역
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-32 flex items-center justify-center text-slate-400">
          이번 달 누적 매출 영역
        </div>
      </div>

      {/* 메인 리스트 영역 (하단 넓은 박스) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-96 flex items-center justify-center text-slate-400">
        거래처별 상세 현황 테이블 (여기에 표가 들어갈 예정입니다)
      </div>

    </div>
  );
};

export default Dashboard;