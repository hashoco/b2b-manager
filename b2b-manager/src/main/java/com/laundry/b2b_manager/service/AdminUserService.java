package com.laundry.b2b_manager.service; 

import com.laundry.b2b_manager.entity.AdminUser;
import com.laundry.b2b_manager.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final AdminUserRepository adminUserRepository;
    
    // 🚀 별도의 설정 파일 없이 서비스 내에서 바로 암호화 객체 생성
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // 비밀번호 복잡도 정규식 (프론트엔드와 동일하게 백엔드에서도 2차 검증)
    private static final String PASSWORD_PATTERN = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$";

    // ==========================================
    // 1. 로그인 인증
    // ==========================================
    public AdminUser authenticate(String userId, String password) {
        Optional<AdminUser> userOptional = adminUserRepository.findByUserId(userId);

        if (userOptional.isPresent()) {
            AdminUser user = userOptional.get();
            String storedPassword = user.getPassword();

            // 🚀 핵심: 기존 평문('1234')과 향후 저장될 암호화된 비밀번호 모두 호환되도록 처리
            if (storedPassword.equals(password) || passwordEncoder.matches(password, storedPassword)) {
                return user; 
            }
        }
        return null;
    }

    // ==========================================
    // 2. 비밀번호 변경 (암호화 적용)
    // ==========================================
    @Transactional
    public boolean changePassword(String userId, String currentPassword, String newPassword) {
        // 백엔드 정규식 검증 (보안 강화)
        if (!Pattern.matches(PASSWORD_PATTERN, newPassword)) {
            throw new IllegalArgumentException("비밀번호 복잡도 조건을 만족하지 않습니다.");
        }

        Optional<AdminUser> userOptional = adminUserRepository.findByUserId(userId);
        
        if (userOptional.isPresent()) {
            AdminUser user = userOptional.get();
            String storedPassword = user.getPassword();

            // 1. 현재 비밀번호 검증 (평문이든 암호문이든 확인)
            if (storedPassword.equals(currentPassword) || passwordEncoder.matches(currentPassword, storedPassword)) {
                
                // 2. 🚀 새 비밀번호는 반드시 강력한 암호화(BCrypt)를 거쳐서 DB에 저장!
                user.setPassword(passwordEncoder.encode(newPassword));
                
                // 3. 최초 로그인 상태 해제
                user.setIsFirstLogin("N");
                
                adminUserRepository.save(user);
                return true; 
            }
        }
        return false; 
    }
}