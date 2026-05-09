package com.laundry.b2b_manager.service.finance;

import com.laundry.b2b_manager.entity.finance.ProfitReport;
import com.laundry.b2b_manager.entity.finance.ProfitReportDetail;
import com.laundry.b2b_manager.entity.partners.ClientCompany;
import com.laundry.b2b_manager.entity.work.DailyWork;
import com.laundry.b2b_manager.repository.finance.ProfitReportRepository;
import com.laundry.b2b_manager.repository.partners.ClientCompanyRepository;
import com.laundry.b2b_manager.repository.work.DailyWorkRepository;
import com.laundry.b2b_manager.service.hr.AttendanceService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfitReportService {

    private final ProfitReportRepository profitReportRepository;
    private final DailyWorkRepository dailyWorkRepository;
    private final ClientCompanyRepository clientCompanyRepository;
    
    // 🚀 인건비 산출을 위해 기존 근태 서비스를 주입받습니다.
    private final AttendanceService attendanceService;

    /**
     * 1. 레포트 저장 로직
     */
    @Transactional
    public void saveReport(Map<String, Object> payload) {
        String companyCode = String.valueOf(payload.get("companyCode"));
        String month = String.valueOf(payload.get("month"));
        
        Long sales = Long.valueOf(String.valueOf(payload.get("sales")));
        Long labor = Long.valueOf(String.valueOf(payload.get("labor")));
        Long netProfit = Long.valueOf(String.valueOf(payload.get("netProfit")));

        ProfitReport report = profitReportRepository
                .findByCompanyCodeAndReportMonth(companyCode, month)
                .orElse(new ProfitReport());

        report.setCompanyCode(companyCode);
        report.setReportMonth(month);
        report.setTotalSales(sales);
        report.setTotalLabor(labor);
        report.setNetProfit(netProfit);

        if (report.getDetails() != null) {
            report.getDetails().clear();
        }

        List<Map<String, Object>> manualExpenses = (List<Map<String, Object>>) payload.get("manualExpenses");
        
        if (manualExpenses != null) {
            for (Map<String, Object> exp : manualExpenses) {
                ProfitReportDetail detail = ProfitReportDetail.builder()
                        .categoryName(String.valueOf(exp.get("name")))
                        .amount(Long.valueOf(String.valueOf(exp.get("amount"))))
                        .build();
                report.addDetail(detail);
            }
        }

        profitReportRepository.save(report);
    }

    /**
     * 2. 레포트 조회 로직
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getReport(String companyCode, String month) {
        Map<String, Object> response = new HashMap<>();
        
        Optional<ProfitReport> optReport = profitReportRepository.findByCompanyCodeAndReportMonth(companyCode, month);
        
        if (optReport.isPresent()) {
            ProfitReport report = optReport.get();
            response.put("success", true);
            response.put("sales", report.getTotalSales());
            response.put("labor", report.getTotalLabor());
            
            List<Map<String, Object>> expenses = report.getDetails().stream().map(d -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", d.getId());
                map.put("name", d.getCategoryName());
                map.put("amount", d.getAmount());
                return map;
            }).collect(Collectors.toList());
            
            response.put("manualExpenses", expenses);
        } else {
            response.put("success", false);
        }
        return response;
    }

    /**
     * 3. 시스템 데이터 동기화 (인건비 및 매출액 실시간 산출)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> syncSystemData(String companyCode, String month) {
        Map<String, Object> response = new HashMap<>();

        // ==========================================
        // [1] 인건비 합산 (기존 AttendanceService 활용)
        // ==========================================
        Long totalLabor = 0L;
        
        // 근태 서비스에서 해당 월의 모든 직원 급여 리스트를 가져옵니다.
        // name = "", useYn = "Y" 등 기본값으로 전체 조회
         List<Map<String, Object>> laborRows = attendanceService.getMasterList(companyCode, month, "", "ALL");
        
        if (laborRows != null) {
            for (Map<String, Object> row : laborRows) {
                // MonthlySalary 엔티티의 totalSalary 필드와 매핑된 Key값을 합산합니다.
                Object salaryObj = row.get("totalSalary");
                if (salaryObj != null) {
                    totalLabor += Long.parseLong(String.valueOf(salaryObj));
                }
            }
        }

      // [2] 매출액 산출 (store_type별 계산)
    Long totalSales = 0L;
    YearMonth yearMonth = YearMonth.parse(month);
    LocalDate startDate = yearMonth.atDay(1);
    LocalDate endDate = yearMonth.atEndOfMonth();

    // 해당 월의 작업 데이터 조회
    List<DailyWork> dailyWorks = dailyWorkRepository.findByCompanyCodeAndWorkDateBetween(companyCode, startDate, endDate);

    // 🚀 거래처별로 총 수량을 먼저 그룹화 (Map<PartnerID, TotalQty>)
    Map<Long, Integer> partnerQtyMap = dailyWorks.stream()
            .collect(Collectors.groupingBy(DailyWork::getPartnerId, 
                    Collectors.summingInt(dw -> dw.getQty() != null ? dw.getQty() : 0)));

    for (Long partnerId : partnerQtyMap.keySet()) {
        Optional<ClientCompany> optCompany = clientCompanyRepository.findById(partnerId);
        
        if (optCompany.isPresent()) {
            ClientCompany company = optCompany.get();
            int expectedAmount = company.getExpectedAmount() != null ? company.getExpectedAmount() : 0; // 단가 혹은 월정액
            long partnerRevenue = 0;

            // 💡 store_type에 따른 분기 처리
            if ("MONTH".equalsIgnoreCase(company.getStoreType())) {
                // 월별(MONTH): 작업이 있으면 수량 무관하게 고정금액 적용
                partnerRevenue = (long) expectedAmount;
            } else if ("BAG".equalsIgnoreCase(company.getStoreType())) {
                // 건당(BAG): 총 수량 * 단가 계산
                int totalQty = partnerQtyMap.get(partnerId);
                partnerRevenue = (long) totalQty * expectedAmount;
            }

            // 부가세 여부 적용
            if ("Y".equalsIgnoreCase(company.getVatYn())) {
                partnerRevenue = (long) Math.floor(partnerRevenue * 1.1);
            }
            
            totalSales += partnerRevenue;
        }
    }

    response.put("success", true);
    response.put("labor", totalLabor);
    response.put("sales", totalSales);

    return response;
    }
}