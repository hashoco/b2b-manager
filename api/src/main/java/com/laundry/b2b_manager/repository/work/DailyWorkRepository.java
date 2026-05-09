package com.laundry.b2b_manager.repository.work;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.laundry.b2b_manager.entity.partners.ClientCompany;
import com.laundry.b2b_manager.entity.work.DailyWork;

public interface DailyWorkRepository extends JpaRepository<DailyWork, Long> {
    // 특정 법인의 특정 월 데이터를 한꺼번에 조회
    List<DailyWork> findByCompanyCodeAndWorkDateBetween(String companyCode, LocalDate start, LocalDate end);
    
    // 기존 데이터 존재 여부 확인 (Upsert용)
    Optional<DailyWork> findByCompanyCodeAndPartnerIdAndWorkDate(String companyCode, Long partnerId, LocalDate workDate);

 
    
// 🚀 요구사항: store_type 순 -> vat_yn 역순(Y가 먼저) -> partner_name(숫자/가나다) 순
    @Query("SELECT p FROM ClientCompany p " +
           "WHERE p.companyCode = :companyCode AND p.useYn = 'Y' " +
           "ORDER BY p.storeType ASC, p.vatYn DESC, p.partnerName ASC")
    List<ClientCompany> findAllActivePartnersSorted(@Param("companyCode") String companyCode);
}