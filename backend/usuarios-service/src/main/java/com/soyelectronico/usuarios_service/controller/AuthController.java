package com.soyelectronico.usuarios_service.controller;

import com.soyelectronico.usuarios_service.model.Usuario;
import com.soyelectronico.usuarios_service.dto.LoginRequest;
import com.soyelectronico.usuarios_service.dto.LoginResponse;
import com.soyelectronico.usuarios_service.dto.RegistroRequest;
import com.soyelectronico.usuarios_service.service.AuthService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Controlador REST que maneja el login y registro de usuarios mediante AuthService
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/usuarios/registro")
    public ResponseEntity<?> registrar(@RequestBody RegistroRequest request) {
        try {
            Usuario creado = authService.registrarCliente(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(creado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
