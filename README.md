# Techo v1 - Sistema de Gestión de Cuadrillas, Ubicación, Herramientas, Materiales y Almuerzos

Este es el repositorio oficial de **Techo v1**, una plataforma web diseñada para la coordinación, control y geolocalización de cuadrillas, asignación de herramientas y materiales (medias aguas), control de alimentación/almuerzos y registro de voluntarios.

---

## Módulos del Sistema

1. **Dashboard / Resumen:** Métricas en tiempo real de cuadrillas incompletas, voluntarios registrados y estado de los almuerzos.
2. **Geolocalización:** Mapa interactivo que muestra las direcciones registradas y las ubicaciones georreferenciadas de las cuadrillas activas.
3. **Grupos / Cuadrillas:** Panel para configurar cuadrillas, asignar capataces de zona, autogenerar asignaciones de herramientas/materiales y monitorear el cumplimiento de metas del equipo.
4. **Herramientas:** Inventario de herramientas en stock, historial de préstamos, y devoluciones de equipos asignados a voluntarios.
5. **Materiales:** Inventario y registro de consumo de insumos de construcción (maderas, planchas de zinc, grava, etc.) asociados a la meta de construcción de viviendas.
6. **Almuerzos (Alimentación):** Control de raciones de comida y asignación de porciones a las cuadrillas agrupadas por turnos (*Mañana, Tarde y Noche*).
7. **Registro:** Panel administrativo de control de voluntarios y registro seguro de nuevos usuarios (administradores y voluntarios).

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React** (Vite como empaquetador)
- **Vite Router & State Management**
- **Lucide React** (Biblioteca de íconos vectoriales)
- **SweetAlert2** (Notificaciones y modales premium)
- **Vanilla CSS** (Diseño adaptable, moderno y responsivo)

### Backend
- **Node.js + Express** (Servidor API REST)
- **TypeORM** (Mapeador objeto-relacional para base de datos)
- **PostgreSQL / pg** (Motor de base de datos relacional)
- **JSON Web Tokens (JWT) & bcrypt** (Autenticación y encriptación de seguridad)

---

## ⚙️ Instrucciones de Configuración y Ejecución

El proyecto está dividido en dos directorios principales: `frontend` y `backend`.

### 📂 Configuración del Backend

1. Dirígete a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` en la raíz de la carpeta `backend` configurando tus variables de entorno para la base de datos PostgreSQL:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_NAME=techo_db
   JWT_SECRET=tu_clave_secreta_jwt
   ```
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   *(El servidor correrá en `http://localhost:5000`)*

### 📂 Configuración del Frontend

1. Dirígete a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
3. Inicia el servidor local de desarrollo:
   ```bash
   npm run dev
   ```
   *(La aplicación cargará en `http://localhost:5173`)*

4. Para compilar a producción:
   ```bash
   npm run build
   ```

---

## 🌐 Configuración de Entornos (Universidad / Local)

El sistema opera bajo los siguientes puertos y entornos por defecto:

| Componente | Puerto Local (Desarrollo) | Puerto Producción (Universidad) | Comando de Ejecución |
| :--- | :---: | :---: | :--- |
| **Backend** | `5000` | `80` (vía PM2) | `node index.js` |
| **Frontend** | `5173` (Vite dev) | `4173` | `npm run build` + `vite preview` |

> [!IMPORTANT]
> En desarrollo local, el backend corre de forma directa con `node index.js` (sin recarga automática). Al realizar cambios en el código del servidor, es necesario detener la ejecución en consola y volver a iniciarla.
