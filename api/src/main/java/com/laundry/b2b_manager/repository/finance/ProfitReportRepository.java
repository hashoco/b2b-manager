package com.laundry.b2b_manager.repository.finance;

import org.springframework.data.jpa.repository.JpaRepository;

import com.laundry.b2b_manager.entity.finance.ProfitReport;

import java.util.Optional;

public interface ProfitReportRepository extends JpaRepository<ProfitReport, Long> {
    Optional<ProfitReport> findByCompanyCodeAndReportMonth(String companyCode, String reportMonth);
}