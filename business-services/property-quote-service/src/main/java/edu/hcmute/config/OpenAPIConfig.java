package edu.hcmute.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(info = @Info(
        title = "PICMA Property Quote Service",
        description = "PICMA Property Quote Service",
        version = "v1",
        license = @License(name = "Nguyen Duc Huy 20145449", url = "https://hcmute.edu.vn/", identifier = "@2025-2026"),
        contact = @Contact(email = "20145449@student.hcmute.edu.vn")))
@SecurityScheme(name = "bearerAuth", scheme = "bearer", type = SecuritySchemeType.HTTP, bearerFormat = "JWT")
public class OpenAPIConfig {
}