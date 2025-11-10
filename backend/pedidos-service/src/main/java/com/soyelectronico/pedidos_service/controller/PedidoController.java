package com.soyelectronico.pedidos_service.controller;

import com.soyelectronico.pedidos_service.dto.CompraRequest;
import com.soyelectronico.pedidos_service.model.Pedido;
import com.soyelectronico.pedidos_service.repository.PedidoRepository;
import com.soyelectronico.pedidos_service.service.PedidoService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PedidoController {

    private final PedidoService pedidoService;
    private final PedidoRepository pedidoRepository;

    public PedidoController(PedidoService pedidoService,
                            PedidoRepository pedidoRepository) {
        this.pedidoService = pedidoService;
        this.pedidoRepository = pedidoRepository;
    }

    /**
     * Endpoint para comprar un producto.
     * Solo debería ser usado por usuarios con rol "cliente".
     *
     * POST /api/comprar/{productoId}
     */
    @PostMapping("/comprar/{productoId}")
    public ResponseEntity<?> comprar(@PathVariable Long productoId,
                                     @RequestBody CompraRequest request,
                                     HttpServletRequest httpRequest) {
        try {
            // Estos atributos los deja el JwtAuthFilter
            String usuarioIdStr = (String) httpRequest.getAttribute("usuarioId");
            String usuarioRol = (String) httpRequest.getAttribute("usuarioRol");

            if (usuarioIdStr == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Usuario no autenticado");
            }

            // Validamos rol manualmente
            if (usuarioRol == null || !usuarioRol.equalsIgnoreCase("cliente")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Solo los clientes pueden comprar");
            }

            Long usuarioId = Long.parseLong(usuarioIdStr);

            Pedido pedido = pedidoService.comprar(usuarioId, productoId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(pedido);

        } catch (IllegalArgumentException e) {
            // Cantidad inválida u otros errores de validación
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            // Stock insuficiente
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (RuntimeException e) {
            // Producto no encontrado u otros errores de negocio
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            // Cualquier otro error inesperado
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al procesar la compra");
        }
    }

    /**
     * Endpoint para obtener los pedidos del usuario autenticado.
     *
     * GET /api/pedidos/mios
     */
    @GetMapping("/pedidos/mios")
    public ResponseEntity<?> misPedidos(HttpServletRequest httpRequest) {
        String usuarioIdStr = (String) httpRequest.getAttribute("usuarioId");

        if (usuarioIdStr == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Usuario no autenticado");
        }

        Long usuarioId = Long.parseLong(usuarioIdStr);

        List<Pedido> pedidos = pedidoRepository.findByUsuarioId(usuarioId);
        return ResponseEntity.ok(pedidos);
    }
}
