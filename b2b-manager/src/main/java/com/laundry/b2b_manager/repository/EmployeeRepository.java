package com.laundry.b2b_manager.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.laundry.b2b_manager.entity.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByCompanyCode(String companyCode);
}