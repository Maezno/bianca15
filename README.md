# Plataforma de Invitaciones Digitales (Multi-Evento)

Motor reutilizable y multi-tenant de invitaciones web interactivas.

---

## 🌟 Arquitectura Multi-Evento

La plataforma está diseñada para hospedar múltiples eventos independientes sobre una misma base de código, misma infraestructura y misma base de datos, garantizando aislamiento estricto entre clientes.

### Diagrama Conceptual

```text
                     PLATAFORMA MULTI-EVENTO
                                │
               ┌────────────────┴────────────────┐
               │                                 │
          EVENTO 001                        EVENTO 002
       Bianca - 15 años                    Juan y María
        (slug: bianca-15)               (slug: juan-y-maria)
        Template: wonderland              Template: elegant
               │                                 │
        ┌──────┴──────┐                   ┌──────┴──────┐
        │             │                   │             │
   Guest Groups    Config            Guest Groups    Config
  (Familia Pérez)  (Las Camelias)   (Fam. Rodríguez) (Los Robles)
        │                                 │
     Guests                            Guests
  (Juan, María...)                  (Roberto, Carmen...)
        │                                 │
  Confirmations                     Confirmations
```

### Principios de Aislamiento
1. **Entidad `events`**: Cada evento posee su propio `id`, `slug`, `title`, `template_id`, `status` y detalles (fechas, lugar, dress code, regalos).
2. **Relación con `guest_groups`**: Cada grupo de invitados pertenece estrictamente a un `event_id`.
3. **Aislamiento en Consultas**: La consulta por token valida que el grupo pertenezca al evento solicitado. Si se intenta acceder al token de un evento bajo la ruta de otro evento, el sistema devuelve `404 Not Found`.
4. **Dominios Personalizados Futuros**: En el futuro, el mapeo de dominios (`bianca15.com.ar` o `juanymaria.com.ar`) resolverá el `event_id` correspondiente en el edge/middleware manteniendo la misma aplicación.

---

## 🚀 Rutas de la Aplicación

| Ruta | Descripción |
|---|---|
| `/` | Portada general de la plataforma |
| `/invitacion/[slug]` | Portada pública canónica del evento (ej: `/invitacion/bianca-15`, `/invitacion/juan-y-maria`) |
| `/invitacion/[slug]/[token]` | Invitación personalizada para un grupo dentro del evento con saludo contextual y confirmación RSVP |
| `/e/[slug]` | Redirección transparente a `/invitacion/[slug]` |
| `/e/[slug]/i/[token]` | Redirección transparente a `/invitacion/[slug]/[token]` |
| `/i/[token]` | Resolución y redirección automática hacia la invitación canónica del invitado |
| `/admin` / `/admin/events` | Panel administrativo: Lista de eventos y métricas globales |
| `/admin/login` | Inicio de sesión administrativo |
| `/admin/events/new` | Creación de nuevos eventos con normalización automática de slug |
| `/admin/events/[eventId]` | Dashboard de evento: métricas, personas confirmadas y restricciones dietarias |
| `/admin/events/[eventId]/editor` | Editor visual en tiempo real de invitaciones (Hito 6 y 7) con preview interactivo |
| `/admin/events/[eventId]/guests` | Gestión de grupos e invitados, generación de links y códigos QR |
| `/admin/events/[eventId]/confirmations` | Tabla de confirmaciones detallada y exportación a CSV |
| `/admin/events/[eventId]/import` | Asistente de importación masiva por CSV con previsualización |
| `/admin/events/[eventId]/edit` | Configuración y estado del evento (`draft`, `published`, `archived`) |

---

## 🔐 Panel Administrativo y Roles

La plataforma soporta dos roles administrativos protegidos con RLS en PostgreSQL:
- **`super_admin`**: Acceso total a todos los eventos y configuración de la plataforma.
- **`event_admin`**: Acceso restringido exclusivamente a los eventos asignados mediante `event_admins`.

