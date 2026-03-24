# 🔧 Guía de Setup e Instalación

Guía paso a paso para configurar y ejecutar el backend del Airbnb Clone localmente.

---

## 📋 Requisitos Previos

Asegúrate de tener instalado:

- **Java 21+** - Verificar con `java -version`
- **Maven 3.9+** - Verificar con `mvn -version`
- **PostgreSQL 13+** - [Descargar](https://www.postgresql.org/download/)
- **Git** - [Descargar](https://git-scm.com/)
- **Auth0 Account** - [Crear cuenta](https://auth0.com/) (gratuita para desarrollo)

---

## 🎯 Instalación Paso a Paso

### 1️⃣ Clonar el Repositorio

```bash
# HTTPS
git clone https://github.com/tu-usuario/airbn-clone-back.git
cd airbn-clone-back

# SSH (si tienes clave configurada)
git clone git@github.com:tu-usuario/airbn-clone-back.git
cd airbn-clone-back
```

### 2️⃣ Configurar PostgreSQL

#### Windows

```powershell
# Instalar PostgreSQL (si aún no lo tienes)
# Descargar desde: https://www.postgresql.org/download/windows/

# Conectar a PostgreSQL
psql -U postgres

# En la consola psql, crear BD y usuario:
CREATE USER airbnb_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE airbnb_clone OWNER airbnb_user;
ALTER ROLE airbnb_user SET client_encoding TO 'utf8';
ALTER ROLE airbnb_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE airbnb_user SET default_transaction_deferrable TO on;
ALTER ROLE airbnb_user SET default_time_zone TO 'UTC';

# Verificar creación
\l
\du
\q
```

#### macOS/Linux

```bash
# Instalar PostgreSQL (Homebrew en macOS)
brew install postgresql

# Iniciar servicio
brew services start postgresql

# Conectar
psql postgres

# Crear usuario y BD (dentro de psql):
CREATE USER airbnb_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE airbnb_clone OWNER airbnb_user;
ALTER ROLE airbnb_user SET client_encoding TO 'utf8';
ALTER ROLE airbnb_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE airbnb_user SET default_transaction_deferrable TO on;
ALTER ROLE airbnb_user SET default_time_zone TO 'UTC';

\q
```

### 3️⃣ Configurar Auth0

1. **Crear Cuenta**: Ir a [auth0.com](https://auth0.com/)

2. **Crear Aplicación**:
   - Dashboard → Applications → Create Application
   - Seleccionar: "Regular Web Applications"
   - Nombre: `Airbnb Clone Backend`
   - Crear

3. **Configurar Settings**:
   - Ir a la aplicación recién creada
   - Copiar: `Client ID` y `Client Secret`
   - En **Allowed Callback URLs**, agregar:
     ```
     http://localhost:8080/login/oauth2/code/auth0
     http://localhost:8080/api/auth/callback
     ```
   - En **Allowed Logout URLs**, agregar:
     ```
     http://localhost:8080
     http://localhost:8080/logged-out
     ```
   - En **Allowed Origins (CORS)**, agregar:
     ```
     http://localhost:8080
     http://localhost:3000
     ```
   - Guardar cambios

4. **Crear Roles** (en el dashboard):
   - Settings → Roles → Create Role
   - **Rol 1**: Name = `LANDLORD`, Description = `Propietario de propiedades`
   - **Rol 2**: Name = `TENANT`, Description = `Arrendatario/Huésped`

5. **Obtener Información**:
   - Tu Domain: Ej. `dev-u0zrcpwkth27whmj.us.auth0.com`
   - Tu Client ID: Ej. `AbCdEfGhIjKlMnOpQrStUv`
   - Tu Client Secret: ✓ (guardado arriba)

### 4️⃣ Crear Archivo de Configuración

Crear un archivo `.env` en la raíz del proyecto:

```bash
# Crear archivo
touch .env  # macOS/Linux
# o
New-Item .env -Type File  # PowerShell en Windows
```

Agregar contenido:

```env
# ============================================
# PostgreSQL Configuration
# ============================================
POSTGRES_USER=airbnb_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_URL=localhost
POSTGRES_PORT=5432
POSTGRES_DB=airbnb_clone

# ============================================
# Auth0 Configuration
# ============================================
AUTH0_DOMAIN=dev-u0zrcpwkth27whmj.us.auth0.com
AUTH0_CLIENT_ID=your_client_id_here
AUTH0_CLIENT_SECRET=your_client_secret_here
AUTH0_ISSUER_URI=https://dev-u0zrcpwkth27whmj.us.auth0.com/
AUTH0_AUDIENCE=https://api.airbnb-clone.com

# ============================================
# Application Configuration
# ============================================
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=dev

# ============================================
# Logging
# ============================================
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_AIRBNB=DEBUG

# ============================================
# Upload Configuration
# ============================================
MAX_FILE_SIZE=100MB
MAX_REQUEST_SIZE=100MB
```

**⚠️ IMPORTANTE**: Incluir `.env` en `.gitignore` para no subir secretos:

```bash
# En .gitignore
.env
.env.local
.env.*.local
```

### 5️⃣ Instalar Dependencias

```bash
# Descargar y compilar el proyecto
mvn clean install

# Si hay errores, limpiar caché de Maven
mvn clean
rm -rf ~/.m2/repository/com/airbnb  # macOS/Linux
# o
Remove-Item -Recurse -Force $env:USERPROFILE\.m2\repository\com\airbnb  # PowerShell
```

### 6️⃣ Cargar Configuración de Entorno

**Opción A**: Variables de entorno del sistema

```bash
# macOS/Linux - Agregar a ~/.bash_profile o ~/.zshrc
export POSTGRES_USER=airbnb_user
export POSTGRES_PASSWORD=your_secure_password
export AUTH0_DOMAIN=dev-u0zrcpwkth27whmj.us.auth0.com
# ... resto

source ~/.bash_profile  # Recargar

# Windows PowerShell
$env:POSTGRES_USER="airbnb_user"
$env:POSTGRES_PASSWORD="your_secure_password"
# ...
```

**Opción B**: IDE (IntelliJ IDEA / VS Code)

**IntelliJ IDEA**:
- Run → Edit Configurations
- Spring Boot → AirbnCloneBackbApplication
- Environment variables: Pegar contenido de `.env`
- Apply → OK

**VS Code**:
- Crear carpeta `.vscode`
- Archivo `launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "name": "Spring Boot App",
      "request": "launch",
      "mainClass": "com.airbnb.airbn_clone_back.AirbnCloneBackbApplication",
      "projectName": "airbn-clone-back",
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "env": {
        "POSTGRES_USER": "airbnb_user",
        "POSTGRES_PASSWORD": "your_secure_password",
        "AUTH0_DOMAIN": "dev-u0zrcpwkth27whmj.us.auth0.com",
        "AUTH0_CLIENT_ID": "your_client_id"
      }
    }
  ]
}
```

### 7️⃣ Ejecutar la Aplicación

#### Opción 1: Maven CLI

```bash
mvn spring-boot:run
```

#### Opción 2: IDE

**IntelliJ IDEA**:
- Click derecho en `AirbnCloneBackbApplication.java`
- Run 'AirbnCloneBackbApplication'

**VS Code**:
- Presionar `F5` (o Debug → Start Debugging)

#### Opción 3: JAR Ejecutable

```bash
# Build
mvn clean package -DskipTests

# Ejecutar
java -jar target/airbn-clone-back-*.jar
```

### ✅ Verificar que Todo Funciona

```bash
# 1. La aplicación debería loguear:
# ✓ org.springframework.boot.Application           : Started AirbnCloneBackbApplication in X seconds

# 2. Verificar endpoint público (sin auth):
curl http://localhost:8080/api/tenant-listing/get-all-by-category

# 3. Resultado esperado:
# {"data": [...], "success": true}
```

---

## 🐛 Troubleshooting

### Error: "psql: command not found"

```bash
# macOS - Instalar PostgreSQL
brew install postgresql@13

# Agregar a PATH
echo 'export PATH="/usr/local/opt/postgresql@13/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Windows - Agregar a PATH:
# 1. Buscar "Editar variables de entorno"
# 2. New → Variable: Path
# 3. Agregar: C:\Program Files\PostgreSQL\13\bin
```

### Error: "FATAL: role 'airbnb_user' does not exist"

```bash
# Verificar roles creados
psql -U postgres -c "\du"

# Si no aparece airbnb_user, crear de nuevo:
psql -U postgres
CREATE USER airbnb_user WITH PASSWORD 'your_password';
ALTER ROLE airbnb_user CREATEDB;
\q
```

### Error: "Connection to localhost:5432 refused"

```bash
# 1. Verificar que PostgreSQL está corriendo
psql -U postgres

# 2. Si no funciona, reiniciar:
# Windows
net stop postgresql-x64-13
net start postgresql-x64-13

# macOS
brew services restart postgresql

# Linux
sudo systemctl restart postgresql
```

### Error: "Could not resolve placeholder ... AUTH0_CLIENT_ID"

- Verificar que el archivo `.env` existe y está en la raíz
- Verificar que las variables están configuradas en el IDE
- Reiniciar la aplicación después de cambiar `.env`

### Puerto 8080 ya en uso

```bash
# Encontrar proceso usando puerto 8080
# Windows PowerShell
netstat -ano | findstr :8080

# macOS/Linux
lsof -i :8080

# Cambiar puerto en application.yml o variable de entorno
export SERVER_PORT=8081
```

### Error: "LiquibaseException: Error executing SQL"

- Verificar que la BD `airbnb_clone` existe
- Verificar conexión a PostgreSQL
- Limpiar y reconstruir:
  ```bash
  mvn clean install
  ```

---

## 📚 Configuración Adicional (Opcional)

### Habilitar Debug Mode

Editar `application-dev.yml`:
```yaml
logging:
  level:
    root: DEBUG
    org.springframework: DEBUG
    com.airbnb: TRACE
```

### Cambiar Puerto

```bash
export SERVER_PORT=9090
# o en application.yml
server.port: 9090
```

### Conectar a BD Remota

En `.env`:
```env
POSTGRES_URL=your-remote-host.com
POSTGRES_PORT=5433
```

---

## ✨ Próximos Pasos

1. ✅ Aplicación funcionando en `http://localhost:8080`
2. 📖 Leer [ARCHITECTURE.md](ARCHITECTURE.md) para entender la estructura
3. 📝 Consultar [README.md](README.md) para endpoints disponibles
4. 🧪 Ejecutar tests: `mvn test`

---

## 📞 Soporte

Si encuentras problemas:

1. Revisar logs en consola (búscar `ERROR` o `WARN`)
2. Activar modo DEBUG
3. Verificar sección de Troubleshooting arriba
4. Consultar documentación oficial de tecnologías

**Última actualización**: Marzo 2026
