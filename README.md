# POS — Sistema de punto de venta genérico

POS configurable para **cualquier tipo de venta** (retail, servicios, comida, ferreterías, etc.).
Monorepo Nx con frontend Angular y API NestJS, pensado para crecer por fases sin reescribir nada.

## Stack

| Capa        | Tecnología                                        |
| ----------- | ------------------------------------------------- |
| Frontend    | Angular 22 (standalone, zoneless)                 |
| Estado      | NgRx SignalStore (patrón Redux con signals)       |
| UI          | Angular Material 22 (Material 3) + Tailwind CSS 4 |
| Backend     | NestJS 11                                         |
| Base datos  | Prisma + SQLite (dev) — ruta clara a PostgreSQL   |
| Monorepo    | Nx 24                                             |
| Lint/format | ESLint 9 (flat config) + Prettier                 |
| Tests       | Vitest (frontend) + Jest (backend)                |
| Lenguaje    | TypeScript 6 estricto                             |

## Requisitos

- Node.js `>= 26` (o `^22.22.3` / `^24.15.0`)
- npm `>= 11`

## Puesta en marcha

```bash
npm install

npm run dev:web   # frontend → http://localhost:4200
npm run dev:api   # API      → http://localhost:3000/api
```

En una segunda terminal puedes correr ambas apps con:

```bash
npx nx run-many -t serve -p pos-web pos-api
```

## Comandos

| Comando                   | Descripción                           |
| ------------------------- | ------------------------------------- |
| `npm run dev:web`         | Sirve el frontend con recarga en vivo |
| `npm run dev:api`         | Sirve la API en desarrollo            |
| `npm run build`           | Construye frontend y backend          |
| `npm run lint`            | Lint de ambos proyectos               |
| `npm test`                | Tests de ambos proyectos              |
| `npm run format`          | Formatea el repo con Prettier         |
| `npm run format:check`    | Verifica formato (usado en CI)        |
| `npx nx graph`            | Grafo de dependencias del monorepo    |
| `npx nx affected -t lint` | Ejecuta targets solo en lo modificado |

## Estructura

```
POS/
├── apps/
│   ├── pos-web/          # Angular (SPA del punto de venta)
│   └── pos-api/          # NestJS (API REST)
├── libs/                 # Bibliotecas compartidas (atomic design, data-access, features)
├── .github/workflows/    # CI (lint + test + build)
├── AGENTS.md             # Guía para agentes de IA que trabajen en el repo
└── nx.json               # Configuración de targets/cache de Nx
```

## Arquitectura

- **Atomic design** en el frontend: `atoms → molecules → organisms → templates → pages`.
- **Funciones con una sola responsabilidad**: cada función/ servicio hace exactamente una cosa.
- **Estado con NgRx SignalStore**: un store por feature (carrito, inventario, sesión…), con
  efectos asíncronicos y selectores tipados. El store nunca llama a `HttpClient` directamente:
  lo hace a través de adaptadores de datos intercambiables (mock ↔ API real).
- **Dinero en enteros**: todos los montos se guardan en la unidad mínima (centavos) y solo se
  formatean al mostrarlos. Nunca se usan decimales flotantes para dinero.
- **API first por verticales**: cada módulo del backend (auth, productos, ventas…) nace junto a
  su feature en el frontend en la misma fase.

## Convenciones de código

| Qué                       | Regla                                              |
| ------------------------- | -------------------------------------------------- |
| Archivos fuente           | `snake_case` → `sales_store.ts`, `pos_terminal.ts` |
| Variables / funciones     | `camelCase` → `subtotalAmount`, `applyDiscount()`  |
| Clases / componentes      | `PascalCase` → `PosTerminalComponent`              |
| Selectores de componente  | prefijo `pos-` en kebab-case                       |
| Archivos de configuración | nombre estándar de la herramienta (`nx.json`, …)   |
| Commits                   | Conventional Commits en español                    |

## Roadmap por fases

| Fase | Contenido                                      | Estado |
| ---- | ---------------------------------------------- | ------ |
| 00   | Monorepo Nx, tooling, Material/Tailwind, docs  | ✅     |
| 01   | Arquitectura core: shell, atomic design, rutas | ✅     |
| 02   | Autenticación (JWT)                            | ✅     |
| 03   | Catálogo de productos                          | ✅     |
| 04   | Inventario (movimientos de stock)              | ✅     |
| 05   | Ventas POS (carrito, checkout, tickets)        | ✅     |
| 06   | Clientes                                       | ✅     |
| 07   | Reportes y dashboard                           | ⏳     |
| 08   | Configuración y usuarios                       | ⏳     |

Cada fase vive en su propia rama (`fase/XX-<nombre>`) y se integra a `main` con commits
verificados (lint + test + build).

## Licencia

MIT
