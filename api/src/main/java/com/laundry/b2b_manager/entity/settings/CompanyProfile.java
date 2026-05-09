package com.laundry.b2b_manager.entity.settings;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "company_profile")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_code", unique = true, nullable = false)
    private String companyCode; // 법인 구분 코드

    @Column(name = "biz_reg_no")
    private String bizRegNo;    // 사업자 번호

    @Column(name = "company_name")
    private String companyName; // 상호명

    @Column(name = "owner_name")
    private String ownerName;   // 대표자명

    private String email;       // 대표 이메일
}