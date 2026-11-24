# 🏗️ MineTrack — Plateforme de Gestion Minière

Application web full-stack de gestion et de suivi des opérations minières souterraines, multi-sites, pour une entreprise minière en République démocratique du Congo. Remplace un suivi papier : pegs, avancement des travaux, forage, minage, production, équipements, main-d'œuvre, HSE, géologie, soutènement et coûts.

## 🛠️ Stack technique

| Couche | Technologie | Détail |
|--------|-------------|--------|
| Backend | Python · FastAPI · aiosqlite | port 8001, base SQLite `minetrack.db`, ids TEXT uuid4 |
| Auth | JWT en cookie httpOnly | pas de token dans la réponse, `withCredentials: true` côté axios |
| Frontend | React 19 · Vite | port 4000, proxy `/api` vers 8001 |
| i18n | i18next | fr, sw, ln, kg, lu, en |
| Graphiques | Recharts | dashboard et rapports |
| Export | html2canvas + jsPDF | page Rapports |
| Hors ligne | service worker + file d'attente | les mutations sont mises en file, jamais le login |

> Aucune base MongoDB n'est utilisée : le backend est SQLite via `aiosqlite`, servi par `backend/server.py` (seul point d'entrée ; l'ancien refactor `main.py` a été retiré lors de l'audit de sécurité).

## 🚀 Démarrage rapide

### Prérequis

1. **Python 3.10+** — [Télécharger](https://python.org)
2. **Node.js 18+** — [Télécharger](https://nodejs.org)

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

Créés par `backend/create_accounts.py` (idempotent, relançable sans risque). Sur la page de connexion, le rôle pré-remplit l'email ; le mot de passe se saisit.

> ⚠️ Ces mots de passe sont publics : ils ne servent **qu'en local**. Sur un site accessible depuis internet (Vercel), définir la variable `MINETRACK_DEMO_PASSWORD` : elle remplace le mot de passe de tous les comptes de démo.

| Rôle | Email | Mot de passe | Page d'arrivée |
|------|-------|---------------|-----------------|
| Administrateur | admin@minetrack.com | admin123 | /admin/operations |
| Management | management@minetrack.com | mgmt123 | /management/reports |
| Superviseur | supervision@minetrack.com | super123 | /supervisor/dashboard |
| Géologue | geologue@minetrack.com | geo123 | /geologist/dashboard |
| Opérateur | operateur@minetrack.com | oper123 | /miner/dashboard |

Deux rôles restent à spécifier avec le client et n'ont ni compte ni page : **Logistique** et **Support technique**.

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

- **Rôles manquants** : `logistique` et `support` n'existent ni en base, ni dans `ProtectedRoute`, ni dans `SELF_REGISTER_ROLES`. Migration RBAC à faire vers les 5 rôles complets.
- **Règle ESLint `react-hooks/set-state-in-effect`** : jamais de `setState` synchrone dans le corps d'un `useEffect` — appeler l'API et poser l'état dans le `.then`.
- **Chemins d'import** : les pages dans un sous-dossier importent `'../../api'`, pas `'../api'`.
- **Encodage de `START_MINETRACK.bat`** : ASCII pur, fins de ligne CRLF. Ne jamais y introduire d'accents ou de caractères de cadre — `cmd` les interprète comme des commandes.
- **Service worker** : une PWA est active. Après une modification d'écran, vider `node_modules/.vite` et désinscrire le service worker si l'ancienne page reste servie depuis le cache.
