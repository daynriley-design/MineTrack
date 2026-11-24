# Documentation technique — MineTrack

Guide de l'application pour quelqu'un qui découvre le projet. Il décrit l'état **actuel** du code.

---

## 1. Architecture en une image

Imaginez un restaurant :

1. **La base de données** est le cellier. En local, c'est un fichier SQLite (`backend/minetrack.db`). En production, c'est Postgres sur Supabase dès que la variable `DATABASE_URL` est définie.
2. **Le backend** (Python, FastAPI) est la cuisine. Il reçoit les demandes, vérifie qui les fait, lit ou écrit dans la base, et renvoie le résultat.
3. **Le frontend** (React + Vite) est la salle : l'interface que voient les utilisateurs. Il appelle le backend sur `/api/...`.

```text
mt/
├── api/index.py            ← point d'entrée Vercel (lance le backend FastAPI)
├── backend/
│   ├── server.py           ← application FastAPI : authentification, tableaux de bord, modules
│   ├── routers/operations.py ← sites, plans mensuels, layouts, machines, agents, stocks, rapports de shift
│   ├── database.py         ← accès base : SQLite par défaut, Postgres si DATABASE_URL
│   ├── auth_utils.py       ← mots de passe (bcrypt), jetons JWT, contrôle des rôles
│   ├── create_accounts.py  ← comptes de démonstration (un par rôle)
│   ├── models.py           ← formats des données reçues (Pydantic)
│   └── seed.py             ← données d'exemple (local uniquement)
├── frontend/
│   ├── src/App.jsx         ← routes et rôles autorisés par page
│   ├── src/components/     ← AppShell (navigation), PageHero (en-tête), LanguageSwitcher…
│   ├── src/pages/          ← écrans par rôle (supervisor/, logistique/, support/, management/, admin/…)
│   ├── src/locales/        ← traductions (fr, en, sw, ln, kg, lu)
│   └── src/utils/          ← rapport PDF, Google Analytics, file hors ligne
├── vercel.json             ← build, routes /api, en-têtes de sécurité
└── START_MINETRACK.bat     ← lancement local en un double-clic (Windows)
```

## 2. Sécurité

- **Connexion** : email + mot de passe, vérifiés par bcrypt. Le serveur dépose un jeton JWT dans un cookie `HttpOnly` (illisible par JavaScript), `SameSite=Lax`, `Secure` en HTTPS. Aucun jeton n'est stocké dans le navigateur.
- **Session** : à chaque requête, le serveur vérifie que le compte existe toujours avec le même rôle et qu'il est actif. Un compte supprimé est déconnecté immédiatement.
- **Rôles** : chaque route vérifie le rôle (`require_role`). Modifier ou supprimer des données métier est réservé à l'admin et au superviseur.
- **Inscription** : publique, mais le compte est créé *en attente* et doit être validé (page Utilisateurs). Le rôle admin ne peut pas être demandé.
- **Anti-abus** : 10 échecs de connexion par IP et par email bloquent 15 minutes ; 5 demandes de compte maximum par IP et par heure ; requêtes limitées à 10 Mo.
- **Production** : documentation de l'API (`/docs`) désactivée, en-têtes de sécurité (CSP, HSTS, anti-iframe…), mot de passe des comptes de démo fourni par `MINETRACK_DEMO_PASSWORD`.
- **Supabase** : la sécurité par ligne (RLS) est activée sur toutes les tables ; l'API REST publique de Supabase ne peut pas les lire.

## 3. Rôles et écrans

| Rôle | Page d'arrivée | Ce qu'il fait |
|------|----------------|---------------|
| Administrateur | `/admin/operations` | Sites, plans mensuels, machines, agents, modules, comptes |
| Management | `/management/reports` | Consulte les rapports de shift, export PDF |
| Superviseur | `/supervisor/dashboard` | Rapports de shift, validation HSE, stocks, finances, comptes |
| Logistique | `/logistique/dashboard` | Stocks et consommation en fin de poste |
| Support technique | `/support/dashboard` | Pannes, eau, incidents, minage, index machines, layouts |
| Géologue / Opérateur | `/geologist/…`, `/miner/…` | Écrans terrain (déclaration Face Safe, échantillons…) |

## 4. Parcours d'une donnée (exemple : déclaration Face Safe)

1. Le mineur remplit le formulaire (`pages/miner/MinerHSE.jsx`).
2. Le frontend envoie `POST /api/hse-checklists` ; sans réseau, la requête est mise en file et rejouée au retour de la connexion (`utils/offlineQueue.js`).
3. Le backend vérifie la session et enregistre la déclaration avec le statut `pending`.
4. Le superviseur la voit dans *Validation HSE* et appelle `POST /api/hse-checklists/{id}/review` : le serveur enregistre la décision, son auteur et l'heure.
5. Le mineur voit le statut mis à jour dans « Mes dernières déclarations ».

## 5. Rapports PDF

`frontend/src/utils/reportPdf.js` produit des PDF en texte vectoriel : page de garde (formes orange pâle, titre, période, « Préparé pour »), table des matières, chapitres numérotés, tableaux légendés et numéros de page. Utilisé par Management (rapport de shift) et Superviseur (rapport d'opérations).

## 6. Langues

`i18next` charge le français au démarrage et les autres langues à la demande. Les textes de l'interface sont dans `frontend/src/locales/<langue>/translation.json`. Le français, l'anglais et le swahili sont complets ; le lingala, le kikongo et le tshiluba couvrent la connexion, la navigation et l'écran Management (le reste retombe sur le français).

## 7. Lancer et déployer

- **Local** : double-cliquer `START_MINETRACK.bat`, ou `python backend/server.py` puis `npm run dev` dans `frontend/`. Interface : http://localhost:4000, API : http://localhost:8001 (documentation : `/docs`).
- **Production** : `npx.cmd vercel@48.0.0 deploy --prod --yes` depuis `mt/`. Variables Vercel : `JWT_SECRET`, `MINETRACK_DEMO_PASSWORD`, `VITE_GA_MEASUREMENT_ID`, et `DATABASE_URL` (Supabase) pour des données permanentes.
