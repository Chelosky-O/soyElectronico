-- =========================
-- TABLA USUARIOS
-- =========================
CREATE TABLE usuarios (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    email          VARCHAR(150) NOT NULL UNIQUE,
    password_hash  TEXT NOT NULL,
    rol            VARCHAR(20) NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT rol_valido CHECK (rol IN ('admin', 'cliente'))
);

-- PostgreSQL crea automáticamente un índice UNIQUE por el email,
-- pero si quieres dejarlo explícito podrías usar:
-- CREATE UNIQUE INDEX idx_usuarios_email ON usuarios(email);


-- =========================
-- TABLA PRODUCTOS
-- =========================
CREATE TABLE productos (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre              VARCHAR(150) NOT NULL,
    descripcion         TEXT,
    precio              NUMERIC(12, 2) NOT NULL,
    stock               INTEGER NOT NULL,
    fecha_creacion      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ,
    imagen_url          TEXT,
    categoria           VARCHAR(50),
    detalles            TEXT,
    CONSTRAINT productos_precio_check CHECK (precio > 0),
    CONSTRAINT productos_stock_check  CHECK (stock >= 0)
);

-- Índice para acelerar el buscador por nombre
CREATE INDEX idx_productos_nombre ON productos (nombre);


-- =========================
-- TABLA PEDIDOS
-- =========================
CREATE TABLE pedidos (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id   BIGINT NOT NULL,
    producto_id  BIGINT NOT NULL,
    cantidad     INTEGER NOT NULL,
    fecha_pedido TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pedidos_cantidad_check CHECK (cantidad > 0),

    CONSTRAINT fk_pedidos_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_pedidos_producto
        FOREIGN KEY (producto_id) REFERENCES productos(id)
        ON DELETE RESTRICT
);

-- Índices para acelerar:
-- - "Mis pedidos" por usuario
-- - Consultas por producto
CREATE INDEX idx_pedidos_usuario  ON pedidos (usuario_id);
CREATE INDEX idx_pedidos_producto ON pedidos (producto_id);
