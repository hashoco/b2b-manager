package com.laundry.b2b_manager.service.payment;

import com.laundry.b2b_manager.entity.auth.PaymentHistory;
import com.laundry.b2b_manager.entity.auth.Subscription;
import com.laundry.b2b_manager.entity.auth.SubscriptionStatus;
import com.laundry.b2b_manager.repository.payment.PaymentHistoryRepository;
import com.laundry.b2b_manager.repository.auth.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final SubscriptionRepository subscriptionRepository;
    private final PaymentHistoryRepository paymentHistoryRepository;

    @Value("${toss.secret-key}")
    private String tossSecretKey;

    @Transactional
    public boolean confirmPayment(String paymentKey, String orderId, Long amount, String companyCode) {
        // 1. 토스페이먼츠 승인 API 호출 준비
        System.out.println("토스 시크릿 키 확인: [" + tossSecretKey + "]");
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://api.tosspayments.com/v1/payments/confirm";

        // 시크릿 키 뒤에 콜론(:)을 붙여 Base64로 인코딩해야 합니다 (토스 권장 방식)
        String encodedAuthKey = Base64.getEncoder().encodeToString((tossSecretKey + ":").getBytes(StandardCharsets.UTF_8));

        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(encodedAuthKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("paymentKey", paymentKey);
        requestBody.put("orderId", orderId);
        requestBody.put("amount", amount);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            // 2. 토스 서버에 승인 요청!
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                // 3. 승인 성공 시: 영수증(PaymentHistory) 저장
                PaymentHistory history = PaymentHistory.builder()
                        .companyCode(companyCode)
                        .paymentKey(paymentKey)
                        .orderId(orderId)
                        .amount(amount)
                        .method((String) response.getBody().get("method"))
                        .approvedAt(LocalDateTime.now())
                        .build();
                paymentHistoryRepository.save(history);

                // 4. 구독(Subscription) 기간 1달 연장
                Subscription sub = subscriptionRepository.findByCompanyCode(companyCode)
                        .orElseThrow(() -> new IllegalArgumentException("구독 정보가 없습니다."));

                LocalDate today = LocalDate.now();
                LocalDate currentEndDate = sub.getEndDate();
                
                // 만료일이 이미 지났다면 오늘부터 1달, 아직 남았다면 남은 기간 + 1달 연장
                LocalDate newStartDate = currentEndDate.isBefore(today) ? today : currentEndDate;
                sub.setEndDate(newStartDate.plusMonths(1));
                sub.setStatus(SubscriptionStatus.ACTIVE); // 상태를 ACTIVE로 변경
                sub.setUpdatedAt(LocalDateTime.now());
                
                subscriptionRepository.save(sub);
                return true;
            }
        } catch (Exception e) {
            System.err.println("결제 승인 실패: " + e.getMessage());
            return false;
        }
        return false;
    }
}