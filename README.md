# Sistema de Gestión - Lavandería el Cobre SPA

<div align="center">
  <img src="https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Firebase-12.5.0-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Tailwind-3.3.6-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
</div>

<br />

<div align="center">
  <p><strong>Sistema integral de gestión de inventario para lavandería profesional</strong></p>
  <p>Desarrollado con React, TypeScript y Firebase para una experiencia moderna y eficiente</p>
</div>

---

## Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Scripts Disponibles](#scripts-disponibles)
- [Despliegue](#despliegue)

---

## Características

### Gestión de Inventario
- CRUD completo de productos
- Categorización por tipos (Detergentes, Suavizantes, Blanqueadores, etc.)
- Búsqueda y filtrado en tiempo real
- Control de stock y precios
- Asignación de proveedores

### Gestión de Proveedores
- Registro completo de proveedores
- Información de contacto (email, teléfono, dirección)
- Edición y eliminación de proveedores
- Vista tipo tarjetas para fácil acceso

### Dashboard
- Vista general del sistema
- Accesos rápidos a funciones principales
- Interfaz intuitiva y moderna
- Diseño responsive

### Historial de Actividades
- Registro completo de operaciones (crear, actualizar, eliminar)
- Auditoría de cambios por usuario
- Visualización cronológica
- Detalles de modificaciones

### Sistema de Autenticación
- Login seguro con Firebase Authentication
- Protección de rutas
- Gestión de sesiones
- Roles de usuario

---

## Tecnologías

### Frontend
- **React 19.1.1** - Librería de UI
- **TypeScript 5.9.3** - Tipado estático
- **Vite 7.1.7** - Build tool y dev server
- **React Router DOM 7.9.5** - Enrutamiento
- **Tailwind CSS 3.3.6** - Estilos utility-first

### Backend y Servicios
- **Firebase 12.5.0**
  - Authentication - Autenticación de usuarios
  - Firestore - Base de datos en tiempo real
  - Hosting - Despliegue

### Gestión de Estado y Forms
- **React Hook Form 7.66.0** - Manejo de formularios
- **Zod 4.1.12** - Validación de esquemas
- **@hookform/resolvers 5.2.2** - Integración Zod + React Hook Form

### UI y UX
- **Lucide React 0.552.0** - Iconos
- **Sonner 2.0.7** - Notificaciones toast
- **date-fns 4.1.0** - Manejo de fechas
- **clsx + tailwind-merge** - Utilidades de CSS

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 20.0.0 o superior)
- **npm** o **yarn**
- **Git**
- **Cuenta de Firebase** (para configuración del backend)

---

## Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/lavanderia-react-firebase.git
cd lavanderia-react-firebase
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto:
```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

4. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## Configuración

### Configuración de Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)

2. Habilita **Authentication**:
   - Ve a Authentication > Sign-in method
   - Habilita "Email/Password"

3. Crea una base de datos **Firestore**:
   - Ve a Firestore Database
   - Crea una base de datos en modo producción
   - Configura las reglas de seguridad

4. Obtén las credenciales:
   - Ve a Project Settings
   - Copia las credenciales de configuración
   - Pégalas en tu archivo `.env`

### Reglas de Firestore (Ejemplo)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Estructura del Proyecto
```
lavanderia-react-firebase/
├── src/
│   ├── components/
│   │   └── Layout/
│   │       └── Sidebar.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── useHistory.ts
│   │   ├── useProducts.ts
│   │   └── useSuppliers.ts
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── history.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── History.tsx
│   │   ├── Login.tsx
│   │   ├── Products/
│   │   │   ├── ProductForm.tsx
│   │   │   └── ProductList.tsx
│   │   └── Suppliers/
│   │       ├── SupplierForm.tsx
│   │       └── SupplierList.tsx
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

---

## Scripts Disponibles
```bash
# Desarrollo
npm run dev          # Inicia el servidor de desarrollo

# Producción
npm run build        # Genera el build de producción
npm run preview      # Preview del build de producción

# Linting
npm run lint         # Ejecuta ESLint
```

---

## Despliegue

### Despliegue en Vercel

1. **Conecta tu repositorio**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub

2. **Configura las variables de entorno**
   - Agrega todas las variables `VITE_FIREBASE_*`

3. **Despliega**
   - Vercel detectará automáticamente Vite
   - El despliegue se realizará automáticamente

### Despliegue con Firebase Hosting
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar
firebase init hosting

# Construir
npm run build

# Desplegar
firebase deploy
```

---

## Características de Seguridad

- Autenticación obligatoria para acceder al sistema
- Rutas protegidas con HOC
- Validación de formularios con Zod
- Reglas de seguridad en Firestore
- Variables de entorno para credenciales

---

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## Contacto

**Desarrollador**: Tu Nombre  
**Email**: tu-email@ejemplo.com  
**Proyecto**: [GitHub](https://github.com/tu-usuario/lavanderia-react-firebase)

---

<div align="center">
  <p>Hecho con React y TypeScript</p>
  <p>© 2024 Lavandería el Cobre SPA</p>
</div>