package com.soyelectronico.pedidos_service.repository;

import com.soyelectronico.pedidos_service.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

// Repositorio JPA que gestiona las operaciones CRUD de la entidad Producto
public interface ProductoRepository extends JpaRepository<Producto, Long> {
}
