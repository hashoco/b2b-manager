package com.laundry.b2b_manager.controller;

import com.laundry.b2b_manager.entity.AdminUser;
import com.laundry.b2b_manager.service.AdminUserService;
import com.laundry.b2b_manager.util.JwtUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;
    private final JwtUtil jwtUtil; // 🚀 JwtUtil 의존성 주입

    // ==========================================
    // 1. 로그인 API
    // ==========================================
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");
        String password = payload.get("password");
        // boolean rememberMe = Boolean.parseBoolean(payload.get("rememberMe")); // 향후 자동로그인에 사용

        // 서비스에서 아이디/비밀번호 검증
        AdminUser user = adminUserService.authenticate(userId, password);

        Map<String, Object> response = new HashMap<>();
        
        if (user != null) {
            // 🚀 로그인 성공! JwtUtil을 사용해 토큰 생성
            String token = jwtUtil.generateToken(user.getUserId(), user.getUsername(), user.getCompanyCode(), user.getRole());

            response.put("success", true);
            response.put("message", "로그인 성공");
            response.put("token", token); // ⭐️ 프론트엔드로 토큰 전달!
            
            // 기존에 넘겨주던 데이터들
            response.put("userId", user.getUserId());
            response.put("username", user.getUsername());
            response.put("companyCode", user.getCompanyCode());
            response.put("role", user.getRole());
            response.put("isFirstLogin", user.getIsFirstLogin());

            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "아이디 또는 비밀번호가 틀렸습니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    // ==========================================
    // 2. 비밀번호 변경 API (새로 추가됨)
    // ==========================================
    @PostMapping("/user/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody Map<String, String> requestData) {
        Map<String, Object> response = new HashMap<>();
        
        String userId = requestData.get("userId");
        String currentPassword = requestData.get("currentPassword");
        String newPassword = requestData.get("newPassword");

        boolean isSuccess = adminUserService.changePassword(userId, currentPassword, newPassword);

        if (isSuccess) {
            response.put("success", true);
            response.put("message", "비밀번호가 성공적으로 변경되었습니다.");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "기존 비밀번호가 일치하지 않습니다.");
            return ResponseEntity.status(400).body(response);
        }
    }

    // 기존에 있던 로그인(/api/login) 메서드 등은 그대로 두시고 아래에 추가하세요.

    // 🚀 회원가입 API
    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signUp(@RequestBody Map<String, String> payload) {
        Map<String, Object> result = adminUserService.signUp(payload);
        
        // 서비스에서 success가 false로 오면 (예: 중복 아이디) 400 Bad Request 에러 반환
        if (!(boolean) result.get("success")) {
            return ResponseEntity.badRequest().body(result);
        }
        
        return ResponseEntity.ok(result);
    }

    @PostMapping("/user/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> payload) {
        // 🚀 [디버깅] 컨트롤러 도착 확인
        System.out.println("[Controller] 🎯 비밀번호 찾기 API 도착 완료!");
        
        String userId = payload.get("userId");
        System.out.println("[Controller] 📧 요청받은 아이디(이메일): " + userId);
        
        Map<String, Object> result = adminUserService.resetPassword(userId);
        
        if (!(boolean) result.get("success")) {
            System.out.println("[Controller] ❌ 처리 실패: " + result.get("message"));
            return ResponseEntity.badRequest().body(result);
        }
        
        System.out.println("[Controller] ✅ 처리 성공!");
        return ResponseEntity.ok(result);
        
    }

    @PostMapping("/user/change-password-init")
    public ResponseEntity<Map<String, Object>> changeInitialPassword(
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal String userId) { // 🚀 JwtFilter가 검증한 토큰에서 꺼내온 userId!
        
        System.out.println("[Controller] 🎯 초기 비밀번호 변경 API 도착! 요청자: " + userId);
        
        String newPassword = payload.get("newPassword");
        
        // 서비스 호출 (비밀번호 변경 및 isFirstLogin 'N'으로 업데이트)
        Map<String, Object> result = adminUserService.changeInitialPassword(userId, newPassword);
        
        if (!(boolean) result.get("success")) {
            return ResponseEntity.badRequest().body(result);
        }
        
        return ResponseEntity.ok(result);
    }
    
}