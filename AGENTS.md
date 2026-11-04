# AGENTS.md — Guía del repositorio POS

Este documento es la **fuente de verdad** para cualquier agente de IA (o persona) que
trabaje en este repo. Léelo completo antes de tocar código y sigue las reglas sin excepciones.

---

## 1. Qué es este proyecto

POS (punto de venta) **genérico**: sirve para cualquier tipo de venta (retail, comida,
servicios…). Monorepo Nx con:

- `apps/pos-web` — SPA Angular 22 (standalone, zoneless, Vitest).
- `apps/pos-api` — API NestJS 11 (Prisma + SQLite en dev).
- `libs/` — bibliotecas compartidas: `core`, `data_access`, `ui_atoms`, `ui_molecules`,
  `ui_organisms`, `shell`; `features/` se agrega por fase.

## 2. Comandos (usa siempre Nx, nunca la tooling directa)

```bash
npm run dev:web              # serve pos-web (puerto 4200)
npm run dev:api              # serve pos-api (puerto 3000, prefijo /api)
npm run build                # build de pos-web y pos-api
npm run lint                 # lint de ambos
npm test                     # tests de ambos
npm run format               # formatea con Prettier
npm run format:check         # verifica formato (CI lo corre siempre)

npx nx run pos-web:serve     # equivalente por proyecto
npx nx run pos-api:serve
npx nx run-many -t lint -p pos-web pos-api
npx nx affected -t lint test build   # solo lo que cambió respecto a main
npx nx graph                 # grafo de dependencias
npx nx show projects         # lista de proyectos
```

**Regla de oro:** todo target (build/lint/test/serve) se ejecuta vía `nx`. No invokes
`ng build`, `webpack`, `eslint .` ni `jest` a mano fuera de Nx.

Antes de cada commit ejecuta y deja en verde:

```bash
npx nx format:check && npx nx run-many -t lint test build -p pos-web pos-api
```

## 3. Convenciones de naming (OBLIGATORIAS)

| Elemento              | Estilo                                                                                                                                                                         | Ejemplo                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| Archivos fuente       | `snake_case`                                                                                                                                                                   | `sales_store.ts`, `pos_terminal.ts`    |
| Archivos de test      | `snake_case`                                                                                                                                                                   | `sales_store_spec.ts` (sufijo `_spec`) |
| Carpetas (src)        | `snake_case`                                                                                                                                                                   | `features/sales/`, `ui_atoms/`         |
| Variables / funciones | `camelCase`                                                                                                                                                                    | `subtotalAmount`, `buildTicket()`      |
| Clases / componentes  | `PascalCase`                                                                                                                                                                   | `PosTerminalComponent`, `SalesStore`   |
| Constantes globales   | `SCREAMING`                                                                                                                                                                    | `MAX_CART_ITEMS`                       |
| Selectores Angular    | `pos-` kebab                                                                                                                                                                   | `<pos-product-card>`                   |
| Rutas (URL)           | kebab-case                                                                                                                                                                     | `/ventas/terminal`, `/productos`       |
| Archivos de config    | nombre estándar de la herramienta (`nx.json`, `tsconfig.json`, `eslint.config.mjs`, `jest.config.cts`, `webpack.config.js`, `.postcssrc.json`) — **no** renombrar a snake_case |

Los tests **siempre** llevan sufijo `_spec.ts` (frontend y backend). La detección ya está
configurada en `project.json` (Vitest) y `jest.config.cts` (Jest): si renombras o creas
tests con otro patrón, no se ejecutarán.

## 4. Reglas de diseño de código

1. **Una función = una responsabilidad.** Si una función hace dos cosas, sepárala.
   Lo mismo para stores, servicios y métodos de repositorio.
2. **Sin lógica en templates.** El template solo declara; la lógica vive en la clase/store
   en `camelCase`, expuesta como `readonly` signals o métodos pequeños.
3. **Componentes presentacionales puros** en atoms/molecules: entran `@Input`/signals de
   entrada, salen `output()` events. No hablan con stores ni con `HttpClient`.
4. **Containers (organisms/pages)** orquestan: leen stores, disparan acciones, pasan datos
   a componentes presentacionales.
