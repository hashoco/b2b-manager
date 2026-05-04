package com.laundry.b2b_manager.service;

import com.laundry.b2b_manager.entity.Attendance;
import com.laundry.b2b_manager.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;

    public List<Attendance> getAttendanceList(String companyCode, String month) {
        return attendanceRepository.findByCompanyCodeAndWorkDateStartingWithOrderByWorkDateAsc(companyCode, month);
    }

    // 🚀 수정된 저장 로직: 완벽한 기존 데이터 삭제 후 신규 Insert 보장
    @Transactional
    public void saveAttendanceList(String companyCode, String month, List<Map<String, Object>> rowsData) {
        
        // 1. 해당 월의 기존 데이터를 조건 없이 전부 삭제합니다.
        attendanceRepository.deleteByCompanyCodeAndWorkDateStartingWith(companyCode, month);

        // 2. 삭제 후 1차 캐시를 비워주어 영속성 컨텍스트를 깔끔하게 만듭니다. (JPA 버그 방지)
        attendanceRepository.flush();

        // 3. 새로운 데이터를 세팅합니다.
        List<Attendance> entities = rowsData.stream().map(data -> {
            Attendance a = new Attendance();
            // id 필드는 세팅하지 않습니다. (자동 증가되어 완벽하게 신규 Insert로 동작함)
            
            a.setCompanyCode(companyCode);
            
            // 🔥 핵심: 리액트에서 date로 보내든 workDate로 보내든 모두 잡아냅니다.
            String targetDate = data.containsKey("date") ? 
                                (String) data.get("date") : 
                                (String) data.get("workDate");
            
            // 만약 날짜가 비어있다면 무시 (데이터 증발 방지)
            if (targetDate == null || targetDate.trim().isEmpty()) {
                return null;
            }
            a.setWorkDate(targetDate);
            a.setInTime((String) data.get("inTime"));
            a.setOutTime((String) data.get("outTime"));
            a.setWorkCalc((String) data.get("workCalc"));
            
            // null 방어 로직 추가
            a.setHours(data.get("hours") != null ? Integer.parseInt(String.valueOf(data.get("hours"))) : 0);
            a.setMinutes(data.get("minutes") != null ? Integer.parseInt(String.valueOf(data.get("minutes"))) : 0);
            
            return a;
        }).filter(a -> a != null).collect(Collectors.toList());

        // 4. 일괄 Insert 실행
        attendanceRepository.saveAll(entities);
    }
}