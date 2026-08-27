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
| `/e/[slug]` | Portada pública del evento (ej: `/e/bianca-15`, `/e/juan-y-maria`) |
| `/e/[slug]/i/[token]` | Invitación personalizada para un grupo dentro del evento con confirmación interactiva |
| `/i/[token]` | Resolución y redirección automática al evento correspondiente |
| `/admin` / `/admin/events` | Panel administrativo: Lista de eventos y métricas globales |
| `/admin/login` | Inicio de sesión administrativo |
| `/admin/events/new` | Creación de nuevos eventos |
| `/admin/events/[eventId]` | Dashboard de evento: métricas, personas confirmadas y restricciones dietarias |
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
