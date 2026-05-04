package com.laundry.b2b_manager.repository;

import com.laundry.b2b_manager.entity.ClientCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param; // 💡 Param 임포트 필수!

import java.util.List;
import java.util.Map;

public interface DashboardRepository extends JpaRepository<ClientCompany, Long> {

    long countByUseYnAndCompanyCode(String useYn, String companyCode);
    // 2. 월별 매출 추이 (최근 12개월)
    @Query(value = """
        SELECT 
            dw.work_month AS month,
            COALESCE(CAST(SUM(
                (CASE
                    WHEN c.store_type = 'MONTH' THEN c.expected_amount
                    ELSE dw.total_qty * c.delivery_fee
                END) 
                * (CASE WHEN c.vat_yn = 'Y' THEN 1.1 ELSE 1.0 END)
            ) AS SIGNED), 0) AS amount
        FROM client_company c
        JOIN (
            SELECT 
                partner_id, 
                DATE_FORMAT(work_date, '%Y-%m') AS work_month,
                SUM(qty) AS total_qty
            FROM daily_work
            WHERE work_date >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 12 MONTH), '%Y-%m-01')
              AND work_date < DATE_FORMAT(NOW(), '%Y-%m-01')
            GROUP BY partner_id, DATE_FORMAT(work_date, '%Y-%m')
            HAVING SUM(qty) <> 0
        ) dw ON c.id = dw.partner_id
        WHERE c.use_yn = 'Y'
        AND c.company_code = :companyCode
        -- 2. 메인쿼리: 월별로 최종 매출액 합산
        GROUP BY dw.work_month
        ORDER BY dw.work_month ASC
        """, nativeQuery = true)
    List<Map<String, Object>> getMonthlySalesTrend(@Param("companyCode") String companyCode);

    // 3. 전월 총 매출액 계산 
    @Query(value = """
        SELECT COALESCE(CAST(SUM(
            (CASE
                WHEN c.store_type = 'MONTH' THEN c.expected_amount
                ELSE dw.total_qty * c.delivery_fee
            END) 
            * (CASE WHEN c.vat_yn = 'Y' THEN 1.1 ELSE 1.0 END)
        ) AS SIGNED), 0)
        FROM client_company c
        JOIN (
            SELECT partner_id, SUM(qty) AS total_qty
            FROM daily_work
            WHERE work_date >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
              AND work_date < DATE_FORMAT(NOW(), '%Y-%m-01')
            GROUP BY partner_id 
            HAVING SUM(qty) <> 0
        ) dw ON c.id = dw.partner_id
        WHERE c.use_yn = 'Y'
          AND c.company_code = :companyCode
        """, nativeQuery = true)
    Long calculateLastMonthSales(@Param("companyCode") String companyCode);


    // 4. 전전월 총 매출액 계산 (증감률 계산용)
    @Query(value = """
        SELECT COALESCE(CAST(SUM(
            (CASE
                WHEN c.store_type = 'MONTH' THEN c.expected_amount
                ELSE dw.total_qty * c.delivery_fee
            END) 
            * (CASE WHEN c.vat_yn = 'Y' THEN 1.1 ELSE 1.0 END)
        ) AS SIGNED), 0)
        FROM client_company c
        JOIN (
            SELECT partner_id, SUM(qty) AS total_qty
            FROM daily_work
            -- 💡 2개월 전 1일부터 ~ 1개월 전 1일 직전(말일)까지
            WHERE work_date >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 2 MONTH), '%Y-%m-01')
              AND work_date < DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
            GROUP BY partner_id 
            HAVING SUM(qty) <> 0
        ) dw ON c.id = dw.partner_id
        WHERE c.use_yn = 'Y'
          AND c.company_code = :companyCode
        """, nativeQuery = true)
    Long calculateTwoMonthsAgoSales(@Param("companyCode") String companyCode);

   // 5. [동적 쿼리] 현재 시점 기준 "전월(지난달)" 총 근무시간 계산
    @Query(value = """
        SELECT 
            CONCAT(
                COALESCE(SUM(hours), 0) + FLOOR(COALESCE(SUM(minutes), 0) / 60), 
                '시간 ', 
                LPAD(COALESCE(SUM(minutes), 0) % 60, 2, '0'), 
                '분'
            ) AS totalWorkTime
        FROM attendance
        -- 💡 오늘이 5월이면 자동으로 4월 1일 ~ 5월 1일 미만 데이터를 조회합니다.
        WHERE work_date >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
          AND work_date < DATE_FORMAT(NOW(), '%Y-%m-01')
          AND company_code = :companyCode  
        """, nativeQuery = true)
    String calculateLastMonthTotalWorkTime(@Param("companyCode") String companyCode);

    // 6. 거래처별 매출 기여도 TOP 10 (자동 전월 기준)
    @Query(value = """
        SELECT 
            c.partner_name AS name,
            COALESCE(CAST((
                CASE 
                    WHEN c.store_type = 'MONTH' THEN c.expected_amount
                    ELSE dw.total_qty * c.delivery_fee 
                END
            ) * (CASE WHEN c.vat_yn = 'Y' THEN 1.1 ELSE 1.0 END) AS SIGNED), 0) AS value
        FROM client_company c
        JOIN (
            
            SELECT partner_id, SUM(qty) AS total_qty
            FROM daily_work
            WHERE work_date >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
              AND work_date < DATE_FORMAT(NOW(), '%Y-%m-01')
            GROUP BY partner_id
            HAVING SUM(qty) <> 0
        ) dw ON c.id = dw.partner_id
        WHERE c.use_yn = 'Y'
        AND c.company_code = :companyCode
        ORDER BY value DESC
        LIMIT 10
        """, nativeQuery = true)
    
    List<Map<String, Object>> getTop10PartnerSales(@Param("companyCode") String companyCode);
    
}