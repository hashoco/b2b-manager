package com.laundry.b2b_manager.service.settings;

import com.laundry.b2b_manager.entity.settings.CompanyProfile;
import com.laundry.b2b_manager.repository.settings.CompanyProfileRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompanyProfileService {

    private final CompanyProfileRepository repository;

    // 정보 조회
    public CompanyProfile getProfile(String companyCode) {
        return repository.findByCompanyCode(companyCode)
                .orElse(new CompanyProfile()); // 없으면 빈 객체 반환
    }

    // 정보 저장 (Upsert)
    @Transactional
    public void saveProfile(CompanyProfile dto) {
        CompanyProfile profile = repository.findByCompanyCode(dto.getCompanyCode())
                .orElse(new CompanyProfile());

        profile.setCompanyCode(dto.getCompanyCode());
        profile.setBizRegNo(dto.getBizRegNo());
        profile.setCompanyName(dto.getCompanyName());
        profile.setOwnerName(dto.getOwnerName());
        profile.setEmail(dto.getEmail());

        repository.save(profile);
    }
}