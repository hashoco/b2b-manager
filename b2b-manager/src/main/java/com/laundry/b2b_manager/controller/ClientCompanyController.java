package com.laundry.b2b_manager.controller;

import com.laundry.b2b_manager.entity.ClientCompany;
import com.laundry.b2b_manager.repository.ClientCompanyRepository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/partners")
@CrossOrigin(origins = "http://localhost:3000")
public class ClientCompanyController {

    private final ClientCompanyRepository repository;

    public ClientCompanyController(ClientCompanyRepository repository) {
        this.repository = repository;
    }

    // 1. 거래처 목록 조회 (내 법인코드 기준)
    @GetMapping("/list")
    public Map<String, Object> getList(@RequestParam String companyCode) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        // 내 법인코드에 해당하는 거래처만 조회!
        response.put("partners", repository.findByCompanyCode(companyCode));
        return response;
    }

    // 2. 거래처 등록 및 수정
    @PostMapping("/save")
    public Map<String, Object> savePartner(@RequestBody ClientCompany partner) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 방어 로직: 법인 코드가 비어있으면 거절
            if (partner.getCompanyCode() == null || partner.getCompanyCode().isEmpty()) {
                throw new RuntimeException("법인 코드가 누락되었습니다.");
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

            repository.save(partner);
            response.put("success", true);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return response;
    }
}