5. **Tipado estricto** (`strict: true`): nada de `any`. Usa tipos de dominio (`Money`,
   `Product`, `SaleLine`) compartidos entre capas.
6. **Dinero en enteros** (centavos/minor units). Nunca `number` con decimales para montos.
   Formato solo en la capa de presentación.
7. **Sin efectos ocultos**: fechas, ids y random se inyectan (p. ej. `DateService`) para que
   los tests sean deterministas.

## 5. Arquitectura del frontend

### 5.1 Atomic design (libs, por fase 01)

```
libs/
├── ui_atoms/        # botón, chip, badge, input, spinner… (sin lógica)
├── ui_molecules/    # combinaciones de átomos (campo+label, ítem de línea)
├── ui_organisms/    # bloques con lógica mínima (cabecera, tarjeta producto)
├── shell/           # layout, navbar, sidenav, page wrapper
├── data_access/     # clientes HTTP, DTOs, interceptores, adaptadores
└── features/
    ├── auth/
    ├── products/
    ├── inventory/
    ├── sales/
    ├── customers/
    ├── reports/
    └── settings/
```

Cada lib es un **proyecto Nx** con tags de lint (`type:feature`, `type:ui`,
`scope:sales`, …). Los tags se respetan en `@nx/enforce-module-boundaries`.

### 5.2 Estado — NgRx SignalStore (patrón Redux)

- **Un store por feature**, en `features/<feature>/src/lib/<feature>_store.ts`.
- El store expone: `state` (signals readonly), `selectores` (computed) y `métodos` que
  disparan efectos (`patchState` dentro de `rxMethod`/`async` a mano).
- **El store NUNCA importa `HttpClient`.** Toda I/O pasa por un adaptador inyectable:

```ts
// data_access: interfaz estable
export abstract class ProductsApi {
  abstract list(query: ProductQuery): Promise<Product[]>;
}

// implementación real (HttpClient) o mock — se provee por DI
export class HttpProductsApi extends ProductsApi {
  /* ... */
}
```

Esto permite cambiar mock ↔ API sin tocar stores ni componentes.

- Patrón típico de flujo (Redux estricto): **evento → acción del store → efecto (adaptador)
  → patchState → selectores → vistas reactivas**.

### 5.3 Routing

- Rutas lazy por feature: `loadChildren: () => import('@pos/features/sales')…`.
- Guards en `data_access` o en la feature de auth.
- `app_routes.ts` solo declara el árbol; cada feature exporta sus propias rutas.

## 6. Arquitectura del backend (NestJS)

```
apps/pos-api/src/
├── main.ts                 # bootstrap (prefijo global /api, puerto 3000)
├── app/                    # App root module
└── modules/                # un módulo por vertical
    ├── auth/
    ├── users/
    ├── products/
    ├── inventory/
    ├── sales/
    ├── customers/
    └── settings/
```

Cada módulo sigue el patrón estándar: `*_controller.ts` (HTTP), `*_service.ts` (reglas de
negocio), `*_module.ts`, `dto/` con class-validator, y Prisma en `prisma/` (schema compartido
en `apps/pos-api/prisma/schema.prisma`).

- **Validación global** con `ValidationPipe` y DTOs estrictos.
- **Errores**: usar excepciones de Nest (`NotFoundException`, `BadRequestException`) con
  mensajes en español; nunca devolver stack traces.
- **Auth (fase 02)**: JWT + `AuthGuard` global por ruta con `@Public()` para login/health.

## 7. Git — manejo responsable del repo

- Ramas por fase: `fase/00-setup`, `fase/01-arquitectura`, `fase/02-auth`, …
  Se crean desde `main` y se integran con `--ff-only` cuando la fase está en verde.
- Commits **Conventional Commits en español**, enfocados y atómicos:

  ```
  feat(sales): agregar carrito con líneas y descuentos
  fix(auth): redirigir a login al expirar el token
  chore(api): migrar esquema Prisma de productos
  docs: actualizar roadmap de fases
  ```

- **Prohibido**: trailers `Co-authored-by`, mensajes que mencionen asistentes de IA,
  commits gigantes que mezclen 5 cosas.
- Antes de commit: `format:check` + `lint` + `test` + `build` en verde.
- No hacer `push` a `main` sin pasar CI. No reescribir historia ya publicada.

