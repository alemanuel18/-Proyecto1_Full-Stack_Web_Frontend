# Tracked — Frontend

Interfaz web para gestionar tu lista de series. Construida en HTML, CSS y JavaScript vanilla, servida con nginx dentro de Docker.

**Backend repo:** [Backend](https://github.com/alemanuel18/Proyecto1_Full-Stack_Web_Backend.git)

---

## Stack

| Tecnología | Uso |
|---|---|
| HTML / CSS / JS vanilla | Sin frameworks ni bundlers |
| nginx 1.25 | Servidor de archivos estáticos |
| Docker + Docker Compose | Contenedor y orquestación |
| Google Fonts | Playfair Display + DM Sans |

---

## Estructura del proyecto

```
frontend/
├── index.html                 # Entry point
├── css/
│   └── styles.css             # Estilos globales (variables, componentes, responsive)
├── js/
│   ├── config.js              # ⚠️ No se sube al repo — generado por Docker
│   ├── loader.js              # Carga los partials e inyecta el HTML en el DOM
│   ├── api.js                 # Wrapper de fetch hacia el backend
│   ├── ui.js                  # Renderizado de tarjetas, modales, paginación, toasts
│   ├── main.js                # Estado de la app, eventos y lógica principal
│   ├── detail.js              # Drawer lateral de detalle de serie
│   └── export.js              # Exportación a CSV
├── partials/
│   ├── auth.html              # Pantalla de login / registro
│   ├── navbar.html            # Barra de navegación
│   ├── header.html            # Filtros, búsqueda y stats
│   ├── grid.html              # Grid de tarjetas y estado vacío
│   ├── detail.html            # Drawer de detalle
│   ├── modal-series.html      # Modal crear / editar serie
│   └── modal-confirm.html     # Modal de confirmación de eliminación
├── Dockerfile                 # Build con nginx + generación de config.js
├── docker-compose.yml         # Servicio frontend
├── nginx.conf                 # Configuración de nginx
├── .env.example               # Plantilla de variables de entorno
└── .gitignore
```

---

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) y Docker Compose
- El backend corriendo y accesible (ver backend repo)

---

## Correr en local

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/seriestracker-frontend.git
cd seriestracker-frontend

# 2. Crear el archivo de entorno
cp .env.example .env
# Si el backend corre en otro puerto, editar API_URL en .env

# 3. Levantar el contenedor
docker compose up --build
```

El frontend queda disponible en `http://localhost:3000`.

```bash
docker compose up --build -d   # Correr en background
docker compose logs -f frontend # Ver logs
docker compose down             # Detener
```

---

## Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `API_URL` | URL base del backend | `http://localhost:8080` |
| `FRONTEND_PORT` | Puerto local expuesto | `3000` |

> **¿Por qué no hay un `js/config.js` en el repo?**
> El archivo se genera automáticamente durante el build de Docker a partir del `ARG API_URL`. Nunca se commitea para evitar exponer URLs o credenciales. El `.env.example` sirve como plantilla.

---

## Pasar a producción

Solo hay que cambiar `API_URL` en el `.env` y rebuildar:

```bash
# .env
API_URL=https://api.tudominio.com
FRONTEND_PORT=3000
```

```bash
docker compose up --build -d
```

El `Dockerfile` regenera `config.js` con la nueva URL en cada build.

---

## Funcionalidades

- [x] Registro e inicio de sesión con JWT
- [x] Listado de series en grid con portadas
- [x] Crear, editar y eliminar series
- [x] Subida de portada (JPG, PNG, WEBP · máx 1MB)
- [x] Drawer lateral con detalle de serie
- [x] Filtro por estado (Viendo, Completada, Pendiente, Abandonada)
- [x] Búsqueda por título en tiempo real
- [x] Ordenamiento por título, rating o fecha
- [x] Paginación
- [x] Stats animadas (total, viendo, completadas, abandonadas)
- [x] Exportación a CSV
- [x] Diseño responsive (móvil y escritorio)

---

## Screenshot

## Screenshot

_[Login]_

<img width="1920" height="1038" alt="Login" src="https://github.com/user-attachments/assets/2e82d150-a91f-46d9-8c82-a3c74dc98588" />

_[Filtros]_

<img width="1920" height="1038" alt="Filtro1" src="https://github.com/user-attachments/assets/8c2fa236-c5f6-4e4c-8027-fbf21d9dea3b" />

<img width="1920" height="1038" alt="Filtro2" src="https://github.com/user-attachments/assets/b2cf98bb-2c95-462f-ae1b-9183c0e768c7" />

<img width="1920" height="1038" alt="Filtro3" src="https://github.com/user-attachments/assets/e383a9bc-a614-4bdf-b9df-0086b584b4a9" />

<img width="1920" height="1038" alt="Filtro4" src="https://github.com/user-attachments/assets/f7c33929-3944-4e29-b3fe-917ba5b07480" />

_[Crear Serie]_

<img width="1920" height="1038" alt="Crear1" src="https://github.com/user-attachments/assets/3e212252-a533-4bad-ab56-c38178b2f080" />

<img width="1920" height="1038" alt="Crear2" src="https://github.com/user-attachments/assets/91c635b2-9cab-43a8-a673-d2e57706f477" />

_[Eliminar Serie]_

<img width="1920" height="1038" alt="Eliminar" src="https://github.com/user-attachments/assets/fa6c232e-00a1-494d-8961-300ce27bdbe6" />


_[Detalle Serie]_

<img width="1920" height="1038" alt="Detalle" src="https://github.com/user-attachments/assets/d807d3e4-8310-4552-b8cf-3facacfbc3dc" />
