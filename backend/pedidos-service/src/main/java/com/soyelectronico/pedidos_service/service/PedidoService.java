package com.soyelectronico.pedidos_service.service;

import com.soyelectronico.pedidos_service.dto.CompraRequest;
import com.soyelectronico.pedidos_service.model.Pedido;
import com.soyelectronico.pedidos_service.model.Producto;
import com.soyelectronico.pedidos_service.repository.PedidoRepository;
import com.soyelectronico.pedidos_service.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

// Servicio que gestiona la compra: valida stock, actualiza el producto y crea el pedido
@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;

    public PedidoService(PedidoRepository pedidoRepository,
                         ProductoRepository productoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
    }

    @Transactional //ULTRA IMPORTANTE PARA SI ALGO FALLA EN MEDIO NO SE MODIFIQUE EL STOCK SIN PEDIDO.
    public Pedido comprar(Long usuarioId, Long productoId, CompraRequest request) {

        int cantidad = request.getCantidad();
        if (cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
        }

        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (producto.getStock() < cantidad) {
            // excepción para que el controlador devuelva 409
            throw new IllegalStateException("Stock insuficiente");
        }

        // Descontar stock
        producto.setStock(producto.getStock() - cantidad);
        producto.setFechaActualizacion(OffsetDateTime.now());
        productoRepository.save(producto);

        // Crear pedido
        Pedido pedido = new Pedido();
        pedido.setUsuarioId(usuarioId);
        pedido.setProductoId(productoId);
        pedido.setCantidad(cantidad);
        pedido.setFechaPedido(OffsetDateTime.now());

        return pedidoRepository.save(pedido);
    }
}
