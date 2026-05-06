package com.laundry.b2b_manager.controller;

import com.laundry.b2b_manager.entity.AdminUser;
import com.laundry.b2b_manager.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    // ==========================================
    // 1. 로그인 API
    // ==========================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String userid = loginData.get("userId");
        String password = loginData.get("password");
        
        // 1. 서비스에 로그인 인증 요청
        AdminUser user = adminUserService.authenticate(userid, password);

        // 2. 인증 결과에 따른 응답 처리
        if (user != null) {
            // 로그인 성공 시
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "로그인 성공!");
            response.put("companyCode", user.getCompanyCode());
            response.put("username", user.getUsername());
            response.put("userId", user.getUserId());
            response.put("role", user.getRole()); // 프론트엔드 저장을 위해 추가
            
            // 🚀 핵심: 프론트엔드가 최초 로그인 여부를 판단할 수 있도록 상태값 전달!
            response.put("isFirstLogin", user.getIsFirstLogin());
            
            return ResponseEntity.ok(response); 
        } else {
            // 로그인 실패 시 (프론트엔드 에러 방지를 위해 JSON 형태로 응답)
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
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
}