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
        
        // 💡 1. 모든 Repository 메서드 호출 시 companyCode 파라미터 전달
        Long lastMonthSales = dashboardRepository.calculateLastMonthSales(companyCode);
        Long twoMonthsAgoSales = dashboardRepository.calculateTwoMonthsAgoSales(companyCode);
        
        // null 방어 로직 추가 (DB에 데이터가 아예 없을 경우 에러 방지)
        lastMonthSales = (lastMonthSales != null) ? lastMonthSales : 0L;
        twoMonthsAgoSales = (twoMonthsAgoSales != null) ? twoMonthsAgoSales : 0L;

        double changeRate = 0.0;
        if (twoMonthsAgoSales > 0) {
            // 공식: ((전월 - 전전월) / 전전월) * 100
            changeRate = ((double) (lastMonthSales - twoMonthsAgoSales) / twoMonthsAgoSales) * 100;
        } else if (twoMonthsAgoSales == 0 && lastMonthSales > 0) {
            changeRate = 100.0;
        }
        changeRate = Math.round(changeRate * 10.0) / 10.0;

        // 💡 companyCode 전달
        String totalWorkTime = dashboardRepository.calculateLastMonthTotalWorkTime(companyCode);
        
        // 데이터가 아예 없을 경우의 예외 처리
        if (totalWorkTime == null) {
            totalWorkTime = "0시간 00분";
        }
        
        summary.put("totalWorkTime", totalWorkTime); 
        summary.put("lastMonthSales", lastMonthSales);
        summary.put("changeRate", changeRate);
        
        // 💡 countByUseYn 메서드도 회사코드 필터링이 들어간 메서드로 변경
        summary.put("partnerCount", dashboardRepository.countByUseYnAndCompanyCode("Y", companyCode)); 
        
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