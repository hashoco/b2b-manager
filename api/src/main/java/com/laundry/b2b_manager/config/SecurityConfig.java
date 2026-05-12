package com.laundry.b2b_manager.config;

import com.laundry.b2b_manager.util.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                // 🚀 1. 프론트와 백이 같은 도메인을 쓰므로 CORS 문제 자체가 발생하지 않습니다. 아예 꺼버립니다.
                .cors(cors -> cors.disable()) 
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 🚀 2. 로그인, 비밀번호 찾기 등은 누구나 접근 가능
                        .requestMatchers("/api/login", "/api/signup", "/api/user/forgot-password").permitAll()
                        
                        // 🚀 3. 그 외의 모든 /api/** 로 시작하는 백엔드 요청은 "반드시 토큰이 있어야" 접근 가능
                        .requestMatchers("/api/**").authenticated()
                        
                        // 🚀 4. API가 아닌 나머지 모든 요청(index.html, JS, CSS, 이미지, 리액트 화면 주소 등)은 모두 허용!
                        .anyRequest().permitAll())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}