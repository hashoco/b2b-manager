package com.laundry.b2b_manager.service.hr;

import com.laundry.b2b_manager.entity.hr.*;
import com.laundry.b2b_manager.entity.hr.AttendanceRecord;
import com.laundry.b2b_manager.entity.hr.Employee;
import com.laundry.b2b_manager.entity.hr.MonthlySalary;
import com.laundry.b2b_manager.repository.hr.*;
import com.laundry.b2b_manager.repository.hr.AttendanceRecordRepository;
import com.laundry.b2b_manager.repository.hr.EmployeeRepository;
import com.laundry.b2b_manager.repository.hr.MonthlySalaryRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final EmployeeRepository employeeRepository;
    private final MonthlySalaryRepository monthlySalaryRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;

    /**
     * 1. 마스터 그리드 조회 (직원정보 + 해당월 급여합계)
     */
    /**
     * 1. 마스터 그리드 조회 (직원정보 + 해당월 급여합계 + 검색조건)
     */
    public List<Map<String, Object>> getMasterList(String companyCode, String month, String name, String useYn) {
        // 🚀 수정: 조건 검색 쿼리 사용
        List<Employee> employees = employeeRepository.findByConditions(companyCode, name, useYn);
        List<Map<String, Object>> resultList = new ArrayList<>();

        for (Employee emp : employees) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", emp.getId());
            map.put("name", emp.getName());
            map.put("insurance", emp.getInsurance());
            map.put("phone", emp.getPhone());
            map.put("wage", emp.getWage());
            map.put("note", emp.getNote());
            map.put("useYn", emp.getUseYn());

            // 스냅샷 조회
            Optional<MonthlySalary> ms = monthlySalaryRepository.findByCompanyCodeAndEmployeeIdAndWorkMonth(companyCode, emp.getId(), month);
            if (ms.isPresent()) {
                map.put("totalHours", ms.get().getTotalHours());
                map.put("totalSalary", ms.get().getTotalSalary());
            } else {
                map.put("totalHours", 0);
                map.put("totalSalary", 0);
            }
            resultList.add(map);
        }
        return resultList;
    }

    /**
     * 2. 상세 근태 조회 (적용 시급 로직 포함)
     */
    public Map<String, Object> readAttendance(String companyCode, Long employeeId, String month) {
        Map<String, Object> result = new HashMap<>();

        // 과거 스냅샷 시급이 있으면 가져오고, 없으면 현재 직원의 기본 시급 사용
        Optional<MonthlySalary> ms = monthlySalaryRepository.findByCompanyCodeAndEmployeeIdAndWorkMonth(companyCode, employeeId, month);
        if (ms.isPresent()) {
            result.put("appliedWage", ms.get().getAppliedWage());
        } else {
            Employee emp = employeeRepository.findById(employeeId).orElse(null);
            result.put("appliedWage", emp != null ? emp.getWage() : 0);
        }

        List<AttendanceRecord> rows = attendanceRecordRepository.findByCompanyCodeAndEmployeeIdAndWorkDateStartingWith(companyCode, employeeId, month);
        result.put("rows", rows);
        return result;
    }

    /**
     * 3. 상세 근태 및 월별 스냅샷 일괄 저장
     */
    @Transactional
    public void saveAttendance(Map<String, Object> payload) {
        String companyCode = (String) payload.get("companyCode");
        Long employeeId = Long.valueOf(payload.get("employeeId").toString());
        String month = (String) payload.get("month");
        Integer appliedWage = (Integer) payload.get("appliedWage");
        List<Map<String, Object>> rowsMap = (List<Map<String, Object>>) payload.get("rows");

        int totalMin = 0;
        List<AttendanceRecord> recordsToSave = new ArrayList<>();

        for (Map<String, Object> row : rowsMap) {
            AttendanceRecord record = new AttendanceRecord();
            record.setCompanyCode(companyCode);
            record.setEmployeeId(employeeId);
            record.setWorkDate((String) row.get("workDate"));
            record.setInTime((String) row.get("inTime"));
            record.setOutTime((String) row.get("outTime"));
            record.setHours((Integer) row.get("hours"));
            record.setMinutes((Integer) row.get("minutes"));
            record.setWorkCalc((String) row.get("workCalc"));

            totalMin += (record.getHours() != null ? record.getHours() : 0) * 60;
            totalMin += (record.getMinutes() != null ? record.getMinutes() : 0);
            recordsToSave.add(record);
        }

        // 1. 월별 급여 요약(스냅샷) 업데이트/생성
        int totalHours = totalMin / 60;
        int totalSalary = (int) Math.floor((totalMin / 60.0) * appliedWage);

        MonthlySalary ms = monthlySalaryRepository.findByCompanyCodeAndEmployeeIdAndWorkMonth(companyCode, employeeId, month)
                .orElse(new MonthlySalary());
        ms.setCompanyCode(companyCode);
        ms.setEmployeeId(employeeId);
        ms.setWorkMonth(month);
        ms.setAppliedWage(appliedWage);
        ms.setTotalHours(totalHours);
        ms.setTotalSalary(totalSalary);
        monthlySalaryRepository.save(ms);

        // 2. 기존 일별 데이터 삭제 후 재삽입
        attendanceRecordRepository.deleteByCompanyCodeAndEmployeeIdAndWorkDateStartingWith(companyCode, employeeId, month);
        attendanceRecordRepository.saveAll(recordsToSave);
    }
}