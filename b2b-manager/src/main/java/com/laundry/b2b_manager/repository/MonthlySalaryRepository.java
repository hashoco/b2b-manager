package com.laundry.b2b_manager.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.laundry.b2b_manager.entity.MonthlySalary;


public interface MonthlySalaryRepository extends JpaRepository<MonthlySalary, Long> {
    Optional<MonthlySalary> findByCompanyCodeAndEmployeeIdAndWorkMonth(String companyCode, Long employeeId, String workMonth);
}