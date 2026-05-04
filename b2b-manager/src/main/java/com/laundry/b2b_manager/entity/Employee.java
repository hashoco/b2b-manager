package com.laundry.b2b_manager.entity;


import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "employee")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Employee {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String companyCode;
    private String name;
    private String insurance;
    private String phone;
    private Integer wage;
    private String note;
    private String useYn;
}