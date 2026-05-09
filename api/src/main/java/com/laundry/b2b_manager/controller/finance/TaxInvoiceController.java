package com.laundry.b2b_manager.controller.finance;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.laundry.b2b_manager.service.finance.TaxInvoiceService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tax")
@RequiredArgsConstructor
public class TaxInvoiceController {

    private final TaxInvoiceService taxInvoiceService;

    @PostMapping("/list")
    public ResponseEntity<?> getTaxList(@RequestBody Map<String, String> requestData) {
        String startDate = requestData.get("startDate");
        String endDate = requestData.get("endDate");

        // 1. 서비스에 정산 데이터 조회 요청
        List<Map<String, Object>> list = taxInvoiceService.getTaxInvoiceList(startDate, endDate);

        // 2. 프론트엔드 TaxInvoice.jsx가 기대하는 형태({ "list": [...] })로 응답
        Map<String, Object> response = new HashMap<>();
        response.put("list", list);

        return ResponseEntity.ok(response);
    }
}