package com.laundry.b2b_manager.entity.work;
import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "daily_work")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DailyWork {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String companyCode;
    private Long partnerId;
    private LocalDate workDate;
    private Integer qty;
}