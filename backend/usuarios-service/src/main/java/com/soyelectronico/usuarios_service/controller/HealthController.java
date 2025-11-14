package com.soyelectronico.usuarios_service.controller;

//Con esto Spring sabe que esta clase maneja peticiones HTTP
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
// Controlador REST que expone un endpoint de salud para verificar el estado del servicio
@RestController //esta clase sera un controlador REST
public class HealthController {

    @GetMapping("/api/health")
    public String health() {
        return "OK usuarios-service";
    }
}