// src/utils/api.js

// 🚀 통합 배포 방식이므로, 로컬이든 배포든 복잡한 주소 감지가 필요 없습니다!
// 무조건 상대 경로(/api/...)를 타게 만들기 위해 빈 문자열을 줍니다.
export const API_BASE_URL = "";

export const apiFetch = async (url, options = {}) => {
  // 1. 로컬 스토리지에서 토큰 꺼내기
  const token = localStorage.getItem("token");

  // 2. 기본 헤더 세팅
  const headers = {
    "Content-Type": "application/json",
    ...options.headers, // 컴포넌트에서 넘겨준 헤더가 있으면 병합
  };

  // 3. 토큰이 있으면 Authorization 헤더에 Bearer 타입으로 추가!
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 4. 주소 합치기 
  // API_BASE_URL이 빈 문자열("")이므로, url(예: /api/login) 그대로 찌릅니다.
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  // 5. fetch 실행
  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  // 6. 만약 백엔드에서 401(Unauthorized)이나 403(Forbidden) 에러가 오면?
  if (response.status === 401 || response.status === 403) {
    console.error("토큰이 만료되었거나 권한이 없습니다. 로그아웃 처리합니다.");
    localStorage.removeItem("token");
    localStorage.removeItem("companyCode");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    
    // 로그인 페이지로 쫓아냄
    window.location.href = "/login";
    return Promise.reject("인증 에러");
  }

  return response;
};