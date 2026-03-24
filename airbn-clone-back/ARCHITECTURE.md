# 🏗️ Arquitectura y Decisiones de Diseño

Documentación técnica de la arquitectura del backend del Airbnb Clone, decisiones de diseño y patrones implementados.

---

## 📐 Visión General Arquitectónica

El proyecto implementa una **arquitectura limpia por dominios (Domain-Driven Design)** con separación clara de responsabilidades en capas.

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                      │
│           (REST Controllers - @RestController)              │
│ /api/auth/*  /api/landlord-listing  /api/tenant-listing    │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   APPLICATION LAYER                         │
│              (Services - @Service, DTOs)                    │
│    UserService  ListingService  BookingService             │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    DOMAIN LAYER                             │
│           (Business Rules, Entities - @Entity)             │
│    User  Listing  Booking  Authority  Pictures             │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                INFRASTRUCTURE LAYER                         │
│         (Data Access, Security, Config)                    │
│    Repositories  SecurityConfig  Auth0Service              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Principios Arquitectónicos

### 1. **Clean Architecture (Robert C. Martin)**
- Independencia de frameworks
- Fácil de testear
- Separación de responsabilidades
- Aislamiento de cambios externos

### 2. **Domain-Driven Design (DDD)**
- Módulos por agregados de negocio
- Lenguaje ubicuo en el código
- Separación clara de dominios

### 3. **SOLID Principles**
- **S**ingle Responsibility: Cada clase tiene una razón para cambiar
- **O**pen/Closed: Abierto a extensión, cerrado a modificación
- **L**iskov Substitution: Las subclases son sustituibles
- **I**nterface Segregation: Clientes no dependen de interfaces que no usan
- **D**ependency Inversion: Depender de abstracciones, no de implementaciones

---

## 🏢 Estructura de Módulos

El proyecto está dividido en **3 módulos de negocio principales** más capas transversales:

### **1. Módulo USER (Gestión de Usuarios)**

#### Responsabilidades
- Autenticación OAuth2
- Sincronización con Auth0/Okta
- Gestión de roles (LANDLORD, TENANT)
- Perfil de usuario

#### Estructura
```
user/
├── application/
│   ├── UserService.java          # Lógica de negocio principal
│   ├── Auth0Service.java         # Integración OAuth2
│   └── dto/
│       ├── ReadUserDTO.java      # DTO para respuestas
│       └── CreateUserDTO.java    # DTO para solicitudes
├── domain/
│   ├── User.java                 # Entidad JPA principal
│   ├── Authority.java            # Roles (LANDLORD, TENANT)
│   └── UserSpecification.java    # Criterios de búsqueda
├── mapper/
│   └── UserMapper.java           # MapStruct @Mapper interface
├── presentation/
│   └── AuthResource.java         # REST Controller
│       └── @PostMapping("/callback")
│       └── @GetMapping("/profile")
└── repository/
    ├── UserRepository.java       # Spring Data JPA
    └── AuthorityRepository.java
```

#### Flujo de Autenticación
```
1. Cliente envía solicitud OAuth2 a Auth0
2. Auth0 redirige a /api/auth/callback con código
3. SecurityUtils canjea código por JWT
4. SecurityConfiguration valida JWT
5. Usuario se sincroniza en BD si es nuevo
6. Roles se asignan automáticamente
7. Próximas requests incluyen Authorization: Bearer <token>
```

#### Decisiones de Diseño Clave
- **No almacenar contraseñas**: OAuth2 maneja autenticación
- **Public ID**: Campo único público además del ID interno (seguridad)
- **Audit Fields**: AbstractAuditingEntity registra created/updated
- **Authority separada**: Permite N:N entre usuarios y roles

---

### **2. Módulo LISTING (Gestión de Propiedades)**

#### Responsabilidades
- Crear y editar propiedades (solo Landlords)
- Búsqueda y visualización de propiedades
- Gestión de imágenes (upload múltiple)
- Categorización de propiedades

#### Estructura
```
listing/
├── application/
│   ├── LandlordService.java      # Crear/editar propiedades
│   │   ├── saveListing()
│   │   ├── updateListing()
│   │   └── deleteListing()
│   ├── TenantService.java        # Consultas (búsqueda, filtros)
│   │   ├── getAllByCategory()
│   │   ├── search()
│   │   └── getOne()
│   ├── PictureService.java       # Gestión de imágenes
│   │   ├── uploadPictures()
│   │   └── deletePicture()
│   └── dto/
│       ├── SaveListingDTO.java
│       ├── DisplayCardListingDTO.java
│       └── DetailedListingDTO.java
├── domain/
│   ├── Listing.java              # Entidad principal
│   │   ├── title: String
│   │   ├── description: String
│   │   ├── pricePerNight: BigDecimal
│   │   ├── address: String
│   │   ├── landlord: User (FK)
│   │   └── pictures: List<ListingPicture>
│   ├── ListingPicture.java       # Imágenes asociadas
│   ├── BookingCategory.java      # Categorías (Casa, Apto, etc)
│   └── ListingSpecification.java # Criterios JPA
├── mapper/
│   ├── ListingMapper.java
│   └── PictureMapper.java
├── presentation/
│   ├── LandlordResource.java     # /api/landlord-listing
│   │   ├── @PostMapping("/save")
│   │   ├── @PutMapping("/update/{id}")
│   │   └── @DeleteMapping("/delete/{id}")
│   └── TenantResource.java       # /api/tenant-listing
│       ├── @GetMapping("/get-all-by-category") - Público 🔓
│       ├── @GetMapping("/get-one") - Público 🔓
│       └── @PostMapping("/search") - Público 🔓
└── repository/
    ├── ListingRepository.java    # Spring Data JPA
    ├── ListingPictureRepository.java
    └── BookingCategoryRepository.java
```

#### Decisiones de Diseño Clave

**Endpoints Públicos (sin autenticación)**:
- Búsqueda y visualización son públicas para mejor experiencia
- Los usuarios pueden navegar sin crear cuenta

**Separación LandlordService vs TenantService**:
- Evita acceso cruzado a operaciones
- TenantService solo queries (read-only)
- LandlordService solo modificaciones (write)

**Gestión de Imágenes**:
```
• Máximo 100MB por solicitud (multipart/form-data)
• Relación 1:N con Listing (una propiedad puede tener múltiples fotos)
• URL almacenada en ListingPicture
• Validación MIME type (solo imágenes)
```

**BookingCategory**:
- Tabla reference para permitir categorías predefinidas
- Evita duplicación y mantiene integridad referencial

---

### **3. Módulo BOOKING (Gestión de Reservas)**

#### Responsabilidades
- Crear reservas con validación
- Verificar disponibilidad
- Bloquear fechas durante reservas activas

#### Estructura
```
booking/
├── application/
│   ├── BookingService.java
│   │   ├── createBooking()           # Validar, crear
│   │   ├── checkAvailability()       # Consultar fechas
│   │   ├── getMyBookings()           # Mis reservas
│   │   └── validateDateRange()       # Validaciones
│   └── dto/
│       ├── NewBookingDTO.java
│       ├── BookedDateDTO.java
│       └── BookedListingDTO.java
├── domain/
│   ├── Booking.java                  # Entidad
│   │   ├── tenant: User (FK)
│   │   ├── listing: Listing (FK)
│   │   ├── startDate: LocalDate
│   │   ├── endDate: LocalDate
│   │   └── totalPrice: BigDecimal
│   └── BookingSpecification.java
├── presentation/
│   └── BookingResource.java
│       ├── @PostMapping("/create") - Protegido 🔒
│       ├── @GetMapping("/check-availability") - Público 🔓
│       └── @GetMapping("/get-all") - Protegido 🔒
└── repository/
    └── BookingRepository.java        # Spring Data JPA
```

#### Lógica de Validación
```
checkAvailability(listingId, startDate, endDate):
  1. Query: Buscar bookings existentes
     SELECT * FROM booking
     WHERE listing_id = X
     AND start_date <= endDate
     AND end_date >= startDate
  
  2. Si no hay overlaps → disponible
  
  3. Si hay overlaps → retornar fechas ocupadas

createBooking(newBookingDTO):
  1. Validar que tenant != landlord
  2. Validar que endDate > startDate
  3. Validar disponibilidad (checkAvailability)
  4. Calcular totalPrice = (endDate - startDate) * pricePerNight
  5. Persistir Booking
```

#### Decisiones de Diseño Clave
- **No permitir autoReserva**: Un Landlord no puede reservar su propia propiedad
- **Precio precalculado**: Se calcula en base a noches y precio diario
- **Fechas inclusivas**: startDate y endDate ambas incluidas
- **JPA native queries**: Para consultas de disponibilidad complejas

---

## 🔒 Capa de Seguridad (Infrastructure)

### Arquitectura de Seguridad

```
┌──────────────────────────────────────┐
│     Browser / Cliente REST            │
└────────────────┬─────────────────────┘
                 │
              Request
                 │
┌────────────────▼─────────────────────┐
│   Spring Security Filters Chain       │
├──────────────────────────────────────┤
│ 1. CorsFilter                         │
│ 2. CsrfFilter (CookieCsrfTokenRepo)  │
│ 3. JwtAuthenticationFilter            │
│ 4. ExceptionTranslationFilter         │
└────────────────┬─────────────────────┘
                 │
          ¿Token válido?
         /           \
       SÍ             NO
       │              │
       │         403/401 Error
       │
┌──────▼──────────────────────────────┐
│ SecurityUtils.extractAuthorities()   │
│ • Parse JWT                          │
│ • Extract roles                      │
│ • Map to GrantedAuthority            │
└────────────────┬─────────────────────┘
                 │
┌────────────────▼─────────────────────┐
│ Authorization Security Interceptor    │
│ @PreAuthorize("hasRole('LANDLORD'")  │
└────────────────┬─────────────────────┘
                 │
          ¿Tiene role?
         /           \
       SÍ             NO
       │              │
       │         403 Forbidden
       │
┌──────▼──────────────────────────────┐
│   Controller → Service → Repository  │
│   Lógica de negocio ejecutada        │
└──────────────────────────────────────┘
```

### SecurityConfiguration.java - Configuración Detallada

```java
@Configuration
@EnableWebSecurity
public class SecurityConfiguration {
    
    // 1. OAUTH2 CONFIGURATION
    // Spring OAuth2 resource server integrado con Auth0
    SecurityFilterChain oauthSecurity(HttpSecurity http) {
        http
            // Habilitar OAuth2
            .oauth2ResourceServer(oauth2 -> 
                oauth2.jwt(jwt -> jwt
                    .decoder(jwtDecoder())
                    .jwtAuthenticationConverter(grantedAuthoritiesExtractor())
                )
            )
    }
    
    // 2. CSRF PROTECTION
    // Cookies seguras HTTP-only
    CsrfTokenRepository csrfTokenRepository() {
        CookieCsrfTokenRepository repository = 
            CookieCsrfTokenRepository.withHttpOnlyFalse();
        repository.setCookiePath("/");
        repository.setCookieName("XSRF-TOKEN");
        return repository;
    }
    
    // 3. CORS CONFIGURATION
    // Permitir requests desde frontend
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",      // Dev frontend
            "http://localhost:8080"       // Dev backend
        ));
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = 
            new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    // 4. AUTHORIZATION RULES
    // Rutas públicas vs protegidas
    authorizeHttpRequests(authorize -> authorize
        // Públicas
        .requestMatchers(
            "/api/tenant-listing/**",
            "/api/booking/check-availability",
            "/assets/**"
        ).permitAll()
        
        // Require LANDLORD role
        .requestMatchers("/api/landlord-listing/**")
        .hasRole("LANDLORD")
        
        // Require TENANT role
        .requestMatchers("/api/booking/create")
        .hasRole("TENANT")
        
        // Resto require autenticación (cualquier role)
        .anyRequest().authenticated()
    )
}
```

### SecurityUtils.java - Extracción de Autoridades

```java
@Component
public class SecurityUtils {
    
    /**
     * Convierte claims JWT en Spring GrantedAuthority
     * Ejecutado automáticamente por Spring Security
     */
    JwtAuthenticationConverter grantedAuthoritiesExtractor() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = 
            new JwtGrantedAuthoritiesConverter();
        
        // Leer roles desde JWT claim "roles"
        authoritiesConverter.setAuthoritiesClaimName("roles");
        authoritiesConverter.setAuthorityPrefix("ROLE_");
        
        return authoritiesConverter;
    }
    
    /**
     * Obtener usuario actual del SecurityContext
     */
    public static String getCurrentUsername() {
        Authentication authentication = 
            SecurityContextHolder.getContext().getAuthentication();
        
        return authentication != null 
            ? authentication.getName() 
            : null;
    }
    
    /**
     * Verificar si usuario tiene rol
     */
    public static boolean hasRole(String role) {
        Authentication auth = 
            SecurityContextHolder.getContext().getAuthentication();
        
        return auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
    }
}
```

### Token JWT - Estructura

```json
{
  "iss": "https://dev-domain.auth0.com/",
  "sub": "auth0|61234567890abcdefg",
  "aud": "https://api.airbnb-clone.com",
  "iat": 1616000000,
  "exp": 1616003600,
  "azp": "AbCdEfGhIjKlMnOpQrStUv",
  "scope": "openid profile email",
  
  // Claims personalizados
  "https://airbnb-clone/roles": ["LANDLORD"],
  "email": "user@example.com",
  "email_verified": true,
  "name": "John Doe"
}
```

---

## 🔄 Patrones de Diseño Implementados

### 1. **Repository Pattern**

```java
// Abstracción de acceso a datos
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
    Optional<User> findByPublicId(UUID publicId);
}

