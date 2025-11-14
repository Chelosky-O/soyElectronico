package com.soyelectronico.productos_service.repository;

import com.soyelectronico.productos_service.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// Repositorio JPA que permite buscar productos por nombre o por categoría en la base de datos
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    // Para el buscador por nombre
    List<Producto> findByNombreContainingIgnoreCase(String nombre);

    // Para el filtro por categoría
    List<Producto> findByCategoriaIgnoreCase(String categoria);
}