### Gestión y Métricas:
- Diferenciación clara entre **Grupos/Invitaciones** (ej. Familia Pérez) y **Personas asistentes** (ej. Juan, María, Pedro).
- Bloqueo de seguridad: No se permite reducir el cupo de un grupo por debajo de la cantidad de personas ya confirmadas.
- Generador de código QR para cada enlace de invitación.
- Resumen y listado de **Restricciones Alimentarias** (vegetarianos, veganos, celíacos, otras).

---

## 📥 Importación y Exportación CSV

### Formato de Importación (`.csv` UTF-8)
```csv
grupo,cupo,nombre,apellido,telefono,email
Familia Pérez,5,Juan,Pérez,1122334455,juan@email.com
Familia Pérez,5,María,Pérez,1122334455,maria@email.com
Juan García,1,Juan,García,1199887766,
```
- Las filas con el mismo nombre de `grupo` se agrupan automáticamente bajo un mismo `guest_group`.
- El importador cuenta con **previsualización en vivo**, validación de cupo, nombres obligatorios y advertencia de posibles duplicados antes de confirmar.

### Exportación CSV
- Genera un archivo `.csv` con cabecera BOM UTF-8 compatible con Microsoft Excel, incluyendo grupos, teléfonos, estados de confirmación, cantidad de asistentes reales, restricciones dietarias y comentarios.

---

## 🎨 Sistema de Plantillas y Personalización Visual

La plataforma desacopla completamente el **contenido**, la **lógica de negocio** y la **presentación visual**. Un evento puede alternar entre distintas plantillas sin alterar invitados, confirmaciones ni administración.

### Principios Fundamentales
- **Separación de Capas**: Las plantillas reciben datos ya resueltos (`event`, `guestGroup`, `existingConfirmation`) y no realizan consultas a la base de datos.
- **Componentes Funcionales Compartidos**: Componentes como `ConfirmationForm`, `CountdownTimer` y `ShareSection` contienen la lógica reutilizable, mientras la plantilla define su estilizado y layout.
- **Registro Central (`templates/registry.ts`)**: Mapea `template_id` a la definición correspondiente, ofreciendo fallback seguro (`default`) ante valores nulos o desconocidos.
- **Versionado (`template_version`)**: Permite evolucionar plantillas en código (ej. v1.0.0 → v2.0.0) manteniendo estabilidad en eventos existentes.

### Plantillas Disponibles
1. **`wonderland` (v1.0.0)**:
   - Inspirada en estética teatral y cartas de juego (♠ ♥ ♦ ♣).
   - Paleta: Negro profundo `#0a0a0f`, rojo carmín `#8b0000`, acentos en oro pulido `#c5a028`.
   - Tipografía: *Playfair Display* (títulos) + *Montserrat* (cuerpo).
   - Asignada por defecto a: **Bianca - 15 años** (`/e/bianca-15`).
2. **`elegant` (v1.0.0)**:
   - Diseño editorial, limpio y minimalista.
   - Paleta: Blanco cálido `#faf9f6`, carbón suave `#1c1c1e`, acentos en oro champán `#c9a96e`.
   - Tipografía: *Cormorant Garamond* (títulos) + *Lato* (cuerpo).
   - Asignada por defecto a: **Juan y María - Boda** (`/e/juan-y-maria`).

### Cómo agregar una nueva plantilla
1. Crear el directorio `templates/[nombre-plantilla]/` con `theme.ts`, `components/` e `index.ts`.
2. Implementar el contrato `InvitationTemplate` con `EventPage` e `InvitationPage`.
3. Registrar la plantilla en `templates/registry.ts`.
4. La plantilla quedará disponible de inmediato en los selectores del panel administrativo sin modificar el backend.

---

## 🛠️ Stack Tecnológico

