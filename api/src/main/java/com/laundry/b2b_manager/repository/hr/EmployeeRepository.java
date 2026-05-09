package com.laundry.b2b_manager.repository.hr;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.laundry.b2b_manager.entity.hr.Employee;
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    
    // 기존 메서드 (유지)
    List<Employee> findByCompanyCode(String companyCode);

    // 🚀 추가된 검색 조건 쿼리
    @Query("SELECT e FROM Employee e WHERE e.companyCode = :companyCode " +
           "AND (:name IS NULL OR :name = '' OR e.name LIKE CONCAT('%', :name, '%')) " +
           "AND (:useYn = 'ALL' OR :useYn IS NULL OR e.useYn = :useYn)")
    List<Employee> findByConditions(@Param("companyCode") String companyCode, 
                                    @Param("name") String name, 
                                    @Param("useYn") String useYn);
}