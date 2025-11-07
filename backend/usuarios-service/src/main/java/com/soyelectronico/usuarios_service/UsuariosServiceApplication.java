package com.soyelectronico.usuarios_service;

import javax.sql.DataSource;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

import java.sql.Connection;

@SpringBootApplication
public class UsuariosServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(UsuariosServiceApplication.class, args);
	}

    @Bean //para depurar qué credenciales/url está usando Spring
    public CommandLineRunner debugDataSource(DataSource dataSource) {
        return args -> {
            try (Connection conn = dataSource.getConnection()) {
                System.out.println(">> DEBUG DS: Conectado con éxito a: " + conn.getMetaData().getURL());
                System.out.println(">> DEBUG DS: Usuario: " + conn.getMetaData().getUserName());
            } catch (Exception e) {
                System.out.println(">> DEBUG DS: ERROR al conectar con DataSource");
                e.printStackTrace();
            }
        };
    }
}
