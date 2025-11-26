package edu.hcmute;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class PropertyQuoteServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(PropertyQuoteServiceApplication.class, args);
    }
}
