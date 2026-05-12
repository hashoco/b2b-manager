package com.laundry.b2b_manager.service.auth;

import com.laundry.b2b_manager.entity.auth.Subscription;
import com.laundry.b2b_manager.entity.auth.SubscriptionStatus;
import com.laundry.b2b_manager.repository.auth.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SubscriptionService {
    
    private final SubscriptionRepository subscriptionRepository;

    // 🚀 회원가입 성공 직후에 호출될 메서드
    @Transactional
    public void createTrialSubscription(String companyCode) {
        Subscription subscription = Subscription.builder()
                .companyCode(companyCode)
                .status(SubscriptionStatus.TRIAL) // 상태: 무료체험
                .startDate(LocalDate.now())       // 시작일: 오늘
                .endDate(LocalDate.now().plusDays(30)) // 종료일: 오늘 + 30일
                .updatedAt(LocalDateTime.now())
                .build();

        subscriptionRepository.save(subscription);
    }
}