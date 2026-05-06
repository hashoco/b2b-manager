package com.laundry.b2b_manager.config; // 패키지 경로는 본인 프로젝트에 맞게 확인하세요

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. React 프론트엔드와 통신하기 위해 CSRF 보호 비활성화 (API 서버의 기본 설정)
            .csrf(csrf -> csrf.disable()) 
            
            // 2. 폼 로그인 화면 비활성화 (우리는 React에서 자체 로그인 화면을 쓰기 때문)
            .formLogin(form -> form.disable()) 
            
            // 3. 우선 모든 API 요청을 로그인 없이 통과시키도록 설정 (기존과 동일한 환경 유지)
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            );
            
        return http.build();
    }
}