// Uso en Service
@Service
public class UserService {
    @Autowired private UserRepository userRepository;
    
    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
```

**Ventajas**:
- Fácil cambiar implementación de BD sin cambiar lógica
- Fácil testear con mocks
- Reutilizable en múltiples servicios

---

### 2. **Mapper Pattern (MapStruct)**

```java
// Definir transformación entity ↔ DTO
@Mapper(componentModel = "spring")
public interface UserMapper {
    User readUserDTOToUser(ReadUserDTO readUserDTO);
    ReadUserDTO userToReadUserDTO(User user);
    
    // Mapping personalizado
    @Mapping(source = "listing.id", target = "listingId")
    ListingDTO listingToListingDTO(Listing listing);
}

// Uso en Service
@Service
public class UserService {
    @Autowired private UserMapper userMapper;
    
    public ReadUserDTO getUser(UUID id) {
        User user = userRepository.findByPublicId(id).orElseThrow();
        return userMapper.userToReadUserDTO(user);
    }
}
```

**Ventajas**:
- Type-safe
- Zero runtime overhead (compilado en bytecode)
- Evita manual mapping propenso a errores

---

### 3. **DTO Pattern (Data Transfer Object)**

```java
// DTO para Solicitudes (input)
@Data @NoArgsConstructor @AllArgsConstructor
public class SaveListingDTO {
    @NotBlank private String title;
    @NotBlank private String description;
    @Positive private BigDecimal pricePerNight;
    @NotNull private Long categoryId;
}

// DTO para Respuestas (output)
@Data
public class DisplayCardListingDTO {
    private Long id;
    private String title;
    private BigDecimal pricePerNight;
    private String mainImageUrl;  // Primera imagen
    private AverageRating averageRating;
}

// DTO para Detalles
@Data
public class DetailedListingDTO extends DisplayCardListingDTO {
    private String description;
    private String address;
    private List<String> imageUrls;
    private UserDTO landlord;
}
```

**Ventajas**:
- Oculta detalles internos de entidades
- Valida entrada de usuario
- Optimiza payloads (no incluir campos innecesarios)
- Versioning de API más fácil

---

### 4. **Service Layer Pattern**

```java
@Service
@Transactional
public class ListingService {
    @Autowired private ListingRepository listingRepository;
    @Autowired private ListingMapper listingMapper;
    @Autowired private SecurityUtils securityUtils;
    
