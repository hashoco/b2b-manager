package com.laundry.b2b_manager.entity.hr;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "attendance")
@Getter @Setter
@NoArgsConstructor
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyCode; // 업체 코드
    private String workDate;    // 날짜 (YYYY-MM-DD)
    private String inTime;      // 출근시간 (HH:mm)
    private String outTime;     // 퇴근시간 (HH:mm)
    private String workCalc;    // 계산된 시간 (X시간 Y분)
    private int hours;          // 시간 정수값
    private int minutes;        // 분 정수값
}