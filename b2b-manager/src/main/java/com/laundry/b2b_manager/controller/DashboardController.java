package com.laundry.b2b_manager.controller;

import com.laundry.b2b_manager.repository.DashboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardRepository dashboardRepository;

   @GetMapping("/summary")
    public ResponseEntity<?> getSummary(@RequestParam String companyCode) {
        Map<String, Object> summary = new HashMap<>();
        
        // 1. 전월 및 전전월 매출 조회 (null 방어 로직)
        Long lastMonthSales = dashboardRepository.calculateLastMonthSales(companyCode);
        Long twoMonthsAgoSales = dashboardRepository.calculateTwoMonthsAgoSales(companyCode);
        
        lastMonthSales = (lastMonthSales != null) ? lastMonthSales : 0L;
        twoMonthsAgoSales = (twoMonthsAgoSales != null) ? twoMonthsAgoSales : 0L;

        // 2. 매출 증감률 계산
        double changeRate = 0.0;
        if (twoMonthsAgoSales > 0) {
            changeRate = ((double) (lastMonthSales - twoMonthsAgoSales) / twoMonthsAgoSales) * 100;
        } else if (twoMonthsAgoSales == 0 && lastMonthSales > 0) {
            changeRate = 100.0;
        }
        changeRate = Math.round(changeRate * 10.0) / 10.0;

        // 💡 3. 직원 수 현황 (기존 totalWorkTime 로직 대체)
        long employeeCount = dashboardRepository.countEmployeeByUseYnAndCompanyCode("Y", companyCode);
        
        // 💡 4. 거래처 현황
        long partnerCount = dashboardRepository.countByUseYnAndCompanyCode("Y", companyCode);
        System.out.println("employeeCount"+ employeeCount);
        // 5. 결과 맵핑 (프론트엔드 변수명과 일치)
        summary.put("lastMonthSales", lastMonthSales);
        summary.put("changeRate", changeRate);
        summary.put("employeeCount", employeeCount); // 👉 프론트엔드의 data.employeeCount 로 전달됨
        summary.put("partnerCount", partnerCount); 
        
        return ResponseEntity.ok(summary);
    }

    // 💡 2. 월별 매출 트렌드 API도 회사 코드 필터링 적용
    @GetMapping("/monthly-sales")
    public ResponseEntity<?> getMonthlySales(@RequestParam String companyCode) {
        return ResponseEntity.ok(dashboardRepository.getMonthlySalesTrend(companyCode));
    }

    // 💡 3. 파트너 매출 순위 API도 회사 코드 필터링 적용
    @GetMapping("/partners")
    public ResponseEntity<?> getPartners(@RequestParam String companyCode) {
        Map<String, Object> response = new HashMap<>();
        response.put("partners", dashboardRepository.getTop10PartnerSales(companyCode));
        return ResponseEntity.ok(response);
    }
}