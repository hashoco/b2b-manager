package com.laundry.b2b_manager.repository;

import com.laundry.b2b_manager.entity.ProfitReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProfitReportRepository extends JpaRepository<ProfitReport, Long> {
    Optional<ProfitReport> findByCompanyCodeAndReportMonth(String companyCode, String reportMonth);
}