package com.soyelectronico.usuarios_service.dto;

// DTO que contiene el token devuelto tras un inicio de sesión exitoso
public class LoginResponse {
    private String token;

    public LoginResponse(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }
}