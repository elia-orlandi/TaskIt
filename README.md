# TaskIt - Task Manager

[![Laravel](https://img.shields.io/badge/Laravel%2012-%23FF2D20.svg?logo=laravel&logoColor=white)](https://laravel.com)
[![Angular](https://img.shields.io/badge/Angular%2021-%23DD0031.svg?logo=angular&logoColor=white)](https://angular.io)

Gestore task full-stack con Laravel 12 API + Angular 21. Autenticazione, CRUD completo, categorie, filtri e ricerca real-time.

## Funzionalità

- **Attività**: crea, modifica, elimina, completa/des completa task
- **Categorie**: raggruppa task per colore
- **Sotto-attività**: TBD (backend pronto, frontend TBD)
- **Archiviazione**: soft delete con ripristino
- **Filtri**: cerca per nome, stato, priorità, categoria, data scadenza
- **Ordinamento drag-drop**: TBD (backend pronto, frontend TBD)
- **Autenticazione**: token Sanctum, ripristino sessione

## Stack

| Layer | Tech |
|-------|------|
| Backend | Laravel 12 + Sanctum |
| Frontend | Angular 21 (signals) |
| DB | MySQL/SQLite |
| UI | Material Design 3, CSS custom properties |

## API Endpoints

```
POST   /api/register, /api/login, /api/logout
GET    /api/user
GET    /api/tasks, /api/categories
POST   /api/tasks, /api/categories
PUT    /api/tasks/{id}, /api/categories/{id}
DELETE /api/tasks/{id}, /api/categories/{id}
PATCH  /api/tasks/{id}/toggle-complete
```

## Struttura progetto

```
backend/          → Laravel 12 API
frontend/         → Angular 21 app
```

## Setup rapido

```bash
# Backend
cd backend
cp .env.example .env
php artisan migrate
php artisan serve

# Frontend
cd frontend
npm install
ng serve
```

## Database

- `users` → `categories` → `tasks` (1:N)
- `tasks.parent_task_id` → self-reference per sotto-attività
- `tasks` usa `SoftDeletes`