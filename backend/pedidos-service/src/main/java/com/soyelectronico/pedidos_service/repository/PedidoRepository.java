package com.soyelectronico.pedidos_service.repository;

import com.soyelectronico.pedidos_service.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // Para ver pedidos de un usuario
    List<Pedido> findByUsuarioId(Long usuarioId);
}
