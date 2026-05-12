package com.laundry.b2b_manager.entity.auth;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscription")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Subscription {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // AdminUser의 companyCode와 동일한 값을 저장하여 서로 연결합니다.
    @Column(name = "company_code", nullable = false, unique = true)
    private String companyCode; 

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus status; 

    @Column(name = "start_date")
    private LocalDate startDate; // 구독 시작일

    @Column(name = "end_date")
    private LocalDate endDate;   // 구독 종료일 

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}