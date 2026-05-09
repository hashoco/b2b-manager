package com.laundry.b2b_manager.repository.hr;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.laundry.b2b_manager.entity.hr.Attendance;

import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    // (기존 조회용)
    List<Attendance> findByCompanyCodeAndWorkDateStartingWithOrderByWorkDateAsc(String companyCode, String month);

    // 🚀 수정된 부분: 단건 삭제를 막고, 단 1번의 DELETE 쿼리가 즉시 실행되도록 강제합니다.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM Attendance a WHERE a.companyCode = :companyCode AND a.workDate LIKE CONCAT(:month, '%')")
    void deleteByCompanyCodeAndWorkDateStartingWith(@Param("companyCode") String companyCode, @Param("month") String month);
}