    /**
     * Crear nueva propiedad (solo Landlords)
     * Validaciones: 
     *   - Usuario debe ser LANDLORD
     *   - Datos válidos
     */
    public DisplayCardListingDTO saveListing(SaveListingDTO dto) {
        // 1. Obtener usuario actual
        User landlord = getCurrentUser();
        
        // 2. Validar que es Landlord
        if (!landlord.hasRole("LANDLORD")) {
            throw new AccessDeniedException("Solo Landlords pueden crear propiedades");
        }
        
        // 3. Mapear DTO → Entity
        Listing listing = listingMapper.saveListingDTOToListing(dto);
        listing.setLandlord(landlord);
        
        // 4. Persistir
        Listing saved = listingRepository.save(listing);
        
        // 5. Mapear Entity → DTO
        return listingMapper.listingToDisplayCardListingDTO(saved);
    }
}
```

**Ventajas**:
- Centraliza lógica de negocio
- Transacciones automáticas
- Validaciones antes de persistir
- Fácil testear

---

### 5. **Specification Pattern (para búsqueda)**

```java
// Criterios de búsqueda reutilizables
public class ListingSpecification {
    
    public static Specification<Listing> byCategory(Long categoryId) {
        return (root, query, cb) -> 
            cb.equal(root.get("category").get("id"), categoryId);
    }
    
