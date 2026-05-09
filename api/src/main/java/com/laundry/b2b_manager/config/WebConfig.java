package com.laundry.b2b_manager.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // 모든 경로(API 제외)를 리액트의 index.html로 리다이렉트
        registry.addViewController("/{path:[^\\.]*}")
                .setViewName("forward:/index.html");
    }

    
}