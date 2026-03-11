# FlipFlow Forms

Multi-tenant SaaS form builder with A/B testing, analytics, and third-party integrations.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start Postgres and Redis
docker-compose up -d

# Copy environment files
cp packages/api/.env.example packages/api/.env
cp packages/web/.env.example packages/web/.env

# Run database migrations and seed
pnpm --filter api exec prisma migrate dev
pnpm --filter api exec prisma db seed

# Start all packages in dev mode
pnpm dev
```

The API runs at **http://localhost:4000** and the web app at **http://localhost:3000**.

## Monorepo Structure

```
packages/
  shared/   — shared TypeScript types, constants, and utilities
  api/      — NestJS backend (REST API, Prisma ORM, session auth)
  web/      — Next.js frontend
```

## Key Features

- Multi-tenant workspaces with role-based access
- Drag-and-drop form builder with conditional logic
- A/B variant testing with traffic allocation
- Real-time analytics and submission tracking
- Webhook delivery with retry and replay
- CRM integrations (HubSpot, Salesforce)
- Custom domain support
- GDPR/CCPA compliance tooling
- Stripe billing with usage metering
- Bot protection (Turnstile, reCAPTCHA)

## API Endpoints

### Health

| Method | Path    | Description     |
| ------ | ------- | --------------- |
| GET    | /health | Liveness probe  |
| GET    | /ready  | Readiness probe |

### Auth

| Method | Path                  | Description            |
| ------ | --------------------- | ---------------------- |
| POST   | /auth/signup          | Create account         |
| POST   | /auth/login           | Log in                 |
| POST   | /auth/logout          | Log out                |
| POST   | /auth/forgot-password | Request password reset |
| POST   | /auth/reset-password  | Reset password         |
| GET    | /auth/me              | Current user           |

### Forms

| Method | Path                       | Description                |
| ------ | -------------------------- | -------------------------- |
| POST   | /forms                     | Create form                |
| GET    | /forms                     | List forms                 |
| GET    | /forms/:id                 | Get form                   |
| PUT    | /forms/:id                 | Update form                |
| DELETE | /forms/:id                 | Delete form                |
| POST   | /forms/:id/publish         | Publish form               |
| POST   | /forms/:id/unpublish       | Unpublish form             |
| GET    | /forms/:id/embed           | Get embed code             |
| GET    | /forms/:id/submissions     | List submissions           |
| GET    | /forms/public/:id          | Public form data           |
| POST   | /forms/public/:id/evaluate | Evaluate conditional logic |
| POST   | /forms/public/:id/submit   | Submit form response       |

### Templates

| Method | Path               | Description     |
| ------ | ------------------ | --------------- |
| GET    | /templates         | List templates  |
| GET    | /templates/:id     | Get template    |
| POST   | /templates         | Create template |
| POST   | /templates/:id/use | Use template    |

### Variants (A/B Testing)

| Method | Path                     | Description    |
| ------ | ------------------------ | -------------- |
| POST   | /variants                | Create variant |
| GET    | /variants                | List variants  |
| PUT    | /variants/:id            | Update variant |
| DELETE | /variants/:id            | Delete variant |
| GET    | /variants/assign/:formId | Assign variant |

### Analytics

| Method | Path                     | Description        |
| ------ | ------------------------ | ------------------ |
| POST   | /analytics/track         | Track event        |
| POST   | /analytics/track/batch   | Batch track events |
| GET    | /analytics/forms/:formId | Form analytics     |

### Webhooks

| Method | Path                             | Description     |
| ------ | -------------------------------- | --------------- |
| POST   | /webhooks                        | Create webhook  |
| GET    | /webhooks                        | List webhooks   |
| GET    | /webhooks/:id                    | Get webhook     |
| PUT    | /webhooks/:id                    | Update webhook  |
| DELETE | /webhooks/:id                    | Delete webhook  |
| GET    | /webhooks/:id/logs               | Delivery logs   |
| POST   | /webhooks/:id/logs/:logId/replay | Replay delivery |
| POST   | /webhooks/test/:id               | Test webhook    |

### Integrations

| Method | Path                   | Description        |
| ------ | ---------------------- | ------------------ |
| POST   | /integrations          | Create integration |
| GET    | /integrations          | List integrations  |
| GET    | /integrations/:id      | Get integration    |
| PUT    | /integrations/:id      | Update integration |
| DELETE | /integrations/:id      | Delete integration |
| POST   | /integrations/:id/test | Test integration   |
| GET    | /integrations/:id/logs | Integration logs   |

### Billing

| Method | Path                  | Description             |
| ------ | --------------------- | ----------------------- |
| POST   | /billing/checkout     | Create checkout session |
| GET    | /billing/subscription | Current subscription    |
| GET    | /billing/usage        | Usage stats             |
| POST   | /billing/webhook      | Stripe webhook          |
| POST   | /billing/cancel       | Cancel subscription     |

### Compliance

| Method | Path                             | Description         |
| ------ | -------------------------------- | ------------------- |
| POST   | /compliance/consent              | Record consent      |
| GET    | /compliance/forms/:formId        | Consent records     |
| GET    | /compliance/forms/:formId/export | Export consent data |

### Domains

| Method | Path                     | Description           |
| ------ | ------------------------ | --------------------- |
| POST   | /domains/request         | Request custom domain |
| GET    | /domains/status          | Domain status         |
| POST   | /domains/verify          | Verify DNS            |
| DELETE | /domains                 | Remove domain         |
| GET    | /domains/resolve/:domain | Resolve domain        |

### Validation

| Method | Path                 | Description      |
| ------ | -------------------- | ---------------- |
| POST   | /validation/validate | Validate field   |
| GET    | /validation/usage    | Validation usage |

## Environment Variables

See `packages/api/.env.example` and `packages/web/.env.example` for the full list.

| Variable          | Required | Description                         |
| ----------------- | -------- | ----------------------------------- |
| DATABASE_URL      | Yes      | PostgreSQL connection string        |
| SESSION_SECRET    | Yes      | Secret for signing session cookies  |
| PORT              | No       | API port (default: 4000)            |
| NODE_ENV          | No       | Environment (default: development)  |
| CORS_ORIGIN       | No       | Allowed origin (default: localhost) |
| SENDGRID_API_KEY  | No       | SendGrid key for transactional mail |
| STRIPE_SECRET_KEY | No       | Stripe secret key for billing       |

## Development Commands

```bash
pnpm dev         # Start all packages in watch mode
pnpm build       # Production build
pnpm lint        # Lint all packages
pnpm typecheck   # TypeScript type checking
pnpm clean       # Remove build artifacts
```
