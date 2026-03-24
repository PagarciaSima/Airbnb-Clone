# 🏠 Airbnb Clone - Backend API

Una API REST completa para un clone de Airbnb, construida con **Spring Boot 3**, **PostgreSQL** y **OAuth2**. El proyecto implementa funcionalidades de gestión de propiedades de alquiler a corto plazo con autenticación, listados, búsqueda avanzada y sistema de reservas.

---

## ✨ Características Principales

### 👥 Gestión de Usuarios
- Autenticación OAuth2 con Auth0/Okta
- Roles diferenciados: **Landlord** (propietario) y **Tenant** (arrendatario)
- Sincronización automática con proveedores de identidad

### 🏢 Gestión de Propiedades
- Crear, editar y eliminar listados (solo Landlords)
- Subida de múltiples imágenes (hasta 100MB por propiedad)
- Búsqueda avanzada con filtros por categoría
- Visualización de propiedades disponibles

### 📅 Sistema de Reservas
- Crear reservas con validación de disponibilidad
- Consultar fechas disponibles
- Prevención de sobrelapamiento de reservas

### 🔐 Seguridad
- Autenticación basada en JWT
- CSRF protection con cookies HTTP-only
- CORS configurado
- Validación de roles en endpoints sensibles

---

## 🛠️ Stack Tecnológico

| Componente | Versión | Descripción |
|------------|---------|-------------|
| **Java** | 21 | Lenguaje de programación |
| **Spring Boot** | 3.2.4 | Framework web |
| **PostgreSQL** | latest | Base de datos |
| **Spring Security** | 3.2.4 | Autenticación y autorización |
| **Spring Data JPA** | 3.2.4 | ORM y persistencia |
| **Liquibase** | 4.x | Versionado de esquema BD |
| **MapStruct** | 1.5.5 | Mapeo de DTOs |
| **Auth0** | 3.0.6 | Proveedor OAuth2 |
| **Hibernate Validator** | incluido | Validación |

---

## 📁 Estructura del Proyecto

```
src/main/java/com/airbnb/airbn_clone_back/
├── user/                          # Módulo de usuarios
│   ├── application/               # Servicios de negocio
│   ├── domain/                    # Entidades JPA
│   ├── mapper/                    # Mappers DTO ↔ Entity
│   ├── presentation/              # REST Controllers
│   └── repository/                # Data Access Layer
│
├── listing/                       # Módulo de propiedades
│   ├── application/
│   │   ├── LandlordService.java  # Crear/editar propiedades
│   │   ├── TenantService.java    # Ver propiedades disponibles
│   │   └── PictureService.java   # Gestión de imágenes
│   ├── domain/
│   ├── mapper/
│   ├── presentation/
│   └── repository/
│
├── booking/                       # Módulo de reservas
│   ├── application/
│   │   └── BookingService.java
│   ├── domain/
│   ├── mapper/
│   ├── presentation/
│   └── repository/
│
├── infrastructure/                # Configuración transversal
│   └── config/
│       ├── SecurityConfiguration.java
│       └── SecurityUtils.java
│
└── sharedkernel/                  # Código compartido
    ├── domain/
    │   └── AbstractAuditingEntity.java
    └── service/
```

---

## 🚀 Quick Start

### Requisitos Previos
- Java 21+
- PostgreSQL 13+
- Maven 3.9+
- Cuenta Auth0 (para desarrollo)

### Instalación Rápida

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd airbn-clone-back

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales Auth0 y BD

# 3. Instalar dependencias y construir
mvn clean install

