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
| DB | SQLite (default) |
| UI | Material Design 3, CSS custom properties |

## Struttura progetto

```
backend/          → Laravel 12 API
frontend/         → Angular 21 app
```

## Requisiti

- PHP 8.2+ (estensioni: pdo_sqlite, mbstring, xml, tokenizer, openssl)
- Node.js 18+
- Composer 2

## Setup Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

## Setup Frontend

```bash
cd frontend
npm install
ng serve
```

## Accedere

Dopo aver avviato backend e frontend, apri http://localhost:4200:

- Email: `test@example.com`
- Password: `password`

Oppure registrati con un nuovo account dalla pagina di login.

## API

- Backend: `http://localhost:8000/api`
- Frontend: `http://localhost:4200`
- CORS configurato per `http://localhost:4200`

### Endpoint principali

| Metodo | Rotta | Descrizione |
|--------|-------|-------------|
| POST | `/api/register` | Registrazione |
| POST | `/api/login` | Login |
| POST | `/api/logout` | Logout |
| GET | `/api/user` | Utente autenticato |
| GET/POST | `/api/tasks` | Lista/crea task |
| GET/PUT/DELETE | `/api/tasks/{id}` | Mostra/aggiorna/elimina task |
| PATCH | `/api/tasks/{id}/toggle-complete` | Toggle completamento |
| GET/POST | `/api/categories` | Lista/crea categorie |
| GET/PUT/DELETE | `/api/categories/{id}` | Mostra/aggiorna/elimina categoria |

## Database

- `users` → `categories` → `tasks` (1:N)
- `tasks.parent_task_id` → self-reference per sotto-attività
- `tasks` usa `SoftDeletes`

## Limitazioni attuali

- **Reset password**: il link di reset appare nei log Laravel, non viene inviato via email
- **Drag-drop e sotto-attività**: struttura backend presente, frontend da implementare