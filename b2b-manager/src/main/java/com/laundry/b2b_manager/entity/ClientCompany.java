package com.laundry.b2b_manager.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "client_company")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClientCompany {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔵 신규 추가: 어느 세탁소(법인)의 거래처인가?
    @Column(nullable = false)
    private String companyCode;

    @Column(nullable = false)
    private String partnerCode; 
    
    @Column(nullable = false)
    private String partnerName;
    
    private String bizRegNo;
    private String ownerName;
    private String vatYn;
    private String payerName;
    private String phone;
    private String address;
    
    @Column(length = 1000)
    private String remark;
    
    private Integer expectedAmount;
    private Integer deliveryFee;
    private String storeType;
    private String useYn; 
}