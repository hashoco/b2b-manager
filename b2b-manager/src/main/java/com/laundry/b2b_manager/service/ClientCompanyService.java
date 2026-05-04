package com.laundry.b2b_manager.service;

import com.laundry.b2b_manager.entity.ClientCompany;
import com.laundry.b2b_manager.repository.ClientCompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ClientCompanyService {

    private final ClientCompanyRepository repository;

    // 1. 거래처 목록 조회
    public List<ClientCompany> getPartnersByCompanyCode(String companyCode) {
        return repository.findByCompanyCode(companyCode);
    }

    // 2. 거래처 등록 및 수정 로직
    @Transactional // 저장 중 오류 발생 시 롤백되도록 트랜잭션 처리
    public void savePartner(ClientCompany partner) {
        // 방어 로직: 법인 코드가 비어있으면 거절
        if (partner.getCompanyCode() == null || partner.getCompanyCode().trim().isEmpty()) {
            throw new IllegalArgumentException("법인 코드가 누락되었습니다.");
        }

        // 신규 등록일 경우 (자동 채번)
        if (partner.getPartnerCode() == null || partner.getPartnerCode().trim().isEmpty()) {
            // 내 법인 소속의 최신 거래처 조회
            ClientCompany lastPartner = repository.findTopByCompanyCodeOrderByIdDesc(partner.getCompanyCode());
            int nextNum = 1;
            if (lastPartner != null && lastPartner.getPartnerCode() != null) {
                nextNum = Integer.parseInt(lastPartner.getPartnerCode().replace("P", "")) + 1;
            }
            partner.setPartnerCode(String.format("P%03d", nextNum));
        } else {
            // 기존 데이터 수정일 경우 (내 법인의 해당 코드 데이터가 맞는지 확인)
            Optional<ClientCompany> existing = repository.findByCompanyCodeAndPartnerCode(
                    partner.getCompanyCode(), partner.getPartnerCode());
            existing.ifPresent(e -> partner.setId(e.getId()));
        }

        // 최종 저장
        repository.save(partner);
    }
}