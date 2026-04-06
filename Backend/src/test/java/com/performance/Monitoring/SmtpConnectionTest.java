package com.performance.Monitoring;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.javamail.JavaMailSender;
import jakarta.mail.MessagingException;
import jakarta.mail.Transport;

@SpringBootTest
public class SmtpConnectionTest {

    @Autowired
    private JavaMailSender javaMailSender;

    @Test
    public void testSmtpConnection() {
        if (javaMailSender instanceof org.springframework.mail.javamail.JavaMailSenderImpl) {
            org.springframework.mail.javamail.JavaMailSenderImpl sender = 
                (org.springframework.mail.javamail.JavaMailSenderImpl) javaMailSender;
            try {
                sender.testConnection();
                System.out.println("\n✅ SMTP Connection Successful! Credentials are correct.\n");
            } catch (MessagingException e) {
                System.out.println("\n❌ SMTP Connection Failed! Error details:\n" + e.getMessage() + "\n");
            }
        }
    }
}
