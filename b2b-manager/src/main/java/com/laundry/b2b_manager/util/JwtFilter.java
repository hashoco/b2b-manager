package com.laundry.b2b_manager.util;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();
        // 1. 프리패스 구역
        if (path.contains("/login") || path.contains("/signup") || path.contains("/forgot-password")) {
            filterChain.doFilter(request, response);
            return; 
        }

        

        String authorizationHeader = request.getHeader("Authorization");
        String token = null;
        String userId = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            token = authorizationHeader.substring(7); 
            try {
                userId = jwtUtil.extractAllClaims(token).getSubject();
                System.out.println("[JwtFilter] ✅ 토큰 추출 성공 userId: " + userId);
            } catch (Exception e) {
                System.out.println("[JwtFilter] ❌ 토큰 추출 실패: " + e.getMessage());
            }
        } else {
            System.out.println("[JwtFilter] ⚠️ 헤더에 Bearer 토큰이 없습니다.");
        }

        if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.validateToken(token, userId)) {
                UsernamePasswordAuthenticationToken authToken = 
                        new UsernamePasswordAuthenticationToken(userId, null, new ArrayList<>());
                SecurityContextHolder.getContext().setAuthentication(authToken);
                
            }
        }

        filterChain.doFilter(request, response);
    }
}