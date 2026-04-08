package com.soul.lms.swaggerconfiguration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
	
	@Bean
	public GroupedOpenApi swaggerPublicApi() {
		return GroupedOpenApi.builder()
				.group("admin")
				.pathsToMatch("/**")
				.build();
	}
	
	@Bean
	public OpenAPI customOpenAPI() {
		return new OpenAPI()
				.info(new Info().title("SkillLMS API Documentation").version("1.0"))
				.addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
				.components(
						new Components()
								.addSecuritySchemes("bearerAuth", new SecurityScheme()
										.type(SecurityScheme.Type.HTTP)
										.scheme("bearer")
										.bearerFormat("JWT")));
	}
	
}
