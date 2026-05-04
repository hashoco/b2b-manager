package com.laundry.b2b_manager.repository;

import com.laundry.b2b_manager.entity.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;


public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {
    Optional<AdminUser> findByUserId(String userId);
}