package com.soyelectronico.productos_service.controller;

import com.soyelectronico.productos_service.model.Producto;
import com.soyelectronico.productos_service.repository.ProductoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    private final ProductoRepository productoRepository;

    public ProductoController(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    // GET /api/productos  -> público (catálogo)
    // Soporta:
    //   ?categoria=iluminacion
    //   ?q=arduino
    // Lista productos, permitiendo filtrar por término de búsqueda (q) o por categoría
    @GetMapping
    public List<Producto> listar(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String categoria
    ) {
        if (categoria != null && !categoria.isBlank()) {
            return productoRepository.findByCategoriaIgnoreCase(categoria);
        }
        if (q != null && !q.isBlank()) {
            return productoRepository.findByNombreContainingIgnoreCase(q);
        }
        return productoRepository.findAll();
    }

    // Obtiene un producto por su id y devuelve 404 si no existe
    // GET /api/productos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtener(@PathVariable Long id) {
        return productoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Crea un nuevo producto, asignando fecha de creación y guardándolo en la base de datos
    // POST /api/productos  (admin)
    @PostMapping
    public ResponseEntity<Producto> crear(@RequestBody Producto producto) {
        producto.setId(null);
        producto.setFechaCreacion(OffsetDateTime.now());
        producto.setFechaActualizacion(null);
        // imagenUrl, categoria, detalles etc. ya vienen en el body
        Producto guardado = productoRepository.save(producto);
        return ResponseEntity.ok(guardado);
    }

    // Actualiza los datos de un producto existente y registra la fecha de actualización
    // PUT /api/productos/{id}  (admin)
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

    // Elimina un producto por id y devuelve 204 si se borra o 404 si no existe
    // DELETE /api/productos/{id}  (admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!productoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        productoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
