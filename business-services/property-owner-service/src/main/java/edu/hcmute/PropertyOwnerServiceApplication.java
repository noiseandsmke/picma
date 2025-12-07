package edu.hcmute;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class PropertyOwnerServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(PropertyOwnerServiceApplication.class, args);
    }
}