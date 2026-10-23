# Hamshira API

Single-file Express API using PostgreSQL. Start with `npm install`, configure `.env` from `.env.example`, install/start PostgreSQL, then run `npm start`.

The server listens on port 4000 and automatically creates its tables and inserts the app catalog at startup when PostgreSQL is reachable. Health check: `GET /api/health`.

Swagger UI is available at `http://localhost:4000/api-docs` and raw spec at `http://localhost:4000/api-docs.json`.

Public routes: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/services`, `GET /api/doctors`.

Send `Authorization: Bearer <token>` for `GET/PATCH /api/me`, `GET/POST/PATCH/DELETE /api/addresses`, and `GET/POST /api/orders`, `GET /api/orders/:id`, `PATCH /api/orders/:id/cancel`.

For a phone using Expo Go, set `DATABASE_URL` to your PostgreSQL connection string and point the mobile app API URL at the computer's LAN address, for example `http://192.168.1.10:4000`.
