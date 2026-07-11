# Arunreah Dental Clinic — Frontend

React 19 + TypeScript (Vite) SPA for the Arunreah Dental Clinic management system. Bootstrap 5,
React Router, React Hook Form, SweetAlert2, and Chart.js. Bilingual (English/Khmer).

## Requirements

- Node.js 20+
- The backend API running locally (see `../backend/README.md`)

## Setup

```bash
npm install
cp .env.example .env
```

`VITE_API_BASE_URL` in `.env` must point at the backend API (default: `http://127.0.0.1:8100/api`,
matching the backend README's `php artisan serve --port=8100`).

## Development

```bash
npm run dev
```

Log in with any of the seeded demo accounts (see `../backend/README.md`) — password `password`
for all of them.

## Production build

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally to sanity-check it
```

Routes are code-split with `React.lazy()` so the initial bundle only loads the login/dashboard
shell; each feature page (doctors, patients, appointments, reports, etc.) loads on navigation.

## Type checking & linting

```bash
npx tsc -b     # typecheck
npm run lint   # oxlint
```

## Project structure

- `src/api/` — one file per backend resource, thin axios wrappers
- `src/components/ui/` — the shared design-system primitives (Modal, Avatar, StatusBadge,
  Pagination, SearchInput, PageHeader, EmptyState) — reuse these before building something new
- `src/components/charts/` — Chart.js wrappers used on the Admin dashboard
- `src/components/pickers/` — cross-module selection widgets (PatientPicker, DoctorSelect,
  MedicineSelect)
- `src/context/` — `AuthContext` (Sanctum token session) and `LanguageContext` (EN/KM)
- `src/i18n/dictionary.ts` — all UI strings, English and Khmer side by side
- `src/pages/<module>/` — one folder per feature area, each typically holding a `*List.tsx` and
  a `*FormModal.tsx`
- `src/theme.css` — the brand palette (teal `#0d9488`) and shared component styling on top of
  Bootstrap
