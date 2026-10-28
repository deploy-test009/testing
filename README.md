# deploy-test

A minimal monorepo designed to verify fullstack deployment pipelines from a **GitHub Organization repository** to **Vercel** (Frontend) and **Render** (Backend).

---

## 📁 Repository Structure

```text
deploy-test/
├── backend/
│   ├── .env.example        # Environment variable template
│   ├── index.js            # Express server with /health, /api/hello, /api/db-status
│   └── package.json        # Express, CORS, dotenv, Mongoose
├── frontend/
│   ├── .env.example        # Frontend environment variable template
│   ├── index.html          # HTML entry point
│   ├── package.json        # React 18, Vite
│   ├── vercel.json         # SPA route rewrite configuration
│   ├── vite.config.js      # Vite configuration
│   └── src/
│       ├── App.jsx         # Verification dashboard UI
│       ├── index.css       # Clean, modern responsive styles
│       └── main.jsx        # React root mounting
├── .gitignore              # Ignores node_modules, .env, dist
└── README.md               # Setup and deployment documentation
```

---

## 🚀 Local Development Setup

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start the server (runs on http://localhost:5000 by default)
npm start
```

Backend endpoints available:
- `GET /health` -> `{"status":"ok","time":"<ISO timestamp>"}`
- `GET /api/hello` -> `{"message":"Hello from the backend","env":"development"}`
- `GET /api/db-status` -> `{"connected":false,"reason":"MONGO_URI not set"}` (or `{"connected":true}` if `MONGO_URI` is provided)

### 2. Frontend Setup

In a new terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start the Vite development server (runs on http://localhost:5173 by default)
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser. You should see a green **"Connected"** status with the health check and greeting loaded automatically.

---

## 🌐 Render Deployment (Backend)

Deploy the Express backend as a **Web Service** on Render:

1. **Create Web Service**:
   - Go to [dashboard.render.com](https://dashboard.render.com) and click **New +** > **Web Service**.
   - Connect your GitHub Organization repository `deploy-test`.
   *(Make sure your GitHub Organization has granted Render access to the repository in GitHub Settings > Applications).*

2. **Configure Service Settings**:
   | Field | Setting |
   |---|---|
   | **Name** | `deploy-test-backend` (or your choice) |
   | **Region** | Choose nearest region (e.g. Oregon, Frankfurt, Singapore) |
   | **Branch** | `main` |
   | **Root Directory** | `backend` *(Crucial for monorepo)* |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |

3. **Environment Variables**:
   Add the following in Render's **Environment** tab:
   | Key | Value | Notes |
   |---|---|---|
   | `NODE_ENV` | `production` | Recommended |
   | `FRONTEND_URL` | `https://<your-vercel-app>.vercel.app` | Set after Vercel deployment (or leave blank initially to allow all origins) |
   | `MONGO_URI` | *(Optional)* `mongodb+srv://...` | Set if testing MongoDB connectivity |

   > **Note on `PORT`**: Render automatically assigns a `PORT` environment variable (default `10000`). The backend automatically binds to `process.env.PORT`.

4. **Verify Backend**:
   Once deployed, navigate to `https://<your-render-service>.onrender.com/health` in your browser. It should return:
   ```json
   { "status": "ok", "time": "2026-..." }
   ```

---

## ⚡ Vercel Deployment (Frontend)

Deploy the Vite React frontend on Vercel:

1. **Import Project**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard) and click **Add New...** > **Project**.
   - Select your GitHub Organization from the account dropdown and select `deploy-test`.
   *(Ensure the Vercel GitHub App is installed in your Organization).*

2. **Configure Project Settings**:
   | Setting | Value |
   |---|---|
   | **Framework Preset** | `Vite` |
   | **Root Directory** | Click **Edit** and select `frontend` *(Crucial for monorepo)* |
   | **Build Command** | `npm run build` (default) |
   | **Output Directory** | `dist` (default) |
   | **Install Command** | `npm install` (default) |

3. **Environment Variables**:
   In the **Environment Variables** section, add:
   | Key | Value | Description |
   |---|---|---|
   | `VITE_API_URL` | `https://<your-render-service>.onrender.com` | The live URL of your Render backend |

4. **Deploy**:
   - Click **Deploy**.
   - Vercel will install dependencies, build the static assets, and deploy them.

---

## 🔒 GitHub Organization Permissions Note

When working with GitHub Organization repositories:
1. **GitHub Org**: Push to your target repository:
   ```bash
   git remote set-url origin https://github.com/deploy-test009/deploy-test.git
   git push -u origin main
   ```
2. **Render**: When connecting Render to GitHub, Render will ask which repositories it can access. If your repo is owned by an Organization, request or grant access under **GitHub > Organization Settings > Third-party Access / GitHub Apps > Render**.
3. **Vercel**: When importing a repository into Vercel, select the Organization scope. If the repo does not appear, click **Configure GitHub App** to grant access to the specific repo.

---

## ✅ End-to-End Verification Checklist

1. **Frontend Loads**: Open `https://<your-vercel-app>.vercel.app`.
2. **Backend Reached**: Status badge shows green **"Connected"**.
3. **Health Check**: `/health` response card shows `{ "status": "ok", "time": "..." }`.
4. **Greeting**: `/api/hello` card shows `{ "message": "Hello from the backend", "env": "production" }`.
5. **CORS Check**: Ensure no CORS errors appear in browser DevTools console (F12).
6. **MongoDB Check** *(optional)*: Click **"Check Database Status"**. If `MONGO_URI` is configured, it will show `{ "connected": true }`.

