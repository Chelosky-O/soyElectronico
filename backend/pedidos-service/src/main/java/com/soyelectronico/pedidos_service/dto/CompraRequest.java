package com.soyelectronico.pedidos_service.dto;

// DTO que representa la cantidad solicitada al comprar un producto
public class CompraRequest {

    private Integer cantidad;

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
}
