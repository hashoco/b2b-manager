package com.laundry.b2b_manager.controller;

import com.laundry.b2b_manager.service.DailyWorkService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/daily")
@RequiredArgsConstructor
public class DailyWorkController {

    private final DailyWorkService dailyWorkService;

    // 1. 조회
    @GetMapping("/list-month")
    public Map<String, Object> getMonthList(@RequestParam String companyCode, @RequestParam String yearMonth) {
        Map<String, Object> res = new HashMap<>();
        try {
            res.put("success", true);
            // 비즈니스 로직(날짜 계산, DB 조회)은 서비스에 위임
            res.put("rows", dailyWorkService.getMonthList(companyCode, yearMonth));
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", e.getMessage());
        }
        return res;
    }

    // 2. 저장
    @PostMapping("/save-month")
    public Map<String, Object> saveMonth(@RequestBody Map<String, Object> payload) {
        Map<String, Object> res = new HashMap<>();
        try {
            String companyCode = (String) payload.get("companyCode");
            List<Map<String, Object>> rows = (List<Map<String, Object>>) payload.get("rows");

            // 데이터 변환 및 저장 로직은 서비스에 위임
            dailyWorkService.saveMonthWork(companyCode, rows);

            res.put("success", true);
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "저장 중 오류가 발생했습니다: " + e.getMessage());
        }
        return res;
    }
}