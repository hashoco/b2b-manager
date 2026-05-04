package com.laundry.b2b_manager.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.laundry.b2b_manager.entity.AttendanceRecord;

import java.util.List;
import java.util.Optional;


public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByCompanyCodeAndEmployeeIdAndWorkDateStartingWith(String companyCode, Long employeeId, String workMonth);
    void deleteByCompanyCodeAndEmployeeIdAndWorkDateStartingWith(String companyCode, Long employeeId, String workMonth);
}