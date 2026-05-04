package com.laundry.b2b_manager.entity;


import jakarta.persistence.*;
import lombok.*;


@Entity @Table(name = "monthly_salary")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MonthlySalary {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String companyCode;
    private Long employeeId;
    private String workMonth;
    private Integer appliedWage;
    private Integer totalHours;
    private Integer totalSalary;
}