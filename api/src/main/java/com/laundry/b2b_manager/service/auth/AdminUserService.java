package com.laundry.b2b_manager.service.auth; 

import com.laundry.b2b_manager.entity.auth.AdminUser;
import com.laundry.b2b_manager.repository.auth.AdminUserRepository;
import com.laundry.b2b_manager.service.common.EmailService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// 🚀 날짜 포맷팅을 위한 패키지 임포트 추가
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
    private final EmailService emailService; // EmailService 주입
    private final AdminUserRepository adminUserRepository;
    
    // 별도의 설정 파일 없이 서비스 내에서 바로 암호화 객체 생성
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // 비밀번호 복잡도 정규식
    private static final String PASSWORD_PATTERN = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$";

    // ==========================================
    // 🚀 신규 추가: 회사 코드 순차 발급 로직 (CYYMM-001 형식)
    // ==========================================
    private String generateCompanyCode() {
        // 1. 오늘 날짜를 기준으로 "C + YYMM + -" 형태의 접두사 만들기 (예: C2405-)
        String yymm = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMM"));
        String prefix = "C" + yymm + "-";

        // 2. 해당 접두사로 시작하는 가장 마지막 회사 찾기
        Optional<AdminUser> lastUser = adminUserRepository.findTopByCompanyCodeStartingWithOrderByCompanyCodeDesc(prefix);

        // 3. 만약 이번 달에 가입한 회사가 한 명도 없다면, 001번 부여
        if (lastUser.isEmpty() || lastUser.get().getCompanyCode() == null) {
            return prefix + "001";
        }

        // 4. 이번 달 가입자가 있다면, 마지막 번호에서 숫자만 추출해 +1 하기
        String lastCode = lastUser.get().getCompanyCode(); 
        try {
            String[] parts = lastCode.split("-");
            int nextNumber = Integer.parseInt(parts[1]) + 1;
            return prefix + String.format("%03d", nextNumber);
        } catch (Exception e) {
            // 혹시 데이터 파싱에 실패할 경우 안전망
            return prefix + "999"; 
        }
    }

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
    // 3. 회원가입 (DTO 없이 Map 사용)
    // ==========================================
    @Transactional
    public Map<String, Object> signUp(Map<String, String> payload) {
        Map<String, Object> result = new HashMap<>();
        
        String userId = payload.get("userId");
        String password = payload.get("password");
        String username = payload.get("username");
        // String companyName = payload.get("companyName"); // 필요시 엔티티에 추가 후 사용

        // 1. 아이디(이메일) 중복 체크
        if (adminUserRepository.findByUserId(userId).isPresent()) {
            result.put("success", false);
            result.put("message", "이미 사용 중인 이메일(아이디)입니다.");
            return result;
        }

        // 2. 🚀 무작위 UUID 대신 위에서 만든 순차 번호 발급 메서드 사용
        String newCompanyCode = generateCompanyCode();

        // 3. 관리자 계정 생성 및 비밀번호 암호화 저장
        AdminUser newUser = AdminUser.builder()
                .userId(userId)
                .password(passwordEncoder.encode(password)) // 프론트에서 넘어온 비밀번호 암호화
                .username(username)
                .companyCode(newCompanyCode) // 부여된 순차 회사 코드 저장
                .role("ROLE_DEFAULT")        // 기본 권한
                .isFirstLogin("N")           // 본인이 직접 가입했으므로 최초 변경은 건너뜀 ('N'으로 명시적 세팅 추천)
                .build();

        adminUserRepository.save(newUser);

        // 4. 성공 응답
        result.put("success", true);
        result.put("message", "회원가입이 완료되었습니다.");
        return result;
    }

    // ==========================================
    // 4. 비밀번호 초기화 (임시 비밀번호 발급)
    // ==========================================
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
                "안녕하세요, WashBiz입니다.\n\n귀하의 임시 비밀번호는 [%s] 입니다.\n로그인 후 반드시 비밀번호를 변경해 주세요.", 
                tempPassword);
        
        emailService.sendMail(userId, "[WashBiz] 임시 비밀번호 발급 안내", mailBody);

        result.put("success", true);
        result.put("message", "이메일로 임시 비밀번호가 발송되었습니다.");
        return result;
    }

    // ==========================================
    // 5. 초기 비밀번호 강제 변경
    // ==========================================
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
        
        // 3. 이제 최초 로그인이 아니므로 'N'으로 변경
        user.setIsFirstLogin("N");
        
        adminUserRepository.save(user);

        result.put("success", true);
        result.put("message", "초기 비밀번호가 안전하게 변경되었습니다.");
        
        return result;
    }
}