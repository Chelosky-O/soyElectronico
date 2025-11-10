package com.soyelectronico.productos_service.controller;

import com.soyelectronico.productos_service.model.Producto;
import com.soyelectronico.productos_service.repository.ProductoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoRepository productoRepository;

    public ProductoController(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    // GET /api/productos  -> público (catálogo)
    @GetMapping
    public List<Producto> listar(@RequestParam(required = false) String q) {
        if (q != null && !q.isBlank()) {
            return productoRepository.findByNombreContainingIgnoreCase(q);
        }
        return productoRepository.findAll();
    }

    // GET /api/productos/{id} despues requerira token
    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtener(@PathVariable Long id) {
        return productoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/productos esto para admin
    @PostMapping
    public ResponseEntity<Producto> crear(@RequestBody Producto producto) {
        producto.setId(null);
        producto.setFechaCreacion(OffsetDateTime.now());
        producto.setFechaActualizacion(null);
        Producto guardado = productoRepository.save(producto);
        return ResponseEntity.ok(guardado);
    }

    // PUT /api/productos/{id} esto para admin
    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizar(@PathVariable Long id,
                                               @RequestBody Producto datos) {
        return productoRepository.findById(id)
                .map(p -> {
                    p.setNombre(datos.getNombre());
                    p.setDescripcion(datos.getDescripcion());
                    p.setPrecio(datos.getPrecio());
                    p.setStock(datos.getStock());
                    p.setImagenUrl(datos.getImagenUrl());
                    p.setCategoria(datos.getCategoria());
                    p.setDetalles(datos.getDetalles());
                    p.setFechaActualizacion(OffsetDateTime.now());
                    Producto actualizado = productoRepository.save(p);
                    return ResponseEntity.ok(actualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/productos/{id} esto para admin
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!productoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        productoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
