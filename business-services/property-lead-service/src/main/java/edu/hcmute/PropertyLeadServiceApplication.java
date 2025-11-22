package edu.hcmute;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableFeignClients
@EnableJpaAuditing
public class PropertyLeadServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(PropertyLeadServiceApplication.class, args);
    }
}