# Book Duel API

Backend API for **Book Duel**, a literary tournament game for the SorSU Bulan Campus library.
CS 313 Software Engineering 1, A.Y. 2026-2027.

- Developer: Marabel Ginga Germedia (andrewford2), BSCS 3-1
- Group and game concept: Team C3 (3-1)

This is my own build of my group's game concept. Every commit in this repository was made by me, with Git, on my own computer or in my own Codespace.

## Tech stack

| Layer | Tool |
|---|---|
| Runtime | Node.js 22 LTS or newer |
| Web framework | Express 5 |
| Database | PostgreSQL 16 or newer |
| ORM and migrations | Sequelize 6 with sequelize-cli |

## Setup

```
git clone https://github.com/andrewford2/Book-Duel-api.git
cd Book-Duel-api
npm install
```

Copy `.env.example` to `.env`, then put your own PostgreSQL password in `DB_PASSWORD` and a strong JWT secret.

```
npm run db:create     (first time only)
npm run db:migrate
npm run db:seed
npm run db:check
npm run dev
```

## Environment variables

| Key | Example | Purpose |
|---|---|---|
| NODE_ENV | development | Which config block to use |
| PORT | 3001 | Port the API listens on (the library assigns the final port at deployment) |
| DB_HOST | 127.0.0.1 | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_NAME | book_duel | Database name: your game slug, with underscores |
| DB_USER | postgres | Database user |
| DB_PASSWORD | (your own) | Database password. Never commit this. |
| HUB_API_KEY | dev-hub-key | Key the Library Game Hub sends to read results. The library gives the real one at deployment. |
| JWT_SECRET | (your own) | Secret for signing JWT tokens. Min 32 chars. |

## Endpoints (Hub Contract v1.2)

Base URL: `http://localhost:3001/api/v1`

| Method | Path | Purpose | Success |
|---|---|---|---|
| GET | /health | Is the API up and can it reach the database? | 200 (503 when the database is down) |
| GET | /game-info | Slug, name, group, developer, description, player limits, version | 200 |
| POST | /auth/login | Host logs in, gets JWT | 200 |
| POST | /question-sets | Create a question set (Host) | 201 |
| GET | /question-sets | List host's question sets | 200 |
| GET | /question-sets/{id} | Read one set (includes correct choices) | 200 |
| PATCH | /question-sets/{id} | Edit a set | 200 |
| DELETE | /question-sets/{id} | Delete a set | 200 |
| POST | /sessions | Create a session and get join code (Host) | 201 |
| GET | /sessions/{code} | Host reviews session results | 200 |
| PATCH | /sessions/{code} | Host ends session | 200 |
| POST | /sessions/{code}/players | Player joins with nickname | 201 |
| POST | /sessions/{code}/rounds | Host starts next round | 201 |
| GET | /sessions/{code}/rounds/current | Current question or latest result | 200 |
| POST | /sessions/{code}/answers | Submit an answer | 201 |
| GET | /sessions/{code}/leaderboard | HP and score ranking | 200 |

## What "completed" means in my game

A player completed the game when they answered all questions in the tournament (the session ended), regardless of whether they were eliminated or won.

## Tables

1. users
2. hosts
3. question_sets
4. questions
5. choices
6. sessions
7. session_players
8. rounds
9. answers

## Database scripts

| Command | What it does |
|---|---|
| npm run db:migrate | Runs migrations that have not run yet |
| npm run db:migrate:status | Lists every migration as up or down |
| npm run db:seed | Loads the seed data |
| npm run db:check | Counts the rows in every table |
| npm run db:reset | Empties the database, rebuilds every table and reloads the seed data |
| npm run check | Runs the same automatic check that GitHub runs after every push |