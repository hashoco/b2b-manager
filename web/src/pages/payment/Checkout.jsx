import React, { useState } from "react";
// 🚀 위젯 SDK가 아닌 클래식 SDK를 불러옵니다.
import { loadTossPayments } from "@tosspayments/payment-sdk"; 
import { useNavigate } from "react-router-dom";

// 🚀 아까 캡처에서 확인한 유저님의 'API 개별 연동' 클라이언트 키!
const clientKey = "test_ck_oEjb0gm23PbWJ5nAqX5NrpGwBJn5"; 

const Checkout = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId") || "anonymous";
  const username = localStorage.getItem("username") || "고객";
  
  const [price] = useState(55000); 

  const handlePaymentRequest = async () => {
    try {
      // 1. 토스페이먼츠 객체 초기화
      const tossPayments = await loadTossPayments(clientKey);
      
      const isValidEmail = userId.includes('@') && userId.includes('.');
      const safeEmail = userId;

      // 2. 결제창 호출 (팝업 형태)
      await tossPayments.requestPayment("카드", { 
        amount: price,
        orderId: `order_${new Date().getTime()}`,
        orderName: "WashBiz PRO (1개월 구독)",
        customerName: username,
        customerEmail: safeEmail,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (error) {
      console.error("결제 요청 실패:", error);
      alert(`결제 취소 또는 에러: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200">
        
        <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">서비스 구독 결제</h2>
            <p className="text-slate-400 text-sm mt-1">안전하고 간편하게 결제를 진행하세요.</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-white transition-colors text-sm px-3 py-1 rounded-lg border border-slate-700"
          >
            ✕ 취소
          </button>
        </div>

        <div className="p-6 md:p-8">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">결제 상품</p>
              <p className="text-lg font-bold text-slate-800">WashBiz PRO (1개월)</p>
            </div>
            <div className="sm:text-right">
              <p className="text-sm text-slate-500 font-medium mb-1">총 결제 금액</p>
              <p className="text-2xl font-extrabold text-blue-600">{price.toLocaleString()}원</p>
            </div>
          </div>

          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-8 text-sm text-center">
            결제하기 버튼을 누르시면 안전한 토스페이먼츠 결제창이 팝업으로 나타납니다.
          </div>

          <button
            onClick={handlePaymentRequest}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md shadow-blue-200 transition-all text-lg"
          >
            {price.toLocaleString()}원 결제하기
          </button>
          
          <p className="flex items-center justify-center text-xs text-slate-400 mt-4">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            결제 정보는 안전하게 암호화되어 처리됩니다.
          </p>

        </div>
      </div>
    </div>
  );
};

export default Checkout;