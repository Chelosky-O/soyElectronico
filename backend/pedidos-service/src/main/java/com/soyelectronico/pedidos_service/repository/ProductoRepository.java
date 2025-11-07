package com.soyelectronico.pedidos_service.repository;

import com.soyelectronico.pedidos_service.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
}