# 4. Ejecutar la aplicación
mvn spring-boot:run
```

Para más detalles, ver [SETUP.md](SETUP.md).

---

## 🔌 API Endpoints

### Autenticación
```
POST   /api/auth/callback          Callback OAuth2
GET    /api/auth/profile           Obtener perfil usuario (protegido)
GET    /api/auth/logout            Cerrar sesión
```

### Listados (Propiedades)

**Públicos (sin auth)**:
```
GET    /api/tenant-listing/get-all-by-category           Obtener por categoría
GET    /api/tenant-listing/get-one?id={id}                Ver detalle
POST   /api/tenant-listing/search                         Búsqueda avanzada
```

**Protegidos (solo Landlords)**:
```
POST   /api/landlord-listing/save                         Crear propiedad
PUT    /api/landlord-listing/update/{id}                  Editar propiedad
DELETE /api/landlord-listing/delete/{id}                  Eliminar propiedad
```

### Imágenes
```
POST   /api/landlord-listing/upload-pictures/{listingId}  Subir imágenes
```

### Reservas
```
GET    /api/booking/check-availability?listingId=X&startDate=Y&endDate=Z
POST   /api/booking/create                                Crear reserva (protegido)
GET    /api/booking/get-all                               Mis reservas (protegido)
```

---

## 🔐 Seguridad y Autenticación

### Flujo OAuth2
1. Usuario se autentica con Auth0
2. Auth0 retorna JWT token
3. Cliente incluye token en header `Authorization: Bearer <token>`
4. SecurityConfiguration valida el token
5. SecurityUtils extrae roles y mapea a autoridades Spring

### Roles
- **ROLE_LANDLORD**: Crear/editar propiedades
- **ROLE_TENANT**: Buscar propiedades y hacer reservas

### Protección CSRF
- Habilitada con `CookieCsrfTokenRepository`
- Cookies HTTP-only
- SameSite=Strict

---

## 📊 Modelo de Datos

```
┌─────────────────┐
│   airbnb_user   │
│─────────────────│
│ id (PK)         │
│ public_id (UK)  │
│ email           │
│ first_name      │
│ last_name       │
└────────┬────────┘
         │ 1:N
         │
    ┌────▼────────────────┐
    │  user_authority     │
    ├─────────────────────┤
    │ user_id (FK)        │
    │ authority_id (FK)   │
    └─────────────────────┘
         │
         │ N:1
    ┌────▼─────────┐
    │  authority   │
    ├──────────────┤
    │ name         │
    │ (LANDLORD/   │
    │  TENANT)     │
    └──────────────┘

    ┌──────────────────┐
    │    listing       │
    ├──────────────────┤
    │ id (PK)          │
    │ landlord_id (FK) │──┐
    │ title            │  │
    │ description      │  │
    │ price_per_night  │  └──► airbnb_user
    │ address          │
    │ category_id (FK)─┼──┐
    └──────────────────┘  │
         │ 1:N            │
         │                └──► booking_category
    ┌────▼───────────────┐
    │ listing_picture    │
    ├────────────────────┤
    │ id (PK)            │
    │ listing_id (FK)    │
    │ image_url          │
    └────────────────────┘

    ┌──────────────────┐
    │     booking      │
    ├──────────────────┤
    │ id (PK)          │
    │ tenant_id (FK)   │──┐
    │ listing_id (FK)  │──┼──► listing
    │ start_date       │  │
    │ end_date         │  └──► airbnb_user
    │ total_price      │
    └──────────────────┘
```

---

## 🏗️ Arquitectura

El proyecto implementa **Clean Architecture** dividida en capas:

### Capas
1. **Domain**: Entidades JPA, reglas de negocio
2. **Application**: Servicios, DTOs, lógica de negocio
3. **Presentation**: REST Controllers, DTOs de entrada/salida
4. **Repository**: Acceso a datos con Spring Data JPA
5. **Infrastructure**: Configuración, seguridad, utilidades

### Patrones Implementados
- **Repository Pattern**: Acceso a datos abstraído
- **Mapper Pattern**: MapStruct para transformación DTO ↔ Entity
- **Service Layer**: Lógica de negocio centralizada
- **DTO Pattern**: Separación entre representación y persistencia

Para más detalles técnicos, ver [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 📝 Configuración

### Variables de Entorno (Development)

```env
# PostgreSQL
POSTGRES_USER=airbnb_user
POSTGRES_PASSWORD=secure_password
POSTGRES_URL=localhost
POSTGRES_DB=airbnb_clone

# Auth0
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_ISSUER_URI=https://your-domain.auth0.com/

# Server
SERVER_PORT=8080
```

Ver [SETUP.md](SETUP.md) para configuración detallada.

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
mvn test

# Ejecutar tests con cobertura
mvn test jacoco:report
```

---

## 📦 Build y Deployment

### Crear JAR ejecutable
```bash
mvn clean package -DskipTests
java -jar target/airbn-clone-back-*.jar
```

### Docker
```bash
# Construir imagen
docker build -t airbn-clone-back .

# Ejecutar contenedor
docker run -p 8080:8080 --env-file .env airbn-clone-back
```

---

## 🤝 Contribución

1. Crear branch: `git checkout -b feature/my-feature`
2. Hacer cambios
3. Crear commit: `git commit -m "feat: description"`
4. Push a branch: `git push origin feature/my-feature`
5. Abrir Pull Request

Ver [ARCHITECTURE.md](ARCHITECTURE.md) para decisiones de diseño.

---

## 📄 Licencia

Este proyecto es un side project de educación. Todos los derechos reservados.

---

## 📚 Recursos Útiles

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security & OAuth2](https://spring.io/projects/spring-security)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Liquibase](https://www.liquibase.org/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Última actualización**: Marzo 2026
