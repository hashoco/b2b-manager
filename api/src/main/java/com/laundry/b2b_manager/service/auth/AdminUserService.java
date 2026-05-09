package com.laundry.b2b_manager.service.auth; 

import com.laundry.b2b_manager.entity.auth.AdminUser;
import com.laundry.b2b_manager.repository.auth.AdminUserRepository;
import com.laundry.b2b_manager.service.common.EmailService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AdminUserService {
    private final EmailService emailService; // EmailService 주입
    private final AdminUserRepository adminUserRepository;
    
    // 🚀 별도의 설정 파일 없이 서비스 내에서 바로 암호화 객체 생성
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // 비밀번호 복잡도 정규식
    private static final String PASSWORD_PATTERN = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$";

    // ==========================================
    // 1. 로그인 인증
    // ==========================================
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

    // ==========================================
    // 2. 비밀번호 변경 (암호화 적용)
    // ==========================================
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

    // ==========================================
    // 3. 🚀 신규 추가: 회원가입 (DTO 없이 Map 사용)
    // ==========================================
    @Transactional
    public Map<String, Object> signUp(Map<String, String> payload) {
        Map<String, Object> result = new HashMap<>();
        
        String userId = payload.get("userId");
        String password = payload.get("password");
        String username = payload.get("username");
        String companyName = payload.get("companyName");

        // 1. 아이디(이메일) 중복 체크
        if (adminUserRepository.findByUserId(userId).isPresent()) {
            result.put("success", false);
            result.put("message", "이미 사용 중인 이메일(아이디)입니다.");
            return result;
        }

        // 2. 새로운 회사 코드(companyCode) 생성 (예: C-무작위8자리)
        String newCompanyCode = "C-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        /* 💡 참고: 나중에 CompanyProfile 엔티티와 레포지토리를 만드시면 
           여기에 companyName과 newCompanyCode를 저장하는 코드를 한 줄 추가하시면 됩니다! */

        // 3. 관리자 계정 생성 및 비밀번호 암호화 저장
        AdminUser newUser = AdminUser.builder()
                .userId(userId)
                .password(passwordEncoder.encode(password)) // 🚀 핵심: 프론트에서 넘어온 비밀번호 암호화
                .username(username)
                .companyCode(newCompanyCode) // 부여된 회사 코드 저장
                .role("ROLE_DEFAULT")          // 기본 권한
                .isFirstLogin("")           // 본인이 직접 가입했으므로 최초 변경은 건너뜀
                .build();

        adminUserRepository.save(newUser);

        // 4. 성공 응답
        result.put("success", true);
        result.put("message", "회원가입이 완료되었습니다.");
        return result;
    }

    @Transactional
public Map<String, Object> resetPassword(String userId) {
    Map<String, Object> result = new HashMap<>();
    
    Optional<AdminUser> userOpt = adminUserRepository.findByUserId(userId);
    if (userOpt.isEmpty()) {
        result.put("success", false);
        result.put("message", "해당 이메일로 가입된 계정이 없습니다.");
        return result;
    }

    // 1. 8자리 임시 비밀번호 생성 (영문+숫자)
    String tempPassword = UUID.randomUUID().toString().substring(0, 8);

    // 2. DB 업데이트 (암호화 저장 + 최초 로그인 상태로 복구)
    AdminUser user = userOpt.get();
    user.setPassword(passwordEncoder.encode(tempPassword));
    user.setIsFirstLogin("Y"); // 임시 비밀번호이므로 로그인 시 강제 변경 유도
    adminUserRepository.save(user);

    // 3. 이메일 발송
    String mailBody = String.format(
            "안녕하세요,  WashBiz입니다.\n\n귀하의 임시 비밀번호는 [%s] 입니다.\n로그인 후 반드시 비밀번호를 변경해 주세요.", 
            tempPassword);
    
    emailService.sendMail(userId, "[WashBiz] 임시 비밀번호 발급 안내", mailBody);

    result.put("success", true);
    result.put("message", "이메일로 임시 비밀번호가 발송되었습니다.");
    return result;
}
@Transactional
    public Map<String, Object> changeInitialPassword(String userId, String newPassword) {
        Map<String, Object> result = new HashMap<>();
        
        // 1. 유저 찾기
        Optional<AdminUser> userOpt = adminUserRepository.findByUserId(userId);
        if (userOpt.isEmpty()) {
            result.put("success", false);
            result.put("message", "사용자를 찾을 수 없습니다.");
            return result;
        }

        AdminUser user = userOpt.get();
        
        // 2. 새 비밀번호 암호화 및 덮어쓰기
        user.setPassword(passwordEncoder.encode(newPassword));
        
        // 3. 🚀 가장 중요: 이제 최초 로그인이 아니므로 'N'으로 변경!
        user.setIsFirstLogin("N");
        
        adminUserRepository.save(user);

        result.put("success", true);
        result.put("message", "초기 비밀번호가 안전하게 변경되었습니다.");
        
        return result;
    }

}