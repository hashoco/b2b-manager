package com.laundry.b2b_manager.entity.hr;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "attendance_record")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AttendanceRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String companyCode;
    private Long employeeId;
    private String workDate;
    private String inTime;
    private String outTime;
    private Integer hours;
    private Integer minutes;
    private String workCalc;
}