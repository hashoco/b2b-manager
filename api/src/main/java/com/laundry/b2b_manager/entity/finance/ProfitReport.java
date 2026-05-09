package com.laundry.b2b_manager.entity.finance;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity 
@Table(name = "profit_report")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProfitReport {
    
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String companyCode;
    private String reportMonth;
    private Long totalSales;
    private Long totalLabor;
    private Long netProfit;

    // 디테일(항목)들을 마스터와 함께 저장/삭제하도록 완벽 종속 처리
    @Builder.Default
    @OneToMany(mappedBy = "profitReport", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProfitReportDetail> details = new ArrayList<>();

    // 연관관계 편의 메서드
    public void addDetail(ProfitReportDetail detail) {
        this.details.add(detail);
        detail.setProfitReport(this);
    }
}