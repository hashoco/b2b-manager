
package com.laundry.b2b_manager.controller;

import com.laundry.b2b_manager.entity.AdminUser;
import com.laundry.b2b_manager.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class AdminUserController {

    @Autowired
    private AdminUserRepository adminUserRepository;

   @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");

        // 1. DB에서 아이디 검색
        Optional<AdminUser> userOptional = adminUserRepository.findByUsername(username);

        if (userOptional.isPresent()) {
            AdminUser user = userOptional.get();
            // 2. 비밀번호 확인
            if (user.getPassword().equals(password)) {
                // 🔵 로그인 성공 시 법인 정보를 포함한 맵 생성
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "로그인 성공!");
                response.put("companyCode", user.getCompanyCode()); // 👈 이 정보가 핵심입니다!
                response.put("username", user.getUsername());
                
                return ResponseEntity.ok(response); 
            }
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("아이디 또는 비밀번호가 틀렸습니다.");
    }

    // ==========================================
    // 💡 CORS 전역 허용 설정 (React 3000번 포트 허용)
    // ==========================================
    @Configuration
    public class CorsConfig implements WebMvcConfigurer {
        @Override
        public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/**") // 모든 API 주소에 대해
                    .allowedOrigins("http://localhost:3000") // 리액트 주소의 접근을 허용합니다!
                    .allowedMethods("GET", "POST", "PUT", "DELETE");
        }
    }
}