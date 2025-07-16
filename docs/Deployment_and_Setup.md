# Deployment & Setup

## Prerequisites
- **Node.js** (v18 or higher): [Download](https://nodejs.org/)
- **Git:** [Download](https://git-scm.com/)
- **(Optional) PostgreSQL:** For production database

---

## Local Development Setup

### 1. Clone the Repository
```bash
git clone [your-repository-url]
cd [project-folder-name]
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```
- Starts both the Express backend and Vite frontend (with proxy).
- Default port: `5000` (configurable via `PORT` env variable).

### 4. Open in Browser
- Go to: [http://localhost:5000](http://localhost:5000)

---

## Production Deployment

### 1. Build the Application
```bash
npm run build
```
- Builds frontend (Vite) and bundles backend (ESBuild).

### 2. Start the Production Server
```bash
npm run start
```
- Serves static frontend and API from Express on the configured port.

### 3. Environment Variables
- `PORT`: Port to run the server (default: 5000)
- `DATABASE_URL`: PostgreSQL connection string (for production DB)

### 4. Database Setup (Optional)
- Configure PostgreSQL and set `DATABASE_URL`.
- Run migrations:
  ```bash
  npm run db:push
  ```

---

## Project Structure
```
├── client/          # Frontend React application
│   ├── src/
│   │   ├── components/  # UI components (board, controls, analysis)
│   │   ├── lib/         # Game logic and AI engine
│   │   └── pages/       # Main checkers page
├── server/          # Backend Express server
├── shared/          # Types and schemas shared between frontend/backend
├── docs/            # Project documentation
└── package.json     # Project configuration
```

---

## Deployment Strategies
- **Local-First:** Runs fully offline after setup; no external dependencies required for development.
- **Single Port:** Both API and frontend served from the same port for simplicity and firewall compatibility.
- **Environment-Based:** Uses `NODE_ENV` to distinguish between development and production.
- **Static Assets:** Frontend is built and served as static files by Express in production.
- **Database Migration Path:** Starts with in-memory storage; easy migration to PostgreSQL for production.

---

## Troubleshooting
- **Port Already in Use:**
  - Stop other processes on port 5000 or change the `PORT` variable.
- **Install Fails:**
  - Ensure Node.js 18+ is installed.
  - Delete `node_modules` and `package-lock.json`, then reinstall.
- **Page Won't Load:**
  - Check terminal for "serving on port 5000".
  - Verify you are visiting the correct URL.
- **Database Errors:**
  - Ensure `DATABASE_URL` is set and PostgreSQL is running.
  - Run migrations if schema is missing.

---

## Developer Tips
- Use `npm run dev` for hot-reloading during development.
- Use `.env` file to manage environment variables locally.
- Refer to `LOCAL_SETUP.md` for additional setup and troubleshooting details.

---

## Diagram: Deployment Flow
```mermaid
graph TD;
  A[Developer/Operator] -->|Clones Repo| B[Local Machine/Server]
  B -->|npm install| C[Dependencies Installed]
  C -->|npm run build| D[Production Build]
  D -->|npm run start| E[Express Server]
  E -->|Serves| F[Static Frontend + API]
  E -->|Connects| G[PostgreSQL (optional)]
``` 