    public static Specification<Listing> byPriceRange(
        BigDecimal minPrice, 
        BigDecimal maxPrice) {
        return (root, query, cb) -> 
            cb.between(root.get("pricePerNight"), minPrice, maxPrice);
    }
    
    public static Specification<Listing> byTitle(String keyword) {
        return (root, query, cb) -> 
            cb.like(cb.lower(root.get("title")), "%" + keyword + "%");
    }
}

// Usar en Repository
@Repository
public interface ListingRepository 
    extends JpaRepository<Listing, Long>, JpaSpecificationExecutor<Listing> {}

// Usar en Service
@Service
public class TenantService {
    public Page<DisplayCardListingDTO> search(SearchCriteria criteria) {
        Specification<Listing> spec = Specification
            .where(ListingSpecification.byCategory(criteria.getCategoryId()))
            .and(ListingSpecification.byPriceRange(
                criteria.getMinPrice(), 
                criteria.getMaxPrice()
            ))
            .and(ListingSpecification.byTitle(criteria.getKeyword()));
        
        Page<Listing> results = listingRepository.findAll(
            spec, 
            PageRequest.of(0, 20)
        );
        
        return results.map(listingMapper::listingToDisplayCardListingDTO);
    }
}
```

**Ventajas**:
- Búsquedas dinámicas sin queries hardcoded
- Reutilizable
- Type-safe

---

## 📝 Configuración y Propiedades

### application.yml (Base - DEV)

```yaml
spring:
  application:
    name: airbn-clone-back
  profiles:
    active: dev
  
