package com.airbnb.airbn_clone_back.infrastructure.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Airbnb Clone API")
                        .version("1.0.0")
                        .description("API documentation for Airbnb Clone project.")
                        .contact(new Contact()
                                .name("Pablo García Simavilla")
                                .email("pablo.garciasimavilla@gmail.com")
                                .url("https://www.linkedin.com/in/pablo-garc%C3%ADa-simavilla-756469222/")
                        )
                        .license(new License().name("MIT License"))
                )
                .externalDocs(new ExternalDocumentation()
                        .description("LinkedIn - Pablo García Simavilla")
                        .url("https://www.linkedin.com/in/pablo-garc%C3%ADa-simavilla-756469222/"));
    }
}
