package com.laundry.b2b_manager.controller.partners;

import com.laundry.b2b_manager.entity.partners.ClientCompany;
import com.laundry.b2b_manager.service.partners.ClientCompanyService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/partners")
@RequiredArgsConstructor
public class ClientCompanyController {

    private final ClientCompanyService clientCompanyService;

    // 1. 거래처 목록 조회 (내 법인코드 기준)
    @GetMapping("/list")
    public Map<String, Object> getList(@RequestParam String companyCode) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        // 서비스에 조회를 위임
        response.put("partners", clientCompanyService.getPartnersByCompanyCode(companyCode));
        return response;
    }

    // 2. 거래처 등록 및 수정
    @PostMapping("/save")
    public Map<String, Object> savePartner(@RequestBody ClientCompany partner) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 서비스에 검증 및 저장 위임
            clientCompanyService.savePartner(partner);
            
            response.put("success", true);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return response;
    }
}