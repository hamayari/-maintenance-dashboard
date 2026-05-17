# 🏭 Système de Gestion de Maintenance Industrielle

Tableau de bord de maintenance industrielle basé sur la méthodologie DMAIC pour El Mazraa.

## 🚀 Technologies

- **Backend**: Python Flask + PostgreSQL (production) / MySQL (développement)
- **Frontend**: React.js + CoreUI
- **Authentification**: JWT + Bcrypt
- **Graphiques**: Chart.js

## 📊 Fonctionnalités

- ✅ Authentification sécurisée (JWT)
- ✅ Gestion des machines et pannes
- ✅ Calcul automatique des KPI (MTTR, MTBF, TRS)
- ✅ Définition et suivi des objectifs
- ✅ Actions correctives
- ✅ Évolution des KPI dans le temps
- ✅ Gestion des utilisateurs (RBAC)
- ✅ Rapports PDF/Excel
- ✅ Tableaux de bord interactifs

## 🔧 Installation Locale

### Backend
```bash
cd backend
pip install -r requirements.txt
python init_db.py
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Déploiement

### Backend (Render)
1. Créer un compte sur [Render](https://render.com)
2. Créer une base de données PostgreSQL
3. Créer un Web Service:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
4. Variables d'environnement:
   - `DATABASE_URL`: URL de la base PostgreSQL
   - `SECRET_KEY`: Clé secrète aléatoire

### Frontend (Netlify)
1. Créer un compte sur [Netlify](https://netlify.com)
2. Connecter le dépôt GitHub
3. Configuration:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
4. Variable d'environnement:
   - `VITE_API_URL`: URL du backend Render

## 👤 Compte Test

- Email: `admin@test.com`
- Mot de passe: `admin123`

## 📝 Licence

Projet de Fin d'Études (PFE) - El Mazraa
