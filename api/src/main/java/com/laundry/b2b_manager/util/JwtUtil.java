package com.laundry.b2b_manager.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {


    @Value("${jwt.secret}")
    private String secretKey;
    
    private Key key;

    // 토큰 만료 시간 (예: 24시간)
    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 24;

    
    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    
    public String generateToken(String userId, String username, String companyCode, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("username", username);
        claims.put("companyCode", companyCode);
        claims.put("role", role);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userId)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // 2. 토큰에서 데이터 추출 및 검증
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // 3. 토큰 만료 여부 확인
    public boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    // 4. 토큰 유효성 종합 검증
    public boolean validateToken(String token, String userId) {
        final String extractedUserId = extractAllClaims(token).getSubject();
        return (extractedUserId.equals(userId) && !isTokenExpired(token));
    }
}