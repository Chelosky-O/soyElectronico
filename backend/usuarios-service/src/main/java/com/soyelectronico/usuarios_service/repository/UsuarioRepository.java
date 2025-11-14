package com.soyelectronico.usuarios_service.repository;

import com.soyelectronico.usuarios_service.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Repositorio JPA que permite acceder a la tabla usuarios y buscar por email
// JpaRepository<Entidad, TipoDeLaPK>
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // este metodo luego lo usaremos en el login para buscar un usuario por su email
    Optional<Usuario> findByEmail(String email);
}