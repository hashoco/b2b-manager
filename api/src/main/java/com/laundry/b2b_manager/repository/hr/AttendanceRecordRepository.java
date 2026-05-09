package com.laundry.b2b_manager.repository.hr;

import org.springframework.data.jpa.repository.JpaRepository;

import com.laundry.b2b_manager.entity.hr.AttendanceRecord;

import java.util.List;



public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByCompanyCodeAndEmployeeIdAndWorkDateStartingWith(String companyCode, Long employeeId, String workMonth);
    void deleteByCompanyCodeAndEmployeeIdAndWorkDateStartingWith(String companyCode, Long employeeId, String workMonth);
}