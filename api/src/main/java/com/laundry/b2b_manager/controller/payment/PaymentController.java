package com.laundry.b2b_manager.controller.payment;

import com.laundry.b2b_manager.service.payment.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/confirm")
    public ResponseEntity<Map<String, Object>> confirmPayment(@RequestBody Map<String, Object> payload) {
        String paymentKey = (String) payload.get("paymentKey");
        String orderId = (String) payload.get("orderId");
        Long amount = Long.valueOf(payload.get("amount").toString());
        String companyCode = (String) payload.get("companyCode");

        boolean isSuccess = paymentService.confirmPayment(paymentKey, orderId, amount, companyCode);

        Map<String, Object> response = new HashMap<>();
        if (isSuccess) {
            response.put("success", true);
            response.put("message", "결제 및 구독 연장이 완료되었습니다.");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "결제 검증에 실패했습니다.");
            return ResponseEntity.badRequest().body(response);
        }
    }
}