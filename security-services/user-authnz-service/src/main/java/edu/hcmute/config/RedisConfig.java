package edu.hcmute.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.connection.ReactiveRedisConnectionFactory;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {
    @Bean
    @Primary
    public ReactiveRedisTemplate<String, String> sessionRedisTemplate(ReactiveRedisConnectionFactory factory) {
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        RedisSerializationContext.RedisSerializationContextBuilder<String, String> builder =
                RedisSerializationContext.newSerializationContext(stringSerializer);
        RedisSerializationContext<String, String> context = builder
                .value(stringSerializer)
                .build();
        return new ReactiveRedisTemplate<>(factory, context);
    }
}