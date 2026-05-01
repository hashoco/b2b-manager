import React, { useState, useEffect } from 'react';

const Clients = () => {
  // === 상태 관리 ===
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);

  // 폼 입력 상태
  const [partnerCode, setPartnerCode] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [bizRegNo, setBizRegNo] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [vatYn, setVatYn] = useState("Y");
  const [payerName, setPayerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [remark, setRemark] = useState("");
  const [expectedAmount, setExpectedAmount] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [storeType, setStoreType] = useState("BAG");
  const [useYn, setUseYn] = useState("Y");

  // 검색 및 필터
  const [searchName, setSearchName] = useState("");
  const [vatFilter, setVatFilter] = useState("ALL");

  // === 1. 실제 데이터 로드 (법인코드 파라미터 적용) ===
  const loadPartners = async () => {
    setLoading(true);
    // 로그인 시 저장된 관리자의 법인코드 가져오기 (없으면 테스트용 C001)
    const companyCode = localStorage.getItem("companyCode");

    try {
      console.log(companyCode);
      // 🔵 백엔드 주소(http://localhost:8080) 명시 및 companyCode 파라미터 전송
      const res = await fetch(`http://localhost:8080/api/partners/list?companyCode=${companyCode}`);
      const data = await res.json();
      
      if (data.success) {
        setPartners(data.partners);
      } else {
        setPartners([]);
      }
    } catch (e) {
      console.error("데이터 로드 실패", e);
    } finally {
      setLoading(false);
    }
  };

  // 초기 렌더링 시 데이터 로드
  useEffect(() => {
    loadPartners();
  }, []);

  // === 헬퍼 함수 ===
  const formatComma = (value) => {
    if (!value) return "";
    return Number(value.toString().replace(/,/g, "")).toLocaleString();
  };

  const displayStoreType = (t) => {
    if (t === "BAG") return <span className="text-slate-500">일반(마대)</span>;
    if (t === "MONTH") return <span className="text-blue-600 font-medium">고정(월별)</span>;
    return "-";
  };

  // === 이벤트 핸들러 ===
  const resetForm = () => {
    setPartnerCode(""); setPartnerName(""); setBizRegNo(""); setOwnerName("");
    setVatYn("Y"); setPayerName(""); setPhone(""); setAddress(""); setRemark("");
    setExpectedAmount(""); setDeliveryFee(""); setStoreType("BAG"); setUseYn("Y");
  };

  // === 2. 저장 및 수정 로직 (법인코드 포함 & useYn 통일) ===
  const savePartner = async () => {
    if (!partnerName.trim()) return alert("거래처명(상호)을 입력해주세요.");

    // 관리자 법인코드
    const companyCode = localStorage.getItem("companyCode") || "C001";

    // 백엔드로 보낼 데이터 세팅
    const body = {
      companyCode,
      partnerCode, // 신규일 경우 빈 문자열("")이 전송되어 백엔드에서 자동 채번
      partnerName,
      bizRegNo,
      ownerName,
      vatYn,
      payerName,
      phone,
      address,
      remark,
      expectedAmount: expectedAmount ? Number(expectedAmount.toString().replace(/,/g, "")) : 0,
      deliveryFee: deliveryFee ? Number(deliveryFee.toString().replace(/,/g, "")) : 0,
      storeType,
      useYn
    };

    try {
      const res = await fetch("http://localhost:8080/api/partners/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();

      if (result.success) {
        alert(partnerCode ? "변경사항이 저장되었습니다." : "새 거래처가 등록되었습니다.");
        resetForm(); // 폼 비우기
        loadPartners(); // 목록 새로고침
      } else {
        alert("저장 실패: " + result.message);
      }
    } catch (e) {
      alert("서버 통신 에러가 발생했습니다.");
    }
  };

  // 행 클릭 시 폼에 데이터 바인딩
  const onRowClick = (p) => {
    setPartnerCode(p.partnerCode); setPartnerName(p.partnerName); setBizRegNo(p.bizRegNo ?? "");
    setOwnerName(p.ownerName ?? ""); setVatYn(p.vatYn ?? "Y"); setPayerName(p.payerName ?? "");
    setPhone(p.phone ?? ""); setAddress(p.address ?? ""); setRemark(p.remark ?? "");
    setStoreType(p.storeType ?? "BAG"); 
    setUseYn(p.useYn ?? "Y"); // 🔵 delYn 대신 서버에서 받은 useYn 사용
    setExpectedAmount(p.expectedAmount ? formatComma(p.expectedAmount) : "");
    setDeliveryFee(p.deliveryFee ? formatComma(p.deliveryFee) : "");
  };

  // === 필터 적용 ===
  const filtered = partners
    .filter(p => !searchName.trim() ? true : p.partnerName.includes(searchName))
    .filter(p => vatFilter === "ALL" ? true : p.vatYn === vatFilter);

  // 깔끔한 입력 필드 공통 스타일
  const inputStyle = "w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all";
  const labelStyle = "block text-[13px] font-semibold text-slate-600 mb-1.5";

  return (
    <div className="w-full min-h-screen bg-slate-50 p-6 lg:p-8">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">거래처 관리</h1>
          <p className="text-sm text-slate-500 mt-1">등록된 파트너사의 정보를 관리하고 새로운 거래처를 추가하세요.</p>
        </div>
        <button 
          onClick={resetForm} 
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          신규 거래처 추가
        </button>
      </div>

      {/* 2. Main Content */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* ================= 좌측: 파트너 목록 ================= */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[750px]">
          
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
            <div className="relative w-full sm:w-72">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="거래처명 검색"
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
              {['ALL', 'Y', 'N'].map(v => (
                <button 
                  key={v} 
                  onClick={() => setVatFilter(v)} 
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${vatFilter === v ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {v === 'ALL' ? '부가세 전체' : v === 'Y' ? '부가세 (Y)' : '부가세 (N)'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-400">데이터를 불러오는 중입니다...</div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 sticky top-0 border-b border-slate-200 z-10">
                  <tr>
                    <th className="px-5 py-3.5 font-medium">코드</th>
                    <th className="px-5 py-3.5 font-medium">거래처명</th>
                    <th className="px-5 py-3.5 font-medium">매장 구분</th>
                    <th className="px-5 py-3.5 font-medium text-center">부가세</th>
                    <th className="px-5 py-3.5 font-medium text-right">기본 단가</th>
                    <th className="px-5 py-3.5 font-medium text-center">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-slate-400">등록된 거래처가 없습니다.</td>
                    </tr>
                  ) : (
                    filtered.map((p) => (
                      <tr 
                        key={p.partnerCode} 
                        onClick={() => onRowClick(p)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-4 text-slate-500 font-mono text-xs">{p.partnerCode}</td>
                        <td className="px-5 py-4 font-medium text-slate-900">{p.partnerName}</td>
                        <td className="px-5 py-4">{displayStoreType(p.storeType)}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex px-2 py-1 rounded text-[11px] font-semibold ${p.vatYn === 'Y' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                            {p.vatYn}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-slate-700">{p.expectedAmount ? formatComma(p.expectedAmount) + "원" : "-"}</td>
                        <td className="px-5 py-4 text-center">
                          {/* 🔵 UI 렌더링 시에도 delYn 대신 useYn 반영 */}
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${p.useYn === 'Y' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.useYn === 'Y' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            {p.useYn === 'Y' ? '정상' : '중지'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ================= 우측: 상세 정보 입력 폼 ================= */}
        <div className="w-full xl:w-[420px] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[750px]">
          
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              {partnerCode ? '거래처 정보 수정' : '신규 거래처 입력'}
            </h2>
            {partnerCode && <span className="text-[11px] font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded">ID: {partnerCode}</span>}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">기본 정보</h3>
              <div>
                <label className={labelStyle}>거래처명 (상호) <span className="text-red-500">*</span></label>
                <input value={partnerName} onChange={(e) => setPartnerName(e.target.value)} placeholder="예: 강남 헬스장" className={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelStyle}>매장 구분</label>
                  <select value={storeType} onChange={(e) => setStoreType(e.target.value)} className={inputStyle}>
                    <option value="BAG">일반 (마대)</option>
                    <option value="MONTH">고정 (월별)</option>
                  </select>
                </div>
                <div>
                  <label className={labelStyle}>사업자 등록번호</label>
                  <input value={bizRegNo} onChange={(e) => setBizRegNo(e.target.value)} placeholder="000-00-00000" className={inputStyle} />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">연락처 및 주소</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelStyle}>대표자명</label>
                  <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="이름 입력" className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>연락처</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" className={inputStyle} />
                </div>
              </div>
              <div>
                <label className={labelStyle}>배송 주소</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="상세 주소를 입력하세요" className={inputStyle} />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">단가 및 정산 설정</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelStyle}>기본 세탁 단가</label>
                  <div className="relative">
                    <input value={expectedAmount} onChange={(e) => setExpectedAmount(formatComma(e.target.value.replace(/[^\d]/g, "")))} placeholder="0" className={`${inputStyle} text-right pr-8`} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">원</span>
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>건당 배송비</label>
                  <div className="relative">
                    <input value={deliveryFee} onChange={(e) => setDeliveryFee(formatComma(e.target.value.replace(/[^\d]/g, "")))} placeholder="0" className={`${inputStyle} text-right pr-8`} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">원</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelStyle}>부가세 적용 여부</label>
                  <select value={vatYn} onChange={(e) => setVatYn(e.target.value)} className={inputStyle}>
                    <option value="Y">적용 (Y)</option>
                    <option value="N">미적용 (N)</option>
                  </select>
                </div>
                <div>
                  <label className={labelStyle}>거래 상태</label>
                  {/* 🔵 폼 select 박스도 useYn으로 바인딩 */}
                  <select value={useYn} onChange={(e) => setUseYn(e.target.value)} className={inputStyle}>
                    <option value="Y">거래 중 (정상)</option>
                    <option value="N">거래 중지</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelStyle}>관리자 메모</label>
                <textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="거래처 관련 특이사항 메모..." className={`${inputStyle} h-20 resize-none`} />
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-slate-100 bg-slate-50/50">
            {/* 🔵 onClick 이벤트 연결 완료 */}
            <button 
              onClick={savePartner}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm"
            >
              {partnerCode ? '변경사항 저장하기' : '새 거래처 등록하기'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Clients;