package com.laundry.b2b_manager.service; // 패키지 경로를 확인하세요

import com.laundry.b2b_manager.entity.AdminUser;
import com.laundry.b2b_manager.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final AdminUserRepository adminUserRepository;

    public AdminUser authenticate(String userId, String password) {
        // userId로 사용자 조회
        Optional<AdminUser> userOptional = adminUserRepository.findByUserId(userId);

        if (userOptional.isPresent()) {
            AdminUser user = userOptional.get();
            // 실무에서는 passwordEncoder.matches() 사용 권장
            if (user.getPassword().equals(password)) {
                return user; 
            }
        }
        return null;
    }
}