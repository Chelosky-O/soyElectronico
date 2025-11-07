package com.soyelectronico.usuarios_service.service;

import com.soyelectronico.usuarios_service.dto.LoginRequest;
import com.soyelectronico.usuarios_service.dto.LoginResponse;
import com.soyelectronico.usuarios_service.dto.RegistroRequest;
import com.soyelectronico.usuarios_service.model.Usuario;
import com.soyelectronico.usuarios_service.repository.UsuarioRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import org.springframework.dao.DataIntegrityViolationException;
import java.time.OffsetDateTime;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    //clave para firmar el token
    private final String jwtSecret = "soy_una_contra_super_ultra_segura_1234567890";

    public AuthService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        //if (!passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash())) {
        if (!request.getPassword().equals(usuario.getPasswordHash())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        Instant now = Instant.now();
        String token = Jwts.builder()
                .setSubject(usuario.getId().toString())
                .claim("email", usuario.getEmail())
                .claim("rol", usuario.getRol())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(3600))) // dura 1 hora
                .signWith(SignatureAlgorithm.HS256, jwtSecret.getBytes())
                .compact();

        return new LoginResponse(token);
    }

    public Usuario registrarCliente(RegistroRequest request) {

        // Comprobar que no exista otro usuario con el mismo email
        if (usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("El email ya está registrado");
        }

        // Crear entidad Usuario
        Usuario nuevo = new Usuario();
        nuevo.setNombre(request.getNombre());
        nuevo.setEmail(request.getEmail());

        // Por ahora sin hash pero esta listo
        nuevo.setPasswordHash(request.getPassword());

        // Siempre rol cliente para este endpoint
        nuevo.setRol("cliente");

        // Fecha actual
        nuevo.setFechaCreacion(OffsetDateTime.now());

        try {
            return usuarioRepository.save(nuevo);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("No se pudo registrar el usuario (email duplicado)");
        }
    }
}
