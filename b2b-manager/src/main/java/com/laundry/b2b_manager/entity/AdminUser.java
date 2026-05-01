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

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;
    
    // 🔵 신규 추가: 어느 세탁소(법인) 소속인지 구분하는 코드 (예: C001, C002)
    @Column(name = "company_code", nullable = false)
    private String companyCode; 
}