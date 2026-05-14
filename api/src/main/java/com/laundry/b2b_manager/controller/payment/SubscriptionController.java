package com.laundry.b2b_manager.controller.payment;

import com.laundry.b2b_manager.entity.auth.PaymentHistory;

import com.laundry.b2b_manager.repository.payment.PaymentHistoryRepository; 
import com.laundry.b2b_manager.repository.auth.SubscriptionRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionRepository subscriptionRepository;
    private final PaymentHistoryRepository paymentHistoryRepository;

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getSubscriptionInfo(@RequestParam String companyCode) {
        Map<String, Object> response = new HashMap<>();

        // 1. 현재 구독 만료일 조회
        subscriptionRepository.findByCompanyCode(companyCode).ifPresent(sub -> {
            response.put("endDate", sub.getEndDate());
            response.put("status", sub.getStatus());
        });

        // 2. 결제 영수증 내역 조회 (최신순)
        List<PaymentHistory> history = paymentHistoryRepository.findByCompanyCodeOrderByApprovedAtDesc(companyCode);
        response.put("paymentHistory", history);

        return ResponseEntity.ok(response);
    }
}