package com.laundry.b2b_manager.entity.hr;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity 
@Table(name = "employee")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class Employee {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String companyCode;
    private String name;
    private String insurance;
    private String phone;
    private Integer wage;
    
    
    private LocalDate joinDate;  
    private LocalDate resignDate; 
    
    private String note;
    private String useYn;
}