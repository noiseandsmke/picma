package edu.hcmute;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class DeepResearchServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DeepResearchServiceApplication.class, args);
    }
}