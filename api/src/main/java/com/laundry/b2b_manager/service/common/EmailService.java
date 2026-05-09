package com.laundry.b2b_manager.service.common;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value; // 🚀 이거 꼭 임포트 확인!
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    // 🚀 application.properties에 있는 내 이메일 주소를 알아서 쏙 빼옵니다!
    @Value("${spring.mail.username}")
    private String senderEmail;

    public void sendMail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        message.setFrom(senderEmail);  
        mailSender.send(message);
    }
}