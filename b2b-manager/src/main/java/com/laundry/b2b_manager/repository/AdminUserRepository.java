package com.laundry.b2b_manager.repository;

import com.laundry.b2b_manager.entity.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// JpaRepository를 상속받으면 기본 CRUD 쿼리가 자동으로 생성됩니다.
public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {
    // 아이디(username)로 DB에서 유저 정보를 찾아오는 메서드
    Optional<AdminUser> findByUsername(String username);
}