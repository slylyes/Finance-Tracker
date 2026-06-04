package com.example.finance;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@OpenAPIDefinition(
	info = @Info(
		title = "Master Finance API",
		version = "v1",
		description = "API pour la gestion budgetaire et le suivi financier."
	)
)
@SpringBootApplication
public class FinanceBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(FinanceBackendApplication.class, args);
	}

}
