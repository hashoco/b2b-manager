package com.laundry.b2b_manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.laundry.b2b_manager.service.AttendanceService;
@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/read")
    public ResponseEntity<?> readAttendance(@RequestBody Map<String, String> params) {
        String companyCode = params.get("companyCode");
        String month = params.get("month");

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        
        response.put("rows", attendanceService.getAttendanceList(companyCode, month)); 
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveAttendance(@RequestBody Map<String, Object> payload) {
        try {
            String companyCode = (String) payload.get("companyCode");
            String month = (String) payload.get("month");
            List<Map<String, Object>> rows = (List<Map<String, Object>>) payload.get("rows");

            // 여기서 saveAttendanceList 호출!
            attendanceService.saveAttendanceList(companyCode, month, rows); 

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}