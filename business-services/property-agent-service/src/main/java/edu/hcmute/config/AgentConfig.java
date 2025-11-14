package edu.hcmute.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AgentConfig {
    @Value("${picma.properties.lead.topic}")
    private String leadTopic;
}