| Tecnología | Uso |
|---|---|
| [Next.js 16](https://nextjs.org) | Framework React con App Router y Turbopack |
| TypeScript | Tipado estático estricto |
| Tailwind CSS v4 | Estilos y diseño responsivo |
| [Supabase](https://supabase.com) | PostgreSQL, Auth, RLS y RPCs de acceso seguro |
| [Vercel](https://vercel.com) | Plataforma de deployment |

---

## 📦 Instalación y Ejecución Local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env.local
```

Completar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` con los datos de tu proyecto Supabase.

### 3. Aplicar migraciones en Supabase
Ejecutar las migraciones en el SQL Editor de Supabase en orden:
1. `supabase/migrations/0001_initial_schema.sql`
2. `supabase/migrations/0002_rls_public_read.sql`
3. `supabase/migrations/0004_multi_event_schema.sql`
4. `supabase/migrations/0005_multi_event_seed.sql`
5. `supabase/migrations/0006_confirmation_rpc.sql`
6. `supabase/migrations/0007_admin_profiles_and_permissions.sql`
7. `supabase/migrations/0008_template_version.sql`
8. `supabase/migrations/0009_event_config.sql`

---

## 🛠️ Configurador de Invitaciones y Personalización (Hito 6)

El editor estructurado en `/admin/events/[eventId]/editor` permite personalizar integralmente cada invitación en tiempo real sin modificar código.

### Características del Configurador:
1. **Layout de 3 Zonas (Desktop)**:
   - Panel de pestañas de configuración a la izquierda.
   - Formulario de edición con debounce y feedback de cambios sin guardar.
   - Previsualizador interactivo conmutador a la derecha (Mobile 390px, Tablet 768px, Desktop 100%).
2. **Pestañas de Edición**:
   - **General**: Nombres, títulos, subtítulo, texto de bienvenida, fecha, hora, lugar, dirección, enlaces a mapas y notas de regalos.
   - **Secciones**: Control de visibilidad toggle y reordenamiento intuitivo (botones accesibles y drag & drop HTML5 nativo).
   - **Diseño**: Selección de paletas recomendadas por plantilla (Wonderland y Elegant) y personalización hex de colores (primario, secundario, fondo, tarjetas, texto, acentos) más tipografía editorial.
   - **Cronograma**: Gestor interactivo de itinerario para añadir, editar, ordenar y eliminar momentos clave de la celebración (hora, título, descripción).
   - **Imágenes**: Enlaces a recursos visuales externos y fotos de álbumes colaborativos.
3. **Flujo de Publicación**:
   - Botón **Guardar Cambios** independiente del estado de publicación.
   - Botón **Publicar / Despublicar** con diálogo de confirmación para evitar accesos públicos imprevistos.
4. **Duplicación de Eventos**:
   - Función en 1 click para clonar un evento con toda su configuración visual y secciones en estado borrador, garantizando **0 invitados y 0 confirmaciones** en el clon.

---

### 4. Iniciar servidor de desarrollo
```bash
npm run dev
```

Disponible en: `http://localhost:3000`

### 5. Verificaciones de calidad
```bash
npm run lint         # ESLint
npx tsc --noEmit     # Verificación de tipos TypeScript
npm run build        # Compilación de producción
```

---

## 🧪 Eventos y Datos de Prueba

- **Bianca - 15 años** (`/e/bianca-15`)
  - Invitación Familia Pérez: `/e/bianca-15/i/perez-test1` (5 cupos, 4 invitados)
  - Invitación Familia García: `/e/bianca-15/i/garcia-test2` (2 cupos, 2 invitados)
- **Juan y María - Boda** (`/e/juan-y-maria`)
  - Invitación Familia Rodríguez: `/e/juan-y-maria/i/rodriguez-boda` (4 cupos, 3 invitados)
  - Invitación Carlos Gómez: `/e/juan-y-maria/i/carlos-individual` (1 cupo)
- **Panel Administrativo**:
  - URL: `/admin` o `/admin/events`
  - Login: `/admin/login`
- **Prueba de Aislamiento**:
  - `/e/juan-y-maria/i/perez-test1` → Devuelve `404 Not Found` (Familia Pérez no pertenece al evento Juan y María).
