package com.laundry.b2b_manager.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity 
@Table(name = "profit_report_detail")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProfitReportDetail {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    private ProfitReport profitReport;

    private String categoryName;
    private Long amount;
}