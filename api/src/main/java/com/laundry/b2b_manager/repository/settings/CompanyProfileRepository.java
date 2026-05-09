package com.laundry.b2b_manager.repository.settings;

import org.springframework.data.jpa.repository.JpaRepository;

import com.laundry.b2b_manager.entity.settings.CompanyProfile;

import java.util.Optional;

public interface CompanyProfileRepository extends JpaRepository<CompanyProfile, Long> {
    Optional<CompanyProfile> findByCompanyCode(String companyCode);
}