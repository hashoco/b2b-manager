import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  
  // 🚀 요청 중복 방지를 위한 참조값
  const isConfirming = useRef(false);

  useEffect(() => {
    const confirmPayment = async () => {
      // 🚀 이미 요청을 보냈다면(중복 호출 시) 여기서 중단
      if (isConfirming.current) return;
      isConfirming.current = true;

      // 1. URL에서 토스가 보낸 데이터 뽑기
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");
      const companyCode = localStorage.getItem("companyCode");

      if (!paymentKey || !orderId || !amount) {
        setStatus("error");
        return;
      }

      try {
        // 2. JWT 토큰 가져오기
        const token = localStorage.getItem("token");

        // 3. 백엔드(Spring Boot)로 최종 승인 요청
        const response = await fetch("/api/payment/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          },
          body: JSON.stringify({ paymentKey, orderId, amount, companyCode }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          
          // 4. 로컬스토리지 구독 기간 연장
          const currentEndDateStr = localStorage.getItem("subscriptionEndDate");
          let newEndDate = new Date();
          if (currentEndDateStr && new Date(currentEndDateStr) > new Date()) {
            newEndDate = new Date(currentEndDateStr);
          }
          newEndDate.setMonth(newEndDate.getMonth() + 1); // 1달 추가
          
          localStorage.setItem("subscriptionEndDate", newEndDate.toISOString());
          localStorage.setItem("subscriptionStatus", "ACTIVE");

        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("결제 승인 통신 에러:", error);
        setStatus("error");
      }
    };

    confirmPayment();
  }, [searchParams]);

  // 로딩 중 화면
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mb-4"></div>
        <h2 className="text-xl font-bold text-slate-700">결제를 안전하게 승인하고 있습니다...</h2>
        <p className="text-slate-500 mt-2">잠시만 기다려 주세요.</p>
      </div>
    );
  }

  // 에러 화면
  if (status === "error") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">결제 승인 실패</h2>
          <p className="text-slate-600 mb-6">결제 처리 중 문제가 발생했습니다. 관리자에게 문의해 주세요.</p>
          <button 
            onClick={() => navigate("/payment/checkout")}
            className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors"
          >
            다시 시도하기
          </button>
        </div>
      </div>
    );
  }

  // 성공 화면
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-8 border-blue-600">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-2">결제 완료!</h2>
        <p className="text-slate-600 mb-6">구독이 성공적으로 1개월 연장되었습니다.</p>
        
        <div className="bg-slate-50 p-4 rounded-lg mb-8 text-left">
          <p className="text-sm text-slate-500 mb-1">주문 번호: <span className="font-mono text-slate-700">{searchParams.get("orderId")}</span></p>
          <p className="text-sm text-slate-500">결제 금액: <span className="font-bold text-blue-600">{Number(searchParams.get("amount")).toLocaleString()}원</span></p>
        </div>

        <button 
          onClick={() => navigate("/dashboard")}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          대시보드로 이동하기
        </button>
      </div>
    </div>
  );
};

export default Success;