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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");

        // 1. 서비스에 로그인 인증 요청
        AdminUser user = adminUserService.authenticate(username, password);

        // 2. 인증 결과에 따른 응답 처리
        if (user != null) {
            // 로그인 성공 시
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "로그인 성공!");
            response.put("companyCode", user.getCompanyCode());
            response.put("username", user.getUsername());
            
            return ResponseEntity.ok(response); 
        } else {
            // 로그인 실패 시
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("아이디 또는 비밀번호가 틀렸습니다.");
        }
    }
}