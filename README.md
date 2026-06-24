# 🏗️ Minetrack — Plateforme de Gestion Minière

Application web full-stack pour la gestion et le suivi des opérations minières en temps réel.

## 🚀 Démarrage rapide

### Prérequis

1. **MongoDB** — [Télécharger](https://www.mongodb.com/try/download/community)
2. **Python 3.10+** — [Télécharger](https://python.org)
3. **Node.js 18+** — [Télécharger](https://nodejs.org)

### Installation

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend (déjà fait si npm install a été exécuté)
cd frontend
npm install
```

### Lancement

**Option 1 : Script automatique (Windows)**
```
Double-cliquer sur START_MINETRACK.bat
```

**Option 2 : Manuel**
```bash
# Terminal 1 - Backend
cd backend
python server.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Accès

| Service | URL |
|---------|-----|
| 🌐 Interface web | http://localhost:3000 |
| 🔧 API Backend | http://localhost:8001 |
| 📚 Documentation API | http://localhost:8001/docs |

### Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Administrateur | admin@minetrack.com | admin123 |
| Superviseur | superviseur@minetrack.com | super123 |
| Opérateur | operateur@minetrack.com | oper123 |
| Géologue | geologue@minetrack.com | geo123 |

### Données de démonstration

```bash
cd backend
python seed.py
```

Insère 15 pegs, 30j de production, 20 forages, 8 tirs, 8 équipements, etc.

## 📋 Modules

| Module | Description |
|--------|-------------|
| 🗺️ Pegs | Piquets d'implantation et zones minières |
| 📈 Avancement | Suivi des travaux par équipe |
| ⚙️ Forage | Opérations de forage et sondages |
| 💥 Abattage | Tirs de mine et résultats |
| 🏭 Production | Tonnage et volumes extraits |
| 🚛 Équipements | Flotte d'engins et maintenance |
| 👷 Main-d'œuvre | Personnel, shifts et heures |
| 🛡️ HSE | Incidents sécurité et sévérité |
| 🔬 Géologie | Analyses de carottes et teneurs |
| 🔧 Support | Tickets d'intervention technique |
| 💰 Financier | Dépenses et coûts opérationnels |
| 📊 Rapports | Synthèse complète et graphiques |

## 🛠️ Stack technique

**Backend** : Python · FastAPI · Motor · MongoDB · JWT · Bcrypt  
**Frontend** : React 19 · Vite · React Router · Recharts · Lucide Icons · CSS custom