  # Data Source (PostgreSQL)
  datasource:
    type: com.zaxxer.hikari.HikariDataSource
    url: jdbc:postgresql://${POSTGRES_URL:localhost}:${POSTGRES_PORT:5432}/${POSTGRES_DB:airbnb_clone}
    username: ${POSTGRES_USER:airbnb_user}
    password: ${POSTGRES_PASSWORD:password}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 20000
  
  # JPA / Hibernate
  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    hibernate:
      ddl-auto: validate  # No auto-generate, usar Liquibase
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
        jdbc:
          batch_size: 20
  
  # Liquibase (Database Migrations)
  liquibase:
    enabled: true
    change-log: classpath:db/changelog/master.xml
    contexts: dev
    default-schema: public
  
  # Multipart file upload
  servlet:
    multipart:
      max-file-size: 100MB
      max-request-size: 100MB
  
  # Security
  security:
    oauth2:
      resource-server:
        jwt:
          issuer-uri: ${AUTH0_ISSUER_URI}
          jwk-set-uri: ${AUTH0_ISSUER_URI}.well-known/jwks.json

# Server
server:
  port: ${SERVER_PORT:8080}
  servlet:
    context-path: /

# Logging
logging:
  level:
    root: INFO
    com.airbnb.airbn_clone_back: DEBUG
    org.springframework.security: DEBUG
    org.springframework.web: DEBUG
```

---

## 🧪 Testeable y Mantenible

### Ejemplo: Test Unitario de Service

```java
@ExtendWith(MockitoExtension.class)
class ListingServiceTest {
    
