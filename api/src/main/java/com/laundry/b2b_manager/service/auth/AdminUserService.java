package com.laundry.b2b_manager.service.auth; 

import com.laundry.b2b_manager.entity.auth.AdminUser;
import com.laundry.b2b_manager.repository.auth.AdminUserRepository;
import com.laundry.b2b_manager.service.common.EmailService;
// 🚀 SubscriptionService를 사용하기 위한 import 추가
import com.laundry.b2b_manager.service.auth.SubscriptionService; 

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AdminUserService {
    private final EmailService emailService; 
    private final AdminUserRepository adminUserRepository;
    
    // 🚀 SubscriptionService 주입
    private final SubscriptionService subscriptionService; 
    
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private static final String PASSWORD_PATTERN = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$";

    // 회사 코드 순차 발급 로직
    private String generateCompanyCode() {
        String yymm = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMM"));
        String prefix = "C" + yymm + "-";

        Optional<AdminUser> lastUser = adminUserRepository.findTopByCompanyCodeStartingWithOrderByCompanyCodeDesc(prefix);

        if (lastUser.isEmpty() || lastUser.get().getCompanyCode() == null) {
            return prefix + "001";
        }

        String lastCode = lastUser.get().getCompanyCode(); 
        try {
            String[] parts = lastCode.split("-");
            int nextNumber = Integer.parseInt(parts[1]) + 1;
            return prefix + String.format("%03d", nextNumber);
        } catch (Exception e) {
            return prefix + "999"; 
        }
    }

    // 로그인 인증
    public AdminUser authenticate(String userId, String password) {
        Optional<AdminUser> userOptional = adminUserRepository.findByUserId(userId);

        if (userOptional.isPresent()) {
            AdminUser user = userOptional.get();
            String storedPassword = user.getPassword();

            if (storedPassword.equals(password) || passwordEncoder.matches(password, storedPassword)) {
                return user; 
            }
        }
        return null;
    }

    // 비밀번호 변경
    @Transactional
    public boolean changePassword(String userId, String currentPassword, String newPassword) {
        if (!Pattern.matches(PASSWORD_PATTERN, newPassword)) {
            throw new IllegalArgumentException("비밀번호 복잡도 조건을 만족하지 않습니다.");
        }

        Optional<AdminUser> userOptional = adminUserRepository.findByUserId(userId);
        
        if (userOptional.isPresent()) {
            AdminUser user = userOptional.get();
            String storedPassword = user.getPassword();

            if (storedPassword.equals(currentPassword) || passwordEncoder.matches(currentPassword, storedPassword)) {
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setIsFirstLogin("N");
                adminUserRepository.save(user);
                return true; 
            }
        }
        return false; 
    }

    // 🚀 회원가입 로직 (수정됨)
    @Transactional
    public Map<String, Object> signUp(Map<String, String> payload) {
        Map<String, Object> result = new HashMap<>();
        
        String userId = payload.get("userId");
        String password = payload.get("password");
        String username = payload.get("username");

        if (adminUserRepository.findByUserId(userId).isPresent()) {
            result.put("success", false);
            result.put("message", "이미 사용 중인 이메일(아이디)입니다.");
            return result;
        }

        String newCompanyCode = generateCompanyCode();

        AdminUser newUser = AdminUser.builder()
                .userId(userId)
                .password(passwordEncoder.encode(password))
                .username(username)
                .companyCode(newCompanyCode) 
                .role("ROLE_DEFAULT")        
                .isFirstLogin("N")           
                .build();

        adminUserRepository.save(newUser);

        // 🚀 신규 회원가입 시 30일 무료 체험 기간(TRIAL) 자동 부여
        subscriptionService.createTrialSubscription(newCompanyCode);

        result.put("success", true);
        result.put("message", "회원가입이 완료되었습니다. (30일 무료 체험 적용)");
        return result;
    }

    // 비밀번호 초기화
    @Transactional
    public Map<String, Object> resetPassword(String userId) {
        Map<String, Object> result = new HashMap<>();
        
        Optional<AdminUser> userOpt = adminUserRepository.findByUserId(userId);
        if (userOpt.isEmpty()) {
            result.put("success", false);
            result.put("message", "해당 이메일로 가입된 계정이 없습니다.");
            return result;
        }

        String tempPassword = UUID.randomUUID().toString().substring(0, 8);

        AdminUser user = userOpt.get();
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setIsFirstLogin("Y"); 
        adminUserRepository.save(user);

        String mailBody = String.format(
                "안녕하세요, WashBiz입니다.\n\n귀하의 임시 비밀번호는 [%s] 입니다.\n로그인 후 반드시 비밀번호를 변경해 주세요.", 
                tempPassword);
        
        emailService.sendMail(userId, "[WashBiz] 임시 비밀번호 발급 안내", mailBody);

        result.put("success", true);
        result.put("message", "이메일로 임시 비밀번호가 발송되었습니다.");
        return result;
    }

    // 초기 비밀번호 강제 변경
    @Transactional
    public Map<String, Object> changeInitialPassword(String userId, String newPassword) {
        Map<String, Object> result = new HashMap<>();
        
        Optional<AdminUser> userOpt = adminUserRepository.findByUserId(userId);
        if (userOpt.isEmpty()) {
            result.put("success", false);
            result.put("message", "사용자를 찾을 수 없습니다.");
            return result;
        }

        AdminUser user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setIsFirstLogin("N");
        
        adminUserRepository.save(user);

        result.put("success", true);
        result.put("message", "초기 비밀번호가 안전하게 변경되었습니다.");
        
        return result;
    }
}