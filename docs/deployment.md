# Deployment & Configuration: VetClinic Pro

Guidelines for setting up, configuring, and deploying VetClinic Pro to production environments.

## 🔑 Environment Variables

The application requires specific environment variables for both the Backend and Frontend.

### Backend (apps/api/.env)
| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL Connection String | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret for signing tokens | `long-random-string` |
| `JWT_EXPIRES_IN` | Token lifespan | `7d` |
| `PORT` | API Server Port | `4000` |
| `CLOUDINARY_URL` | Media storage credentials | `cloudinary://key:secret@name` |
| `RESEND_API_KEY` | Email service API key | `re_123456789` |
| `CORS_ORIGINS` | Authorized frontend origins (comma-separated) | `https://your-app.vercel.app` |

### Frontend (apps/web/.env.local)
| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API Base URL | `https://api.vetclinic.pro/api` |
| `NEXT_PUBLIC_WS_URL` | WebSocket Server URL | `wss://api.vetclinic.pro` |

---

## 🚀 Deployment Steps

### 1. Database Setup
Ensure a PostgreSQL instance is running.
```bash
pnpm db:push
pnpm db:seed
```

### 2. Infrastructure Recommendations
- **Backend (API)**: Render (Web Service).
- **Frontend (Web)**: Vercel.
- **Database**: Neon PostgreSQL.
- **Storage**: Cloudinary (Free tier available).

### 3. Render Deployment (Backend)
1. Create a Render Web Service pointing to this repository.
2. Set Root Directory to `apps/api`.
3. Build Command: `cd ../.. && pnpm build`.
4. Start Command: `pnpm --filter @vetclinic/api start`.
5. Configure required variables: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGINS`, `NODE_ENV=production`.

### 4. Vercel Deployment (Frontend)
1. Import the repository.
2. Set the **Root Directory** to `apps/web`.
3. Override the **Build Command**: `cd ../.. && pnpm build`.
4. Add the `NEXT_PUBLIC_API_URL` environment variable pointing to Render API (`https://<render-service>/api`).

### 5. Neon (Database)
1. Provision a Neon PostgreSQL project.
2. Use the pooled `DATABASE_URL` in Render.
3. Apply schema changes with `pnpm db:push` from CI/CD or controlled release jobs.

---

## 🛠️ Operational Commands

### Development
```bash
pnpm dev             # Start all apps in parallel
```

### Database Management
```bash
pnpm db:studio       # Open GUI to view data
pnpm db:push         # Apply schema changes (destructive)
pnpm db:migrate      # Create a versioned migration
```

### Maintenance
- **Backup**: Use the provided `backup-db.ps1` script (Windows) to create SQL dumps.
- **Seeding**: Run `pnpm db:seed` to reset test data (use with caution in prod).
