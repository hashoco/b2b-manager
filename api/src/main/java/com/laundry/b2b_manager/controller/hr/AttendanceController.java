package com.laundry.b2b_manager.controller.hr;

import com.laundry.b2b_manager.entity.hr.Employee;
import com.laundry.b2b_manager.repository.hr.EmployeeRepository;
import com.laundry.b2b_manager.service.hr.AttendanceService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final EmployeeRepository employeeRepository; // 단순 저장은 레포지토리 직접 사용

    
  // 1. 마스터 리스트 조회
    @GetMapping("/api/attendance/master-list")
    public Map<String, Object> getMasterList(
            @RequestParam String companyCode, 
            @RequestParam String month,
            @RequestParam(required = false) String name,
            @RequestParam(required = false, defaultValue = "ALL") String useYn) {
            
        
        List<Map<String, Object>> rows = attendanceService.getMasterList(companyCode, month, name, useYn);
        return Map.of("success", true, "rows", rows);
    }

    // 2. 직원 관리 (추가/수정)
    @PostMapping("/api/employees/save")
    public Map<String, Object> saveEmployee(@RequestBody Employee emp) {
        employeeRepository.save(emp);
        return Map.of("success", true);
    }

    // 3. 근태 내역 읽기
    @PostMapping("/api/attendance/read")
    public Map<String, Object> readAttendance(@RequestBody Map<String, Object> payload) {
        String companyCode = (String) payload.get("companyCode");
        Long employeeId = Long.valueOf(payload.get("employeeId").toString());
        String month = (String) payload.get("month");
        
        Map<String, Object> data = attendanceService.readAttendance(companyCode, employeeId, month);
        return Map.of("success", true, "appliedWage", data.get("appliedWage"), "rows", data.get("rows"));
    }

    // 4. 근태 및 급여 스냅샷 저장
    @PostMapping("/api/attendance/save")
    public Map<String, Object> saveAttendance(@RequestBody Map<String, Object> payload) {
        attendanceService.saveAttendance(payload);
        return Map.of("success", true);
    }
}