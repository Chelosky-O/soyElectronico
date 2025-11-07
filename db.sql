
CREATE TABLE usuarios (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre           VARCHAR(100) NOT NULL,
    email            VARCHAR(150) NOT NULL UNIQUE,
    password_hash    TEXT NOT NULL,
    rol              VARCHAR(20) NOT NULL,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT rol_valido CHECK (rol IN ('admin', 'cliente'))
);

CREATE TABLE productos (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre              VARCHAR(150) NOT NULL,
    descripcion         TEXT,
    precio              NUMERIC(12, 2) NOT NULL CHECK (precio > 0),
    stock               INTEGER NOT NULL CHECK (stock >= 0),
    fecha_creacion      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ
);

CREATE TABLE pedidos (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id    BIGINT NOT NULL,
    producto_id   BIGINT NOT NULL,
    cantidad      INTEGER NOT NULL CHECK (cantidad > 0),
    fecha_pedido  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_pedidos_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_pedidos_producto
        FOREIGN KEY (producto_id) REFERENCES productos(id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_pedidos_usuario ON pedidos (usuario_id);
CREATE INDEX idx_pedidos_producto ON pedidos (producto_id);
CREATE INDEX idx_productos_nombre ON productos (nombre);

-- Estos ultimos para acelerar rendimiento en: Buscar pedidos por usuario o producto || Filtrar productos por nombre (buscador en el frontend) también se acelera.