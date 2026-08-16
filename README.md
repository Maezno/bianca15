# Bianca — Invitación Web 15 años

Invitación web interactiva para los 15 años de Bianca.

---

## Stack tecnológico

| Tecnología | Uso |
|---|---|
| [Next.js 15](https://nextjs.org) | Framework React con App Router |
| TypeScript | Tipado estático |
| Tailwind CSS v4 | Estilos |
| [Supabase](https://supabase.com) | Backend, PostgreSQL y autenticación |
| [Vercel](https://vercel.com) | Deployment |

---

## Instalación y ejecución local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copiar el archivo de ejemplo y completar con los valores reales:

```bash
cp .env.example .env.local
```

Editar `.env.local` con los datos del proyecto Supabase (ver sección [Variables de entorno](#variables-de-entorno)).

### 3. Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en:

```
http://localhost:3000
```

### 4. Verificar tipos TypeScript

```bash
npm run type-check
```

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública (anon key) de Supabase |

Para obtener estos valores:
1. Crear un proyecto en [supabase.com](https://supabase.com)
2. Ir a **Project Settings → API**
3. Copiar la **Project URL** y la **anon public key**

> **Importante:** Nunca subir `.env.local` al repositorio. Solo `.env.example` está versionado.

---

## Conexión con Supabase

1. Crear el proyecto en Supabase
2. Completar las variables de entorno en `.env.local`
3. Ejecutar la migración SQL inicial:
   - Ir al **SQL Editor** del dashboard de Supabase
   - Ejecutar el contenido de `supabase/migrations/0001_initial_schema.sql`

En hitos futuros se integrará Supabase CLI para migrations automáticas.

---

## Estructura de carpetas

```
bianca15/
│
├── app/                    # Rutas (App Router de Next.js)
│   ├── layout.tsx          # Layout raíz
│   ├── page.tsx            # Página principal /
│   ├── i/[token]/          # Invitación personalizada /i/[token]
│   ├── confirmar/          # Confirmación de asistencia /confirmar
│   ├── admin/              # Panel administrativo /admin
│   └── globals.css         # Estilos globales
│
├── components/             # Componentes React
│   ├── invitation/         # Componentes de la invitación pública
│   ├── confirmation/       # Componentes del formulario de confirmación
│   └── admin/              # Componentes del panel administrativo
│
├── lib/                    # Lógica de negocio (sin UI)
│   ├── supabase/
│   │   ├── client.ts       # Cliente Supabase para Client Components
│   │   └── server.ts       # Cliente Supabase para Server Components
│   ├── guests/             # Funciones de acceso a datos de invitados
│   ├── confirmations/      # Funciones de acceso a confirmaciones
│   └── utils/              # Utilidades compartidas
│
├── types/                  # Tipos TypeScript
│   ├── database.ts         # Tipos de las tablas de Supabase
│   └── event.ts            # Tipo de configuración del evento
│
├── config/
│   └── event.ts            # Configuración del evento (fecha, lugar, etc.)
│
├── public/                 # Assets estáticos
│   ├── images/
│   ├── textures/
│   ├── cards/
│   ├── icons/
│   └── fonts/
│
├── supabase/
│   └── migrations/         # Migraciones SQL
│       └── 0001_initial_schema.sql
│
├── .env.example            # Plantilla de variables de entorno
├── .gitignore
├── next.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Estado actual del proyecto

### Hito 1 — Arquitectura inicial ✅

- [x] Proyecto Next.js 15 con TypeScript y Tailwind CSS
- [x] Estructura de carpetas organizada
- [x] Tipos TypeScript para todas las tablas de la base de datos
- [x] Configuración del evento centralizada en `config/event.ts`
- [x] Clientes de Supabase preparados (client y server)
- [x] Migración SQL inicial con las 4 tablas
- [x] RLS habilitado desde el inicio
- [x] Páginas placeholder para todas las rutas
- [x] README completo

### Próximos hitos

#### Hito 2 — Invitación pública
- Diseño visual de la invitación
- Portada, fecha, lugar, dress code, regalos
- Cuenta regresiva

#### Hito 3 — Confirmación de asistencia
- Formulario de confirmación por token
- Consulta a Supabase por token de invitación
- Guardado de confirmaciones y asistentes

#### Hito 4 — Panel administrativo
- Login seguro para administradores
- Lista de invitados con filtros
- Ver confirmaciones y estadísticas

#### Hito 5 — Features avanzados
- Importación de invitados desde Excel/CSV
- Generación de enlaces personalizados
- Envío de recordatorios por WhatsApp
- Integración con Memoroo
- Sistema de fotos

---

## Rutas disponibles

| Ruta | Descripción |
|---|---|
| `/` | Página principal de la invitación |
| `/i/[token]` | Invitación personalizada por token |
| `/confirmar` | Formulario de confirmación de asistencia |
| `/admin` | Panel administrativo (privado) |

---

## Scripts disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run start      # Servidor de producción
npm run lint       # Linter
npm run type-check # Verificación de tipos TypeScript
```

---

## Deployment

El proyecto está preparado para deployment en [Vercel](https://vercel.com).

1. Conectar el repositorio en Vercel
2. Configurar las variables de entorno en el dashboard de Vercel
3. El deployment se realiza automáticamente en cada push a `main`
