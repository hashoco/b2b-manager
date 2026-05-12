import React, { useEffect, useRef, useState } from "react";
import { loadPaymentWidget } from "@tosspayments/payment-widget-sdk";
import { useNavigate } from "react-router-dom";

// TODO: 발급받은 '테스트 클라이언트 키'를 입력하세요!
const clientKey = "test_ck_발급받은_클라이언트_키를_넣으세요"; 

const Checkout = () => {
  const navigate = useNavigate();
  const paymentWidgetRef = useRef(null);
  const paymentMethodsWidgetRef = useRef(null);

  const userId = localStorage.getItem("userId") || "anonymous";
  const username = localStorage.getItem("username") || "고객";
  
  const [price] = useState(55000); // 결제 금액 (VAT 포함 예시)

  useEffect(() => {
    const fetchPaymentWidget = async () => {
      try {
        const paymentWidget = await loadPaymentWidget(clientKey, userId);
        const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
          "#payment-method",
          { value: price },
          { variantKey: "DEFAULT" }
        );
        // 토스페이먼츠에서 제공하는 필수 약관 동의 위젯 (여기서 법적 동의가 끝납니다)
        paymentWidget.renderAgreement("#agreement", { variantKey: "AGREEMENT" });

        paymentWidgetRef.current = paymentWidget;
        paymentMethodsWidgetRef.current = paymentMethodsWidget;
      } catch (error) {
        console.error("결제위젯 로드 실패:", error);
      }
    };

    fetchPaymentWidget();
  }, [userId, price]);

  const handlePaymentRequest = async () => {
    const paymentWidget = paymentWidgetRef.current;
    try {
      await paymentWidget.requestPayment({
        orderId: `order_${new Date().getTime()}`,
        orderName: "WashBiz PRO (1개월 구독)",
        customerName: username,
        customerEmail: userId, 
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (error) {
      console.error("결제 요청 실패:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-8 font-sans">
      
      {/* 🚀 max-w-2xl -> max-w-xl 로 변경하여 좌우 여백을 더 넓혔습니다 */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200">
        
        <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">서비스 구독 결제</h2>
            <p className="text-slate-400 text-sm mt-1">안전하고 간편하게 결제를 진행하세요.</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-white transition-colors text-sm px-3 py-1 rounded-lg border border-slate-700 hover:border-slate-500"
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

          <div className="min-h-[300px]">
            <div id="payment-method" className="w-full mb-2" />
            <div id="agreement" className="w-full mb-6" />
          </div>

          <button
            onClick={handlePaymentRequest}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md shadow-blue-200 transition-all text-lg"
          >
            {price.toLocaleString()}원 결제하기
          </button>
          
          {/* 🚀 찝찝한 문구를 빼고, 고객이 안심할 수 있는 보안 강조 문구로 변경했습니다 */}
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