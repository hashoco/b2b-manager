package com.laundry.b2b_manager.entity.auth;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_code", nullable = false)
    private String companyCode;

    @Column(name = "payment_key")
    private String paymentKey; // 토스페이먼츠에서 주는 결제 고유 키 (환불할 때 꼭 필요함)
    
    @Column(name = "order_id", unique = true)
    private String orderId;    // 주문번호 (예: order_168431...)

    private Long amount;       // 결제 금액
    
    private String method;     // 결제 수단 (예: 카드, 가상계좌 등)
    
    @Column(name = "approved_at")
    private LocalDateTime approvedAt; // 결제 승인 시간
}