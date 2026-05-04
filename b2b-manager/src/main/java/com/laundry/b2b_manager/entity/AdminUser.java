package com.laundry.b2b_manager.entity;

import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name = "admin_user")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AdminUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 로그인 ID로 사용 (기존 username에서 변경)
    @Column(name = "user_id", unique = true, nullable = false)
    private String userId;

    // 사용자 이름 또는 닉네임 (새로 추가)
    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;
    
    @Column(name = "company_code", nullable = false)
    private String companyCode; 
}