    @Mock private ListingRepository listingRepository;
    @Mock private ListingMapper listingMapper;
    @InjectMocks private ListingService listingService;
    
    @Test
    void shouldThrowException_WhenUserIsNotLandlord() {
        // Arrange
        SaveListingDTO dto = new SaveListingDTO(
            "Beautiful Villa", 
            "Ocean view", 
            BigDecimal.valueOf(100),
            1L
        );
        User user = User.builder()
            .authorities(Set.of(new Authority("TENANT")))
            .build();
        
        // Act & Assert
        assertThrows(AccessDeniedException.class, 
            () -> listingService.saveListing(dto));
    }
    
    @Test
    void shouldSaveListingSuccessfully() {
        // Arrange
        SaveListingDTO dto = new SaveListingDTO(...);
        User landlord = User.builder()
            .authorities(Set.of(new Authority("LANDLORD")))
            .build();
        
        Listing mapping = new Listing(...);
        Listing persisted = new Listing(...);
        DisplayCardListingDTO output = new DisplayCardListingDTO(...);
        
        when(listingMapper.saveListingDTOToListing(dto))
            .thenReturn(mapping);
        when(listingRepository.save(mapping))
            .thenReturn(persisted);
        when(listingMapper.listingToDisplayCardListingDTO(persisted))
            .thenReturn(output);
        
        // Act
        DisplayCardListingDTO result = listingService.saveListing(dto);
        
        // Assert
        assertEquals(output.getId(), result.getId());
        verify(listingRepository).save(mapping);
    }
}
```

---

## 🚀 Decisiones de Diseño Clave

| Decisión | Razón | Alternativa Rechazada |
|----------|-------|----------------------|
| OAuth2 en lugar de JWT puro | OAuth2 maneja refreshes automáticos, mejor seguridad | JWT manual (más complejidad) |
| Módulos por dominio | Crecimiento escalable, fácil mantener | Modelos por capas (menos mantenible) |
| Repositories genéricos | Menos código, reutilizable | Dao personalizados |
| DTOs separados por operación | API versioning fácil, validaciones específicas | DTOs globales (inflexibles) |
| Liquibase para migraciones | Versionado de BD, reproducible | Manual SQL (propenso a errores) |
| Specifications en lugar de queries | Type-safe, reutilizable | Queries SQL strings |
| MapStruct en lugar de manual | Zero overhead, mantenible | Manual mapping (propenso a errores) |

---

## 📚 Recursos Recomendados

- [Clean Architecture - Robert Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [Spring Security Best Practices](https://spring.io/projects/spring-security)
- [MapStruct Documentation](https://mapstruct.org/)
- [JPA Specifications](https://www.baeldung.com/spring-data-jpa-query)

---

**Última actualización**: Marzo 2026

