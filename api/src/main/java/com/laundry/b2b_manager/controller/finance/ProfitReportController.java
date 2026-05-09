package com.laundry.b2b_manager.controller.finance;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.laundry.b2b_manager.service.finance.ProfitReportService;

import java.util.Map;

@RestController
@RequestMapping("/api/profit")
@RequiredArgsConstructor
public class ProfitReportController {

    private final ProfitReportService profitReportService;

    // 1. 레포트 조회 API
    @GetMapping("/read")
    public Map<String, Object> readReport(
            @RequestParam String companyCode, 
            @RequestParam String month) {
        return profitReportService.getReport(companyCode, month);
    }

    // 2. 레포트 저장 API (DTO 대신 Map 사용)
    @PostMapping("/save")
    public Map<String, Object> saveReport(@RequestBody Map<String, Object> payload) {
        profitReportService.saveReport(payload);
        return Map.of("success", true);
    }

    @GetMapping("/sync")
    public Map<String, Object> syncReport(
            @RequestParam String companyCode, 
            @RequestParam String month) {
        return profitReportService.syncSystemData(companyCode, month);
    }
}
