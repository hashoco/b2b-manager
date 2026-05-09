package com.laundry.b2b_manager.repository.partners;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.laundry.b2b_manager.entity.partners.ClientCompany;

import java.util.List;
import java.util.Optional;

public interface ClientCompanyRepository extends JpaRepository<ClientCompany, Long> {
    
    // 🔵 1. 내 법인(companyCode)에 속한 거래처만 모두 가져오기
    List<ClientCompany> findByCompanyCode(String companyCode);
    
    // 🔵 2. 수정 시, 내 법인의 특정 거래처 코드(partnerCode)를 찾기
    Optional<ClientCompany> findByCompanyCodeAndPartnerCode(String companyCode, String partnerCode);
    
    // 🔵 3. 신규 코드 발급을 위해, 내 법인에 속한 가장 최근 거래처 1개 찾기
    ClientCompany findTopByCompanyCodeOrderByIdDesc(String companyCode);


}