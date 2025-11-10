package com.soyelectronico.productos_service.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductoRequest {
    private String nombre;
    private String descripcion;
    private Double precio;
    private Integer stock;
    private String imagenUrl; 
    private String categoria;
    private String detalles;
}
