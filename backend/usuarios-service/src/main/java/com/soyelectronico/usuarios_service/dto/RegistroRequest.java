package com.soyelectronico.usuarios_service.dto;

// DTO que representa los datos enviados para registrar un nuevo usuario
public class RegistroRequest {

    private String nombre;
    private String email;
    private String password;

    // Getters y setters
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
