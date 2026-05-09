package com.laundry.b2b_manager.config;

import com.laundry.b2b_manager.util.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor // 🚀 JwtFilter 주입을 위해 추가
public class SecurityConfig {

    private final JwtFilter jwtFilter; // 🚀 우리가 만든 문지기(Filter) 주입

    // 비밀번호 암호화 빈 등록 (서비스에서 쓰기 위함)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. CSRF 비활성화 (REST API 환경)
            .csrf(csrf -> csrf.disable()) 
            
            // 2. CORS 기본 설정 적용
            .cors(Customizer.withDefaults())
            
            // 3. 폼 로그인 및 기본 HTTP 로그인 비활성화
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            
            // 4. 🚀 핵심: JWT를 사용하므로 세션을 서버에 저장하지 않음 (STATELESS)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // 5. API 접근 권한 설정
            .authorizeHttpRequests(auth -> auth
                // 로그인과 회원가입은 누구나 접근 가능 (보안 제외)
                .requestMatchers("/api/login", "/api/signup", "/api/user/forgot-password").permitAll()
                
                // 🚀 그 외의 모든 API(/api/daily, /api/clients 등)는 반드시 인증(토큰) 필요!
                .anyRequest().authenticated()
            )
            
            // 6. 🚀 UsernamePasswordAuthenticationFilter 실행 전에 JwtFilter를 먼저 실행!
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }
}