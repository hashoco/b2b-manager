package com.laundry.b2b_manager.repository.auth;

import com.laundry.b2b_manager.entity.auth.PaymentHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentHistoryRepository extends JpaRepository<PaymentHistory, Long> {
    // 기본 저장 기능만 사용할 것이므로 안은 비워두셔도 됩니다.
}