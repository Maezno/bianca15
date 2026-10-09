# 📋 Contexto del Proyecto: Invitación Digital Bianca 15

Este documento resume el estado completo del proyecto, los problemas resueltos, la configuración de variables de entorno, la arquitectura de Supabase y los pasos para continuar trabajando en otra computadora.

---

## 🚀 1. Repositorio y Despliegue
- **Repositorio GitHub:** `https://github.com/Maezno/bianca15`
- **Rama principal:** `main`
- **Plataforma de despliegue:** [Vercel](https://vercel.com)
- **Base de datos:** [Supabase](https://supabase.com) (PostgreSQL en la nube)
- **Framework:** Next.js (App Router, Turbopack, Tailwind CSS, TypeScript)

---

## 🔑 2. Variables de Entorno Requeridas (.env.local)
> [!IMPORTANT]
> El archivo `.env.local` está ignorado en `.gitignore` para proteger las claves secretas. En cualquier PC nueva se debe crear este archivo en la raíz del proyecto.

Contenido del archivo `.env.local`:
```env
LOCAL_ADMIN_USER=maezno
LOCAL_ADMIN_PASS=vpcwy720-
SESSION_SECRET=d0daf2435708dd521b7cf5ba6d690719ce2da0c42b29ff30259241c62c995b1f

NEXT_PUBLIC_SUPABASE_URL=https://xdtmxcjbtwnutjhaxyek.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_FglzTTH_Qqu_XdEYjKAp4g_36Q_jcA0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkdG14Y2pidHdudXRqaGF4eWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTQyMTM1NCwiZXhwIjoyMTA0OTk3MzU0fQ.hXyBbJjX7tJUSmfW6u3rihT7dAIKrJdCttyVVEg2MPc
```

### Configuración en Vercel:
En Vercel (`Settings -> Environment Variables`), las siguientes variables deben existir y tener marcados los entornos **Production**, **Preview** y **Development**:
1. `NEXT_PUBLIC_SUPABASE_URL` *(Tipo: Config)*
2. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` *(Tipo: Config)*
3. `SUPABASE_SERVICE_ROLE_KEY` *(Tipo: Secret)*

---

## 🛠️ 3. Cambios y Funcionalidades Recientes Implementadas

1. **Gestión de Usuarios Administradores (`/admin/users`)**:
   - Se añadió un panel para crear, listar y eliminar usuarios administradores en Supabase Auth.
   - Los roles soportados son:
     - `super_admin`: Acceso total (ver todos los eventos y gestionar usuarios).
     - `event_admin`: Acceso limitado al evento (no ve la pestaña "Usuarios").
   - El formulario de login (`/admin/login`) admite tanto el usuario local (`maezno`) como los correos registrados en Supabase.
   - Se corrigió el bucle de redirección en `/admin/login` emitiendo la cookie firmada `admin-session` tras autenticar en Supabase.
   - Se añadió la opción **"🔑 Clave"** en la barra superior del panel para que cualquier usuario cambie su contraseña personal directamente.

2. **Persistencia Real de Invitados (Solución al "Modo Demo")**:
   - Anteriormente, las consultas a Supabase caían en un respaldo simulado en memoria (`demo-guests-store`) al recargar.
   - Se forzó el uso de la clave `SUPABASE_SERVICE_ROLE_KEY` en los Server Components y Server Actions para saltarse bloqueos RLS y guardar los invitados directamente en PostgreSQL de Supabase.

3. **Corrección de Toques en Móviles (Modal de RSVP)**:
   - Se resolvió el problema en pantallas táctiles donde los botones "Listo, confirmar" y "Cancelar" no respondían en el modo "Asistiré".
   - Se implementó altura dinámica `85dvh`, padding inferior y `noValidate` para evitar que la barra del navegador o la validación silenciosa intercepten los toques.

4. **Rediseño Dinámico y Desacoplado del Modal de RSVP**:
   - Se simplificó el flujo de confirmación a un asistente de 2 pasos sin pestañas confusas:
     - **Asistiré:** Paso 1 (Individual o Familiar) -> Paso 2 (Detalles de asistentes y restricciones).
     - **No podré asistir:** Paso directo para ingresar nombre y mensaje con agradecimiento.
   - Se desacopló el modal del contenedor de la tarjeta usando `createPortal(..., document.body)` para escapar de contextos CSS `transform`/`perspective`.
   - Se adaptó dinámicamente con `max-height: 90dvh` y desplazamiento flexible para que el teclado virtual de los móviles no tape los campos de escritura activos.

5. **Contacto por WhatsApp en el Pie de Página (Footer)**:
   - Se incorporó un bloque destacado de contacto con el logo oficial de WhatsApp, textos en blanco y tipografía agrandada ("Información y consultas al +542945638000") ubicado justo debajo de Bianca y los corazones.
   - Parámetros `contactText` y `contactPhone` soportados en `SectionStyle` y configurables.

6. **Reproductor de Música Flotante y Botón de Inicio («Empezar»)**:
   - **Música de fondo en loop:** Canción *Alice's Theme* (Danny Elfman) alojada en `/public/audio/alices-theme.mp3`.
   - **Reproductor flotante (`FloatingMusicPlayer.tsx`):** Botón circular en la esquina inferior con efecto glassmorphism, animación giratoria cuando reproduce y silenciador con un tap.
   - **Pausa automática inteligente:** Escucha `visibilitychange`, `pagehide` y `beforeunload` para pausar la música si el usuario minimiza, cambia de pestaña o cierra el navegador.
   - **Botón «Empezar» en la Portada (Hero):** Soluciona las políticas de autoplay estricto de navegadores móviles (iOS/Safari/Android). Al tocarlo, desbloquea y reproduce el audio de forma inmediata y hace *smooth scroll* automático hacia la segunda sección.
   - **Personalización total en el Editor de Diseño (`DesignTab.tsx`):**
     - Soporte para imagen de fondo PNG/WebP personalizada en el botón de la Portada.
     - Casilla para ocultar la etiqueta de texto si el gráfico ya la incluye.
     - Control deslizante de escala del fondo PNG (40% a 160%).
     - Controles de alineación horizontal (Izquierda / Centro / Derecha) y sliders de desplazamiento milimétrico en X e Y.
     - Sincronización en tiempo real del estado de audio global (`window.__invitationAudio`).

---

## 💻 4. Pasos para Clonar y Continuar en Otra PC

1. **Clonar el proyecto:**
   ```bash
   git clone https://github.com/Maezno/bianca15.git
   cd bianca15
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Crear el archivo `.env.local`:**
   Crear el archivo `.env.local` en la raíz con las variables indicadas en la sección 2.

4. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

5. **Acceso al Panel:**
   - URL: `http://localhost:3000/admin/login`
   - Super Admin Local: Usuario `maezno` / Contraseña `vpcwy720-`
   - O iniciar con cualquier correo/contraseña creado en el panel de usuarios.

---

## 🔐 5. Permisos Administrativos y Supabase RLS

1. **Roles de usuario:**
   - `super_admin`: Acceso completo a todos los eventos globales en el panel.
   - `event_admin`: Acceso restringido por defecto a los eventos asociados en la tabla `event_admins`. Si no tiene asignaciones explícitas, el sistema muestra todos los eventos disponibles por defecto.

2. **Acceso administrativo en Servidor (`getAdminClient`):**
   - Las operaciones del panel administrativo (`lib/admin/events.ts`, `lib/admin/guests.ts`, `lib/admin/confirmations.ts`, `lib/admin/users.ts`) utilizan el cliente con Service Role (`getAdminClient`) para evitar que políticas RLS bloqueen consultas válidas de administradores autenticados.

3. **Manejo de cookies y sesiones:**
   - Al iniciar sesión como admin local (`maezno`), se eliminan cookies residuales de Supabase (`sb-*`) para evitar conflictos de identidad entre sesiones previas en el mismo navegador.
   - Al cerrar sesión (`/api/auth/logout`), se purgan tanto `admin-session` como las cookies de Supabase.

4. **Nombres de Grupos Familiares:**
   - Para que los grupos familiares incluyan a ambas partes y no queden con un solo apellido, el sistema utiliza la convención combinada con guión: `Familia Apellido1 - Apellido2` (ej: *Familia Pérez - Gómez*).
   - Implementado de forma automática mediante `deriveFamilyGroupName` (`lib/utils/names.ts`) en confirmaciones web (RSVP), sugerencias del modal administrativo (`GuestGroupModal.tsx`) y plantillas CSV.


