package com.laundry.b2b_manager.repository.work;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.laundry.b2b_manager.entity.work.DailyWork;

public interface DailyWorkRepository extends JpaRepository<DailyWork, Long> {
    // 특정 법인의 특정 월 데이터를 한꺼번에 조회
    List<DailyWork> findByCompanyCodeAndWorkDateBetween(String companyCode, LocalDate start, LocalDate end);
    
    // 기존 데이터 존재 여부 확인 (Upsert용)
    Optional<DailyWork> findByCompanyCodeAndPartnerIdAndWorkDate(String companyCode, Long partnerId, LocalDate workDate);
}