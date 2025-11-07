package com.soyelectronico.usuarios_service.controller;


import com.soyelectronico.usuarios_service.model.Usuario;
import com.soyelectronico.usuarios_service.repository.UsuarioRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class UsuarioController {
    private final UsuarioRepository usuarioRepository;

    // Spring inyecta el repository automáticamente por el constructor
    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/api/usuarios")
    public List<Usuario> listarUsuarios() {
        // Devuelve todos los usuarios de la tabla usuarios
        return usuarioRepository.findAll();
    }
}
