import React, { useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";

const SubscriptionGuard = () => {
  // 🚀 알림창을 띄웠는지 기억하는 변수 (화면이 다시 그려져도 초기화되지 않음)
  const hasAlerted = useRef(false);
  
  const endDateStr = localStorage.getItem("subscriptionEndDate");
  
  // 1. 만료일 정보가 없으면 로그인 화면으로 쫓아냄
  if (!endDateStr) return <Navigate to="/" replace />;

  const today = new Date();
  const endDate = new Date(endDateStr);
  
  endDate.setHours(23, 59, 59, 999);

  // 2. 만료일이 지났다면?
  if (today > endDate) {
    // 🚀 알림창이 아직 안 떴을 때만 딱 한 번 띄움
    if (!hasAlerted.current) {
      alert("구독 기간이 만료되었습니다. 서비스를 계속 이용하시려면 결제가 필요합니다.");
      hasAlerted.current = true; 
    }
    // 결제창으로 강제 이동
    return <Navigate to="/payment/checkout" replace />;
  }

  // 3. 통과! 정상적으로 화면 보여주기
  return <Outlet />;
};

export default SubscriptionGuard;