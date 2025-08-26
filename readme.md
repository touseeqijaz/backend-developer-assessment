## Sales Commission API

Node.js + Express + Prisma (SQLite) service to manage users, record sales (single and bulk), and calculate monthly commissions with tiering, regional multipliers, streak bonuses, and penalties.

### Tech stack
- **Runtime**: Node.js (ES Modules)
- **HTTP**: Express
- **ORM**: Prisma
- **DB**: SQLite (file-based)

---

## Getting started

### 1) Prerequisites
- Node.js 18+

### 2) Install dependencies
```bash
npm install
```

### 3) Configure environment
Create a `.env` at the project root (see `.env-example`):
```env
DATABASE_URL="file:./dev.db"
PORT=3001
NODE_ENV=development
```

### 4) Database: generate + migrate
```bash
# Generate Prisma client
npm run generate

# Create/update local SQLite schema
npm run migrate
```

### 5) Seed sample data (optional)
```bash
node prisma/seed.js
```
This creates example `User` and `Target` rows to try the API quickly.

### 6) Run the API server
```bash
npm run dev
```
Server starts on `http://localhost:${PORT}` (defaults to 3000 if `PORT` unset).

---

## Project structure
```
src/
  app.js                # Express app setup
  server.js             # Server bootstrap
  routes/               # API route mounts
  controllers/          # Request handlers
  services/             # Domain logic (commission calc)
  config/database.js    # Prisma client
prisma/
  schema.prisma         # DB schema (SQLite)
  seed.js               # Seed script
```

---

## Data model (Prisma)
- `User` (id, name, email, region, hire_date, createdAt)
- `Sale` (id, amount, userId, createdAt)
- `Target` (id, userId, month, year, target_amount)
- `RegionAssignment` (id, userId, region, start_date, end_date?)

See `prisma/schema.prisma` for details.

---

## API
Base path: `http://localhost:PORT/api`

### Users
- POST `/users` — create a user
  - body:
    ```json
    { "name": "Alice", "email": "alice@company.com", "region": "north", "hire_date": "2024-01-15" }
    ```
  - response: `200 OK` with created user or `400` on validation/unique errors

- GET `/users` — list users
  - query params: `region?=north|south|east|west`, `status?` (currently unused in schema)
  - response: `200 OK` array with nested `sales` and `targets`

- PUT `/users/:id/region` — transfer a user to a different region
  - body: `{ "region": "west" }`
  - response: `200 OK` updated user or `400` on error

### Sales
- POST `/sales` — record a single sale
  - body:
    ```json
    { "userId": 1, "amount": 1200.5 }
    ```
  - response: `200 OK` created sale or `400` on error

- POST `/sales/bulk` — insert multiple sales
  - body:
    ```json
    { "sales": [ { "userId": 1, "amount": 5000 }, { "userId": 2, "amount": 1500.25 } ] }
    ```
  - response: `200 OK` with `{ count }` inserted or `400` on error

### Commission
- GET `/commission/:userId/:month/:year` — calculate monthly commission
  - example: `/commission/1/12/2024`
  - response: `200 OK` with shape:
    ```json
    {
      "userId": 1,
      "month": 12,
      "year": 2024,
      "totalSales": 23000,
      "targetAmount": 20000,
      "commissionRate": 0.09,
      "multiplier": 1.1,
      "commission": 2277
    }
    ```

Commission rules implemented in `src/services/saleService.js`:
- Base rate 5%
- Tier bonus: +2% over 10k, +4% over 25k
- Regional multipliers: north 1.1, south 0.95, east 1.0, west 1.05
- Streak bonus: +1% per prior consecutive target hit (max 5%)
- Penalty: -2% if previous month < 50% of target

---

## Curl examples
```bash
# Create user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@company.com","region":"north","hire_date":"2024-01-15"}'

# Record sale
curl -X POST http://localhost:3001/api/sales \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"amount":1200.5}'

# Bulk sales
curl -X POST http://localhost:3001/api/sales/bulk \
  -H "Content-Type: application/json" \
  -d '{"sales":[{"userId":1,"amount":5000},{"userId":2,"amount":2500}]}'

# Commission
curl http://localhost:3001/api/commission/1/12/2024
```

---

## Development notes
- Express app is mounted in `src/app.js`; routes under `/api` in `src/routes/index.js`.
- Prisma client is created in `src/config/database.js`.
- Commission logic lives in `src/services/saleService.js`.
- Seed data targets December 2024; adjust or add targets as needed for other months.

---

## Scripts
- `npm run dev` — start server with nodemon
- `npm run generate` — generate Prisma client
- `npm run migrate` — run `prisma migrate dev --name init`

---

## Testing
Project includes example tests under `tests/` (using `supertest`). If you add a test runner, configure it to transpile ES Modules or run with Node's ESM support.


