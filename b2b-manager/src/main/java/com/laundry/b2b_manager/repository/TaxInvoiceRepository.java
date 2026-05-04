package com.laundry.b2b_manager.repository;

import com.laundry.b2b_manager.entity.ClientCompany; // (주의) 실제 프로젝트의 엔티티명 확인
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface TaxInvoiceRepository extends JpaRepository<ClientCompany, Long> {

    @Query(value = """
        SELECT * FROM (
            SELECT 
                c.partner_name AS partnerName,
                c.biz_reg_no AS bizRegNo,
                c.owner_name AS ownerName,
                c.vat_yn AS vatYn,
                
                CAST(
                    CASE 
                        WHEN c.store_type = 'MONTH' THEN COALESCE(c.expected_amount, 0)
                        ELSE COALESCE(dw.total_qty, 0) * COALESCE(c.delivery_fee, 0)
                    END AS SIGNED
                ) AS totalAmount,
                
                CAST(
                    CASE 
                        WHEN c.vat_yn = 'Y' THEN 
                            (CASE 
                                WHEN c.store_type = 'MONTH' THEN COALESCE(c.expected_amount, 0)
                                ELSE COALESCE(dw.total_qty, 0) * COALESCE(c.delivery_fee, 0)
                            END) * 0.1
                        ELSE 0 
                    END AS SIGNED
                ) AS taxAmount
                
            FROM client_company c
            
            JOIN (
                SELECT partner_id, SUM(qty) AS total_qty
                FROM daily_work
                WHERE work_date BETWEEN :startDate AND :endDate
                GROUP BY partner_id
                having SUM(qty) <> 0
            ) dw ON c.id = dw.partner_id
            
            WHERE c.use_yn = 'Y' 
              AND c.partner_name IS NOT NULL
        ) result
        
        WHERE result.totalAmount > 0
        """, nativeQuery = true)
    List<Map<String, Object>> findTaxInvoices(@Param("startDate") String startDate, @Param("endDate") String endDate);
}