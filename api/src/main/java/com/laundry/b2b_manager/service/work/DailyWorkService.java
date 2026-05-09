package com.laundry.b2b_manager.service.work;

import com.laundry.b2b_manager.entity.partners.ClientCompany;
import com.laundry.b2b_manager.entity.work.DailyWork;
import com.laundry.b2b_manager.repository.work.DailyWorkRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DailyWorkService {

    private final DailyWorkRepository repository;

    // 1. 월별 수거/배달 데이터 조회
    public List<DailyWork> getMonthList(String companyCode, String yearMonth) {
        YearMonth ym = YearMonth.parse(yearMonth);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        return repository.findByCompanyCodeAndWorkDateBetween(companyCode, start, end);
    }

    // 2. 월별 수거/배달 데이터 일괄 저장 (Upsert)
    @Transactional
    public void saveMonthWork(String companyCode, List<Map<String, Object>> rows) {
        List<DailyWork> worksToSave = new ArrayList<>();

        for (Map<String, Object> row : rows) {
            Long partnerId = Long.valueOf(row.get("partnerId").toString());
            LocalDate date = LocalDate.parse(row.get("workDate").toString());
            Integer qty = Integer.valueOf(row.get("qty").toString());

            // 기존 데이터가 있으면 가져오고, 없으면 새로 생성
            DailyWork work = repository.findByCompanyCodeAndPartnerIdAndWorkDate(companyCode, partnerId, date)
                    .orElse(new DailyWork());
            
            work.setCompanyCode(companyCode);
            work.setPartnerId(partnerId);
            work.setWorkDate(date);
            work.setQty(qty);

            worksToSave.add(work);
        }

        // 반복문 안에서 매번 save() 하지 않고, 모아서 한 번에 saveAll() 처리하여 성능 최적화
        repository.saveAll(worksToSave);
    }

    public List<ClientCompany> getSortedPartners(String companyCode) {
        return repository.findAllActivePartnersSorted(companyCode);
    }

}