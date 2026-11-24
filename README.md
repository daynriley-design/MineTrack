# 🏗️ MineTrack — Plateforme de Gestion Minière

Application web full-stack de gestion et de suivi des opérations minières souterraines, multi-sites, pour une entreprise minière en République démocratique du Congo. Remplace un suivi papier : pegs, avancement des travaux, forage, minage, production, équipements, main-d'œuvre, HSE, géologie, soutènement et coûts.

## 🛠️ Stack technique

| Couche | Technologie | Détail |
|--------|-------------|--------|
| Backend | Python · FastAPI · aiosqlite · pg8000 | port 8001, SQLite par défaut, PostgreSQL avec `DATABASE_URL` |
| Auth | JWT en cookie httpOnly | pas de token dans la réponse, `withCredentials: true` côté axios |
| Frontend | React 19 · Vite | port 4000, proxy `/api` vers 8001 |
| i18n | i18next | fr, sw, ln, kg, lu, en |
| Graphiques | Recharts | dashboard et rapports |
| Export | html2canvas + jsPDF | page Rapports |
| Hors ligne | service worker + file d'attente | les mutations sont mises en file, jamais le login |

`backend/server.py` expose l'API FastAPI. `backend/database.py` sélectionne la base au démarrage. SQLite utilise `backend/minetrack.db` par défaut.

## 🚀 Démarrage rapide

### Prérequis

1. **Python 3.10+** — [Télécharger](https://python.org)
2. **Node.js 20.19+ ou 22.12+** — [Télécharger](https://nodejs.org)

### Option 1 : Script automatique (Windows)

Double-cliquer sur `START_MINETRACK.bat` à la racine. Il vérifie Node et Python, libère les ports 4000 et 8001, installe les dépendances au premier lancement, démarre le backend, attend qu'il réponde, crée les comptes, démarre le frontend et ouvre le navigateur.

### Option 2 : Manuel

```bash
# Terminal 1 — Backend
cd backend
pip install -r requirements.txt
python server.py          # port 8001
python create_accounts.py # une fois la base créée (idempotent)

# Terminal 2 — Frontend
cd frontend
npm ci
npm run dev                # port 4000
```

### Accès

| Service | URL |
|---------|-----|
| 🌐 Interface web | http://localhost:4000 |
| 🔧 API Backend | http://localhost:8001 |
| 📚 Documentation API | http://localhost:8001/docs |

### Comptes

**Créer un compte** : onglet « Créer un compte » de la page de connexion (nom, email, fonction, mot de passe de 8 caractères minimum). Le compte reste **en attente** jusqu'à sa validation dans la page *Utilisateurs* : un superviseur valide les opérateurs, géologues, logistique et support ; l'administrateur valide tous les rôles. Le rôle administrateur ne peut pas être demandé.

Créés par `backend/create_accounts.py` (idempotent, relançable sans risque). Sur la page de connexion, le rôle pré-remplit l'email ; le mot de passe se saisit.

> Ces mots de passe de démonstration sont publics et réservés au développement local. `MINETRACK_DEMO_PASSWORD` s'applique à la création des comptes de démo. Les mots de passe des comptes déjà présents doivent être changés séparément.

| Rôle | Email | Mot de passe | Page d'arrivée |
|------|-------|---------------|-----------------|
| Administrateur | admin@minetrack.com | admin123 | /admin/operations |
| Management | management@minetrack.com | mgmt123 | /management/reports |
| Superviseur | supervision@minetrack.com | super123 | /supervisor/dashboard |
| Géologue | geologue@minetrack.com | geo123 | /geologist/dashboard |
| Opérateur | operateur@minetrack.com | oper123 | /miner/dashboard |
| Logistique | logistique@minetrack.com | logi123 | /logistique/dashboard |
| Support technique | support@minetrack.com | support123 | /support/dashboard |

### Configuration du déploiement

- `DATABASE_URL` sélectionne PostgreSQL, y compris une base Supabase. Sur Vercel, SQLite utilise `/tmp/minetrack.db`, un stockage éphémère. Le démarrage initialise le schéma de la base sélectionnée. Le transfert de données existantes depuis SQLite est une opération séparée.
- `JWT_SECRET` est requis par le backend pour signer les sessions.
- `MINETRACK_DEMO_ACCOUNTS=0` désactive la création automatique des comptes de démo sur un déploiement Vercel.
- `VITE_GA_MEASUREMENT_ID` active Google Analytics lors du build frontend. Les changements de route sont suivis via la mesure améliorée du flux Web GA4, avec le suivi des événements d'historique activé.

### Données de démonstration (optionnel)

```bash
cd backend
python seed.py
```

Insère des données factices dans les modules historiques (pegs, production, forage, tirs, équipements, main-d'œuvre, HSE, géologie, support, financier). Ne touche pas à la table `users` — les comptes sont gérés exclusivement par `create_accounts.py`.

## 📋 Modèle métier

```text
site (ex. Kadutu, Mungu, Yawera, Mumba)
 |
 +-- monthly_plan   période YYYY-MM, niveau, front, mètres prévus
 |     +-- layout    tronçon saisi manuellement : mètres, azimut, date
 |
 +-- machine        numéro unique, type, numérotation par type
 |
 +-- shift_report   date + shift (day|night) + un des 9 types de rapport + payload JSON
```

Le layout est saisi à la main, jamais calculé : les angles et directions changent sur le terrain, donc le découpage du total mensuel en tronçons ne peut pas être automatisé. L'avancement d'un front est la somme de ses layouts divisée par les mètres prévus du mois.

### Les neuf rapports de shift

`safety`, `concerns`, `blasting`, `shift_preparation`, `construction_service`, `tramming_machine_status`, `drilling_machine_status`, `longhole_report`, `critical_material`.

## 📋 Modules historiques

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

## ⚠️ Dette connue

- **Règle ESLint `react-hooks/set-state-in-effect`** : jamais de `setState` synchrone dans le corps d'un `useEffect` — appeler l'API et poser l'état dans le `.then`.
- **Chemins d'import** : les pages dans un sous-dossier importent `'../../api'`, pas `'../api'`.
- **Encodage de `START_MINETRACK.bat`** : ASCII pur, fins de ligne CRLF. Ne jamais y introduire d'accents ou de caractères de cadre — `cmd` les interprète comme des commandes.
- **Service worker** : une PWA est active. Après une modification d'écran, vider `node_modules/.vite` et désinscrire le service worker si l'ancienne page reste servie depuis le cache.
