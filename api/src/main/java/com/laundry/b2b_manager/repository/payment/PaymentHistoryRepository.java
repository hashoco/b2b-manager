package com.laundry.b2b_manager.repository.payment;


import com.laundry.b2b_manager.entity.auth.PaymentHistory; 
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentHistoryRepository extends JpaRepository<PaymentHistory, Long> {
    
    // 이 한 줄만 적어두면 스프링 부트가 알아서 구현체(body)를 만들어줍니다.
    List<PaymentHistory> findByCompanyCodeOrderByApprovedAtDesc(String companyCode);
    
}