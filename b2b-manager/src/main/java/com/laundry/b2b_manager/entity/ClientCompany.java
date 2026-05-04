package com.laundry.b2b_manager.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
// 💡 아래처럼 @Table 설정을 변경하여 두 컬럼을 묶어서 유니크 처리합니다.
@Table(
    name = "client_company",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_company_partner_code",
            columnNames = {"company_code", "partner_code"} // 두 개가 합쳐져서 유일해야 함
        )
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClientCompany {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_code", nullable = false)
    private String companyCode;

    @Column(name = "partner_code", nullable = false)
    private String partnerCode; 
    
    @Column(name = "partner_name", nullable = false)
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