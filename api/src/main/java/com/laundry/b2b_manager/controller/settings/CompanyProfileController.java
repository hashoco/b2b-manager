package com.laundry.b2b_manager.controller.settings;

import com.laundry.b2b_manager.entity.settings.CompanyProfile;
import com.laundry.b2b_manager.service.settings.CompanyProfileService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/settings/company")
@RequiredArgsConstructor
public class CompanyProfileController {

    private final CompanyProfileService service;

    // 조회 API
    @GetMapping
    public Map<String, Object> getProfile(@RequestParam String companyCode) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("profile", service.getProfile(companyCode));
        return response;
    }

    // 저장 API
    @PostMapping("/save")
    public Map<String, Object> saveProfile(@RequestBody CompanyProfile profile) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.saveProfile(profile);
            response.put("success", true);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return response;
    }
}