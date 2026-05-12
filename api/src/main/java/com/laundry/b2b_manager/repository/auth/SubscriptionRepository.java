package com.laundry.b2b_manager.repository.auth;

import com.laundry.b2b_manager.entity.auth.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    // 나중에 거래처 코드로 구독 정보를 찾기 위해 추가해 둡니다.
    Optional<Subscription> findByCompanyCode(String companyCode);
}