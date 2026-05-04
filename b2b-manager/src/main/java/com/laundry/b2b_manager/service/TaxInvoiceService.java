package com.laundry.b2b_manager.service;

import com.laundry.b2b_manager.repository.TaxInvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TaxInvoiceService {

    private final TaxInvoiceRepository taxInvoiceRepository;

    public List<Map<String, Object>> getTaxInvoiceList(String startDate, String endDate) {
        // Repository에서 네이티브 쿼리로 계산된 Map 리스트를 바로 반환
        return taxInvoiceRepository.findTaxInvoices(startDate, endDate);
    }
}