## 8. Roadmap de fases (estado actual: fase 03 ✅)

| Fase | Rama                    | Contenido                                            | Estado |
| ---- | ----------------------- | ---------------------------------------------------- | ------ |
| 00   | `fase/00-setup`         | Monorepo, tooling, Material/Tailwind, docs, CI       | ✅     |
| 01   | `fase/01-arquitectura`  | Libs atómicas, shell/layout, rutas lazy, stores base | ✅     |
| 02   | `fase/02-auth`          | JWT en API + guard/sesión en web                     | ✅     |
| 03   | `fase/03-productos`     | CRUD de catálogo (API + UI + store)                  | ✅     |
| 04   | `fase/04-inventario`    | Movimientos de stock y existencias                   | ⏳     |
| 05   | `fase/05-ventas`        | Terminal POS: carrito, cobro, ticket                 | ⏳     |
| 06   | `fase/06-clientes`      | Fichas de clientes y ventas vinculadas               | ⏳     |
| 07   | `fase/07-reportes`      | Dashboard, ventas por día/producto                   | ⏳     |
| 08   | `fase/08-configuracion` | Ajustes generales, usuarios, roles                   | ⏳     |

Al empezar una fase: crear la rama, leer esta sección + la arquitectura relacionada,
implementar el vertical completo (API + web + tests), dejar todo en verde, commitear por
pasos lógicos e integrar a `main`.

## 9. Decisiones ya tomadas (no revertir sin motivación fuerte)

- **Nx 24** como orquestador; el plugin `@nx/js/typescript` está **deshabilitado** a
  propósito: su sincronizador de project references choca con Angular
  (github.com/angular/angular/issues/37276). El `tsconfig.base.json` es compatible con
  Angular y Nest; cada app refina lo suyo en su `tsconfig.json`.
- **Zoneless** por defecto (Angular 21+). Las animaciones de Material se proveen con
  `provideAnimationsAsync()` en `app_config.ts`.
- **Tailwind v4**: configuración por CSS (`@use 'tailwindcss';` en `styles.scss`) +
  `.postcssrc.json` en la raíz. **No** crear `tailwind.config.js` ni usar directivas
  `@tailwind base/components/utilities` (v3) — rompe el build.
- **Material 3** con tema `azure-blue` vía `mat.theme()` en `styles.scss`.
- **Prisma + SQLite** en dev (`apps/pos-api/prisma/`); para producción se cambia el
  datasource a PostgreSQL sin tocar el resto.
- **Sin Nx Cloud**: el CI de `.github/workflows/ci.yml` corre en GitHub Actions plano
  (format → lint → test → build) con Node 26.

## 10. Cómo agregar una feature vertical (plantilla)

1. **API**: `npx nx g @nestjs/schematics:module <feature> --project=pos-api` o crear a mano
   `apps/pos-api/src/modules/<feature>/` con controller/service/module + DTOs + esquema
   Prisma si aplica (`npx prisma migrate dev` dentro de `apps/pos-api`).
2. **Lib frontend**: `npx nx g @nx/angular:lib <feature> --directory=libs/features/<feature>`
   (renombrar archivos generados a `snake_case`).
3. **Data access**: interfaz `abstract class <Feature>Api` + implementación HTTP en
   `libs/data_access`.
4. **Store**: `feature_store.ts` con `signalStore`, estado tipado, selectores y métodos.
5. **UI**: páginas en `features/<feature>/…/pages/`, componentes en `organisms/` /
   `molecules/`, todo con `_spec.ts` mínimo por componente relevante.
6. **Rutas**: lazy route en `app_routes.ts` + tags Nx en `project.json`.
7. **Verificar**: `npx nx format:check && npx nx run-many -t lint test build -p pos-web pos-api`.

## 11. Estructura de un commit de fase

```
fase/05-ventas
  ├── feat(ventas): modelo de carrito y store del terminal
  ├── feat(api): endpoint de ventas y tickets
  ├── feat(ventas): pantalla de checkout con cobro
  ├── test(ventas): cobertura del store y del controller
  └── docs: marcar fase 05 como completa
```

Un commit = una idea verificable. Si `main` avanza con otras fases, re-basar o mergear
siempre dejando CI en verde.

---

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g. `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
