# 🧠 SoyElectrónico

**SoyElectrónico** es una plataforma de e-commerce enfocada en la venta de componentes electrónicos (Arduino, sensores, LEDs, cables, etc.).  
El proyecto será desarrollado con una arquitectura de **microservicios**.

---

## 🚀 Tecnologías utilizadas

### 🧩 Backend (microservicios)
| Servicio | Descripción | Tecnologías |
|-----------|--------------|--------------|
| **usuarios-service** | Maneja usuarios, login, registro y roles (`admin`, `cliente`) | Java 21 · Spring Boot · Spring Security · JWT · BCrypt |
| **productos-service** | Gestión del catálogo de productos (CRUD, imágenes, categorías, descripción larga) | Java 21 · Spring Boot · JPA|
| **pedidos-service** | Registro de compras y pedidos vinculados a usuario y producto | Java 21 · Spring Boot|

### 🖥️ Frontend
- **React + Vite**  
- **TailwindCSS (v4.0)**  

### 🗃️ Base de datos
- **PostgreSQL v16 (NeonDB cloud)**
- Tablas:
  - `usuarios(id, nombre, email, password_hash, rol)`
  - `productos(id, nombre, descripcion, precio, stock, imagen_url, categoria, detalles)`
  - `pedidos(id, usuario_id, producto_id, cantidad, fecha_pedido)`

---

## 🔐 Roles y autenticación

| Rol | Descripción | Permisos |
|-----|--------------|-----------|
| **Cliente** | Usuario registrado que puede comprar y ver sus pedidos | Ver catálogo, realizar compras, ver "Mis pedidos" |
| **Admin** | Usuario con acceso completo al sistema | CRUD de productos, ver catálogo, administrar stock |

- Autenticación con **JWT**.  
- Contraseñas cifrada con **BCrypt**.  

---

## 🧠 Flujo general

1. Usuario se **registra** o **inicia sesión**.
2. El cliente puede:
   - Navegar el catálogo.
   - Ver detalles de cada producto.
   - Realizar compras.
   - Revisar “Mis pedidos”.
3. El administrador puede:
   - Crear, editar o eliminar productos.
   - Subir imágenes y agregar categoría o descripción extendida.

---

## 🧰 Configuración local

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/tuusuario/SoyElectronico.git
cd SoyElectronico
```

### 2️⃣ Base de datos
Configura una base PostgreSQL (local o en Neon)  
y ajusta las variables en cada `application.properties`.

### 3️⃣ Backend (microservicios)
Ejecuta cada servicio con Gradle:

```bash
cd backend/usuarios-service && ./gradlew bootRun
cd backend/productos-service && ./gradlew bootRun
cd backend/pedidos-service && ./gradlew bootRun
```

### 4️⃣ Frontend
```bash
cd frontend/soyelectronico
npm install
npm run dev
```

Accede en: **http://localhost:5173**

---

## 🌐 Rutas principales (API)

### 🧑‍💻 usuarios-service
| Método | Endpoint | Descripción |
|--------|-----------|--------------|
| **POST** | `/api/login` | Inicia sesión y devuelve un token JWT |
| **POST** | `/api/usuarios/registro` | Crea un nuevo usuario con rol `cliente` |
| **GET** | `/api/health` | Verifica el estado del servicio de usuarios |

---

### 🧾 productos-service
| Método | Endpoint | Descripción |
|--------|-----------|--------------|
| **GET** | `/api/productos` | Lista todos los productos o filtra por nombre (`?q=`) |
| **GET** | `/api/productos/{id}` | Obtiene un producto por su ID |
| **POST** | `/api/productos` | Crea un nuevo producto *(solo admin)* |
| **PUT** | `/api/productos/{id}` | Actualiza un producto existente *(solo admin)* |
| **DELETE** | `/api/productos/{id}` | Elimina un producto *(solo admin)* |
| **GET** | `/api/health` | Verifica el estado del servicio de productos |

---

### 📦 pedidos-service
| Método | Endpoint | Descripción |
|--------|-----------|--------------|
| **POST** | `/api/comprar/{productoId}` | Crea un pedido nuevo para el usuario autenticado |
| **GET** | `/api/pedidos/mios` | Lista los pedidos del usuario actual *(requiere token)* |
| **GET** | `/api/health` | Verifica el estado del servicio de pedidos |

---

🔑 **Notas:**
- Todas las rutas bajo `/api/**` requieren autenticación JWT, excepto `/login`, `/usuarios/registro` y `/health`.
- El rol `admin` tiene acceso a los endpoints de gestión de productos.
- Los tokens se envían en el header HTTP:
