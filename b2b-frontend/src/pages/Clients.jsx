"use client";

import React, { useEffect, useState } from "react";

export default function Clients() {
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
  

  // 데이터 로드
  const loadPartners = async () => {
    const companyCode = localStorage.getItem("companyCode") || "C001";
    
    setLoading(true);
    try {
      const res = await fetch(`/api/partners/list?companyCode=${companyCode}`);
      const data = await res.json();
      
      if (data.success && data.partners) {
        const sorted = data.partners.sort((a, b) => {
          const aIsNum = /^[0-9]/.test(a.partnerName);
          const bIsNum = /^[0-9]/.test(b.partnerName);
          if (aIsNum && !bIsNum) return -1;
          if (!aIsNum && bIsNum) return 1;
          return a.partnerName.localeCompare(b.partnerName, "ko");
        });
        setPartners(sorted);
      } else {
        setPartners([]);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const formatComma = (value) => {
    if (!value) return "";
    return Number(value.toString().replace(/,/g, "")).toLocaleString();
  };

  const handleAmountChange = (value) => {
    const onlyNumber = value.replace(/[^\d]/g, "");
    setExpectedAmount(formatComma(onlyNumber));
  };

  const handleDeliveryFeeChange = (value) => {
    const onlyNumber = value.replace(/[^\d]/g, "");
    setDeliveryFee(formatComma(onlyNumber));
  };

  const displayStoreType = (t) => {
    if (t === "BAG") return "일반(마대)";
    if (t === "MONTH") return "고정(월별)";
    return "-";
  };

  const resetForm = () => {
    setPartnerCode("");
    setPartnerName("");
    setBizRegNo("");
    setOwnerName("");
    setVatYn("Y");
    setPayerName("");
    setPhone("");
    setAddress("");
    setRemark("");
    setExpectedAmount("");
    setDeliveryFee("");
    setStoreType("BAG");
    setUseYn("Y");
  };

  const savePartner = async () => {
    const companyCode = localStorage.getItem("companyCode") || "C001";
    
    const body = {
      companyCode,
      partnerCode: partnerCode.trim(),
      partnerName,
      bizRegNo,
      ownerName,
      vatYn,
      payerName,
      phone,
      address,
      remark,
      expectedAmount: expectedAmount.replace(/,/g, ""),
      deliveryFee: deliveryFee.replace(/,/g, ""),
      storeType,
      useYn
    };

    try {
      const res = await fetch(`/api/partners/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();

      if (result.success) {
        alert("저장되었습니다.");
        resetForm();
        loadPartners();
      } else {
        alert("저장 실패: " + (result.message || "서버 오류"));
      }
    } catch (error) {
      console.error(error);
      alert("통신 오류가 발생했습니다.");
    }
  };

  const onRowClick = (p) => {
    setPartnerCode(p.partnerCode);
    setPartnerName(p.partnerName);
    setBizRegNo(p.bizRegNo ?? "");
    setOwnerName(p.ownerName ?? "");
    setVatYn(p.vatYn ?? "Y");
    setPayerName(p.payerName ?? "");
    setPhone(p.phone ?? "");
    setAddress(p.address ?? "");
    setRemark(p.remark ?? "");
    setStoreType(p.storeType ?? "BAG");
    setUseYn(p.useYn ?? "Y");
    setExpectedAmount(p.expectedAmount ? formatComma(p.expectedAmount) : "");
    setDeliveryFee(p.deliveryFee ? formatComma(p.deliveryFee) : "");
  };

  const filtered = partners
    .filter((p) => (!searchName.trim() ? true : p.partnerName.includes(searchName)))
    .filter((p) => (vatFilter === "ALL" ? true : p.vatYn === vatFilter));

  const inputStyle = "w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all";
  const labelStyle = "block text-[13px] font-semibold text-slate-600 mb-1.5";

  return (
    // 부모 컨테이너에 overflow-x-auto를 주어 화면이 작아지면 가로 스크롤이 생기도록 함
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 overflow-x-auto">
      {/* 화면 전체 최소 너비 강제 고정 */}
      <div className="min-w-[1000px]">
        
        {/* 헤더 영역 */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">거래처 관리</h1>
            <p className="text-sm text-slate-500 mt-1">등록된 거래처 정보를 조회하고 수정할 수 있습니다.</p>
          </div>
          <button
            onClick={resetForm}
            className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors"
          >
            + 신규 등록
          </button>
        </div>

        <div className="flex flex-row gap-6 items-start w-full h-full">
          
          {/* ================= 좌측: 거래처 목록 영역 ================= */}
          <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-[780px] overflow-hidden min-w-[600px]">
            {/* 필터 바 */}
            <div className="p-4 border-b border-slate-100 flex gap-3 items-center justify-between bg-white shrink-0">
              <input
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="거래처명 검색"
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <div className="flex items-center gap-3 text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-600 mr-1">부가세</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="vat" value="ALL" checked={vatFilter === "ALL"} onChange={(e) => setVatFilter(e.target.value)} className="accent-blue-600" /> 전체
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="vat" value="Y" checked={vatFilter === "Y"} onChange={(e) => setVatFilter(e.target.value)} className="accent-blue-600" /> Y
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="vat" value="N" checked={vatFilter === "N"} onChange={(e) => setVatFilter(e.target.value)} className="accent-blue-600" /> N
                </label>
              </div>
            </div>

            {/* 테이블 */}
            <div className="overflow-auto flex-1 bg-white relative">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 border-b border-slate-200 z-10 shadow-sm">
                  <tr>
                    <th className="p-3 pl-4">코드</th>
                    <th className="p-3">거래처명</th>
                    <th className="p-3">사업자번호</th>
                    <th className="p-3">매장구분</th>
                    <th className="p-3 text-center">부가세</th>
                    <th className="p-3 text-right">단가</th>
                    <th className="p-3 text-right pr-4">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && (
                    <tr><td colSpan="7" className="p-4 text-center text-slate-400">데이터를 불러오는 중입니다...</td></tr>
                  )}
                  {!loading && filtered.length === 0 && (
                    <tr><td colSpan="7" className="p-4 text-center text-slate-400">조회된 거래처가 없습니다.</td></tr>
                  )}
                  {filtered.map((p) => (
                    <tr
                      key={p.partnerCode}
                      onClick={() => onRowClick(p)}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors text-slate-700"
                    >
                      <td className="p-3 pl-4 font-medium text-slate-900">{p.partnerCode}</td>
                      <td className="p-3">{p.partnerName}</td>
                      <td className="p-3 text-slate-500">{p.bizRegNo || "-"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${p.storeType === "BAG" ? "bg-slate-100 text-slate-600" : "bg-blue-100 text-blue-700"}`}>
                          {displayStoreType(p.storeType)}
                        </span>
                      </td>
                      <td className="p-3 text-center">{p.vatYn}</td>
                      <td className="p-3 text-right">{p.expectedAmount ? Number(p.expectedAmount).toLocaleString() : "-"}</td>
                      <td className="p-3 text-right pr-4">
                        <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${p.useYn === "Y" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {p.useYn === "Y" ? "사용중" : "중지"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================= 우측: 입력 폼 영역 ================= */}
          {/* 강제로 350px 고정하고 절대 줄어들지 않도록(shrink-0) 설정 */}
          <div className="w-[350px] shrink-0 bg-white border border-slate-200 rounded-xl shadow-sm p-5 h-[780px] flex flex-col overflow-y-auto">
            <div className="flex-1 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelStyle}>매장 구분</label>
                    <select value={storeType} onChange={(e) => setStoreType(e.target.value)} className={inputStyle}>
                      <option value="BAG">마대</option>
                      <option value="MONTH">월별</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>거래처 코드</label>
                    <input value={partnerCode} disabled placeholder="자동발급" className={`${inputStyle} bg-slate-100 text-slate-400 cursor-not-allowed`} />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-800">기본 정보</h3>
                <div>
                  <label className={labelStyle}>거래처명</label>
                  <input value={partnerName} onChange={(e) => setPartnerName(e.target.value)} placeholder="예: 잠실 헬스장" className={inputStyle} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelStyle}>대표자명</label>
                    <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={inputStyle} />
                  </div>
                  <div>
                    <label className={labelStyle}>사업자번호</label>
                    <input value={bizRegNo} onChange={(e) => setBizRegNo(e.target.value)} className={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>연락처</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>주소</label>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputStyle} />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-800">정산 정보</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelStyle}>단가 / 월정액</label>
                    <input value={expectedAmount} onChange={(e) => handleAmountChange(e.target.value)} placeholder="0" className={`${inputStyle} text-right`} />
                  </div>
                  <div>
                    <label className={labelStyle}>배송비</label>
                    <input value={deliveryFee} onChange={(e) => handleDeliveryFeeChange(e.target.value)} placeholder="0" className={`${inputStyle} text-right`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelStyle}>입금자명</label>
                    <input value={payerName} onChange={(e) => setPayerName(e.target.value)} className={inputStyle} />
                  </div>
                  <div>
                    <label className={labelStyle}>부가세 적용</label>
                    <select value={vatYn} onChange={(e) => setVatYn(e.target.value)} className={inputStyle}>
                      <option value="Y">적용 (Y)</option>
                      <option value="N">미적용 (N)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 space-y-4">
                <div>
                  <label className={labelStyle}>사용 여부</label>
                  <select value={useYn} onChange={(e) => setUseYn(e.target.value)} className={inputStyle}>
                    <option value="Y">사용</option>
                    <option value="N">미사용 (거래중지)</option>
                  </select>
                </div>
                <div>
                  <label className={labelStyle}>비고</label>
                  <textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="특이사항을 입력하세요" className={`${inputStyle} h-16 resize-none`} />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 shrink-0">
              <button
                onClick={savePartner}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md shadow-blue-500/30 hover:bg-blue-700 active:bg-blue-800 transition-colors"
              >
                정보 저장하기
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}