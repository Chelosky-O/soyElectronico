package com.soyelectronico.usuarios_service.dto;

// DTO(Data Transfer Object) que representa los datos enviados en una solicitud de inicio de sesión
public class LoginRequest {
        
    private String email;
    private String password;

    // Getters y setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
