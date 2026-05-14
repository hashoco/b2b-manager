import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Fail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 토스가 URL로 실패 사유를 보내줍니다.
  const message = searchParams.get("message") || "알 수 없는 오류가 발생했습니다.";
  const code = searchParams.get("code") || "UNKNOWN_ERROR";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-8 border-red-500">
        <div className="text-5xl mb-4">💳</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">결제가 취소/실패 되었습니다.</h2>
        
        <div className="bg-red-50 p-4 rounded-lg mb-8 text-left border border-red-100 mt-4">
          <p className="text-sm text-red-600 font-semibold mb-1">실패 사유:</p>
          <p className="text-slate-700 text-sm">{message}</p>
          <p className="text-xs text-slate-400 mt-2">에러 코드: {code}</p>
        </div>

        <button 
          onClick={() => navigate("/payment/checkout")}
          className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl hover:bg-slate-700 transition-colors shadow-md"
        >
          결제창으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default Fail;