package com.laundry.b2b_manager.repository.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import com.laundry.b2b_manager.entity.auth.AdminUser;

import java.util.Optional;


public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {
    Optional<AdminUser> findByUserId(String userId);
}