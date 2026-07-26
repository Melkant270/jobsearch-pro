# JobSearch Pro

Application de recherche d'emploi avec FastAPI (backend) + React/Vite (frontend).

## Sources de donnees
- **Arbeitnow** (gratuit, sans cle API)
- **La Bonne Alternance** (gratuit, sans cle API)
- **Adzuna** (optionnel, avec cle API)

## Architecture
- Backend: FastAPI sur port 8000 avec `/api/search`, `/api/geocode`, `/api/health`
- Frontend: React + Vite + Tailwind + Leaflet
- UI en francais, theme bleu/indigo

## Deploiement

### Backend sur Render (gratuit)

1. Aller sur https://dashboard.render.com/
2. Cliquer sur **New > Web Service**
3. Connecter le repo GitHub `Melkant270/jobsearch-pro`
4. Le `render.yaml` sera detecte automatiquement
5. OU configurer manuellement:
   - **Name**: `jobsearch-api`
   - **Environment**: Python
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
6. Cliquer sur **Create Web Service**
7. URL backend: `https://jobsearch-api.onrender.com`

### Frontend sur Vercel (gratuit)

1. Aller sur https://vercel.com/new
2. Importer le repo GitHub `Melkant270/jobsearch-pro`
3. Configurer:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Ajouter variable d'environnement:
   - `VITE_API_URL` = `https://jobsearch-api.onrender.com`
5. Cliquer **Deploy**

### Important
- Deployer le backend (Render) EN PREMIER pour obtenir l'URL
- Mettre l'URL Render dans la variable `VITE_API_URL` sur Vercel
- Si le nom `jobsearch-api` est pris sur Render, adapter l'URL en consequence

## Developpement local

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

Le proxy Vite redirige `/api` vers `http://localhost:8000` en dev.
