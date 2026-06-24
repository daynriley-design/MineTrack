# Documentation Technique Complète et Détaillée : Minetrack 🚀

Ce document est le guide définitif de l'application **Minetrack**. Il a été pensé pour quelqu'un n'ayant aucune notion de programmation préalable. Nous commencerons par l'architecture globale, puis nous explorerons de manière chirurgicale **absolument chaque dossier et fichier** du projet.

---

## 1. ARCHITECTURE GLOBALE : Comment ça marche ?

Imaginez un restaurant :
1.  **La Base de données (SQLite)** : C'est le cellier. C'est là que sont stockés les ingrédients bruts (utilisateurs, rapports d'incidents, données de production).
2.  **Le Backend (Python / Flask)** : C'est la cuisine. Les cuisiniers (le serveur) reçoivent des commandes, vont chercher les ingrédients dans le cellier, préparent le plat, et le donnent au serveur.
3.  **Le Frontend (React / Javascript)** : C'est la salle de restaurant et le serveur en salle. C'est l'interface magnifique avec laquelle le client (l'utilisateur) interagit. Le client passe commande (clique sur un bouton), le serveur en salle envoie la commande à la cuisine (requête HTTP via l'API), et quand le plat revient, il le pose sur la table (affiche les graphiques).

Voici la structure exacte des dossiers du projet sur votre ordinateur :

```text
minetrack/
├── backend/                       <-- LA CUISINE (Serveur Python)
│   ├── database.py
│   ├── server.py
│   └── minetrack.db
│
└── frontend/                      <-- LA SALLE DE RESTAURATION (Interface React)
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api.js
        ├── i18n.js
        ├── contexts/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── Layout.jsx
        │   └── ProtectedRoute.jsx
        ├── locales/
        │   └── (fr, sw, ln, kg, lu) / translation.json
        └── pages/
            ├── LoginPage.jsx
            ├── DashboardPage.jsx
            └── ReportsPage.jsx
```

Maintenant, plongeons dans le détail absolu de chaque fichier.

---

## 2. DÉTAILS DU BACKEND (Dossier `backend/`)

Le backend utilise **Python** et le framework web **Flask**.

### Fichier 1 : `backend/database.py`
**Rôle** : Créer le cellier (la base de données) et le remplir.
*   **Les Imports** : `import sqlite3` permet à Python de créer et de manipuler un fichier de base de données local.
*   **La fonction `init_db()`** : 
    1.  `conn = sqlite3.connect('minetrack.db')` : Si le fichier `minetrack.db` n'existe pas, il le crée. C'est notre disque dur de données.
    2.  `c.execute('CREATE TABLE...')` : Il crée des "tableaux" Excel virtuels. Il crée une table `users` (colonnes: email, password, role), une table `pegs` (zones d'exploration), une table `production`, et une table `incidents`.
    3.  **Les fausses données (Mock Data)** : Le fichier regarde si la table `users` est vide. Si oui, il ajoute un compte de test (`INSERT INTO users...`) avec l'email `daynriley@gmail.com` et le mot de passe `Marie_tte637`. Il fait de même pour générer de fausses données de production pour que vos graphiques ne soient pas vides.
    4.  `conn.commit()` : Il sauvegarde tout.

### Fichier 2 : `backend/server.py`
**Rôle** : Écouter le web. C'est le standardiste téléphonique de la cuisine.
*   **Flask et CORS** : `Flask(__name__)` crée le standard téléphonique. `CORS(app)` est une règle de sécurité qui dit "J'autorise le Frontend (qui est sur le port 5173) à m'appeler. Sinon, par sécurité, les navigateurs bloquent les appels entre ports différents.
*   **La Route de Connexion (`@app.route('/api/login')`)** :
    1.  Le code reçoit un `email` et un `password` du Frontend (`request.json`).
    2.  Il ouvre la base de données, et demande : "Y a-t-il un utilisateur avec cet email et ce mot de passe exacts ?"
    3.  Si oui (`if user:`), il renvoie au Frontend un **Token** (un jeton secret `fake-jwt-token`) et les infos de l'utilisateur (son nom, son rôle admin).
    4.  Si non, il renvoie une erreur (Code `401 Unauthorized`).
*   **La Route des Statistiques (`@app.route('/api/dashboard/stats')`)** :
    1.  Elle interroge la base de données pour compter (`SELECT COUNT(*)`) le nombre de *Pegs* actifs, la production totale, le nombre d'incidents.
    2.  Elle renvoie tout ça sous forme de "Dictionnaire" formaté en **JSON** (JavaScript Object Notation), un format texte que le Frontend adore lire.
*   **`app.run(port=5000)`** : Allume le standard téléphonique sur le port 5000 de votre machine.

---

## 3. DÉTAILS DU FRONTEND (Dossier `frontend/`)

Le Frontend utilise **React** (une librairie JavaScript pour construire des interfaces) et **Vite** (un outil ultra-rapide pour faire tourner React).

### A. Le Moteur et le Démarrage
#### Fichier 3 : `frontend/index.html`
C'est le seul vrai fichier web ! Il est presque vide. Il contient juste une balise `<div id="root"></div>`. C'est comme une toile blanche. React va venir peindre toute l'application à l'intérieur de cette `div`.

#### Fichier 4 : `frontend/src/main.jsx`
Le point d'injection. C'est le pinceau de React.
*   Il prend le composant principal (`<App />`) et l'injecte dans le `root` du fichier `index.html`.
*   Il entoure `<App />` avec `<BrowserRouter>` (qui permet de changer l'adresse URL sans recharger la page web) et `<I18nextProvider>` (qui permet au site de parler plusieurs langues).

#### Fichier 5 : `frontend/src/App.jsx`
Le Contrôleur Aérien. Il lit ce qu'il y a dans la barre d'adresse du navigateur web.
*   Si l'URL est `/login`, il affiche la page `<LoginPage />`.
*   Il configure des routes "Protégées" avec `<ProtectedRoute>`. Ça veut dire que si on essaie de taper `/dashboard` dans la barre d'adresse sans être connecté, l'application dit "Non" et nous ramène de force à l'accueil `/login`.

### B. Outils Globaux de l'Application
#### Fichier 6 : `frontend/src/index.css`
Le Pinceau et la Palette de couleurs.
*   Il utilise des "Variables CSS" (`--color-obsidian`, `--color-emerald`). C'est génial car si un jour on veut changer le bleu du site, on le change juste ici, et tous les boutons bleus du site changeront !
*   Il définit les styles du "Glassmorphism" (les fenêtres un peu transparentes et floues très modernes).

#### Fichier 7 : `frontend/src/api.js`
Le Messager personnel (utilise **Axios**).
*   Il sait que l'adresse de la cuisine est `http://localhost:5000/api`.
*   **Le Concept de l'Intercepteur** : À chaque fois que l'utilisateur veut voir une page sécurisée, `api.js` intercepte la demande, fouille dans la mémoire du navigateur, prend le **Token** de connexion (le jeton secret), et le colle sur la requête (comme un timbre). Le serveur Python verra le Token et dira "Ah, je te connais, tu as le droit de voir ces données".

#### Fichier 8 : `frontend/src/i18n.js` (Multilinguisme)
Le Traducteur.
*   Il charge la librairie `i18next`.
*   Il importe des fichiers `translation.json` situés dans les dossiers `locales/` (français, swahili, lingala, tshiluba, kikongo).
*   Dans chaque composant du site, on écrit par exemple `{t('dashboard.title')}`. Ce fichier regarde la langue actuelle, fouille dans le bon `.json`, et remplace le code par le vrai texte (ex: "Aperçu Global" ou "Botala ya monene").

#### Fichier 9 : `frontend/src/contexts/AuthContext.jsx`
Le Videur de boîte de nuit.
*   Il utilise la puissance de `React Context` pour créer une bulle de mémoire globale.
*   Il se rappelle si vous êtes connecté ou non (variable `user`).
*   Quand vous vous connectez avec succès, il sauvegarde votre Token dans le `localStorage` (le petit disque dur interne de votre navigateur Chrome/Firefox). Quand vous vous déconnectez, il efface ce Token.

### C. Les Composants d'Interface Visuelle (Dossier `components/`)
#### Fichier 10 : `components/Layout.jsx`
L'Emballage. Quasiment toutes les pages du site (Dashboard, Rapports) sont mises dans cette "boîte".
*   Il contient la **Sidebar** (le grand menu noir à gauche avec les liens).
*   Il contient le **Topbar** (la barre en haut). C'est là que se trouve le menu déroulant qui permet de changer la langue (`i18n.changeLanguage(langue)`).
*   Il a une balise `<Outlet />`. C'est un trou béant. C'est ici que React injecte le contenu de la page sur laquelle on a cliqué.

#### Fichier 11 : `components/ProtectedRoute.jsx`
Le Péage. Un tout petit composant de 10 lignes. Avant d'afficher la page Dashboard, il regarde si `user` existe dans `AuthContext`. Si non, il exécute `<Navigate to="/login" />`.

### D. Les Pages (Dossier `pages/`)
#### Fichier 12 : `pages/LoginPage.jsx`
La porte d'entrée.
*   Un formulaire avec deux cases mémoire (`email`, `password`) gérées par `useState`.
*   Quand on clique sur "Se connecter", le code envoie ces données à `authAPI.login()` (qui contacte Python). Si Python répond "OK", il appelle la fonction `login()` du `AuthContext` et nous envoie vers le Dashboard.

#### Fichier 13 : `pages/DashboardPage.jsx`
Le Tableau de bord massif. Le cœur du système.
*   **L'effet de bord (`useEffect`)** : Au moment même où la page s'affiche, le code dit "Hey Python, envoie moi les Statistiques et les données des Graphiques".
*   Pendant que Python cherche, la page affiche "Chargement..." (`loading === true`).
*   Dès que les données arrivent, elles sont stockées dans `useState(stats)` et `useState(charts)`.
*   **Le Rendu Visuel** : 
    *   La page parcourt la liste des KPIs (Les petites cartes carrées "Tonnage", "Incidents") et les remplit avec les chiffres reçus.
    *   Elle utilise la librairie **Recharts** pour dessiner les `<LineChart>` (courbe de production) et `<PieChart>` (camembert des dépenses financières) en se basant sur les tableaux mathématiques renvoyés par Python.

#### Fichier 14 : `pages/ReportsPage.jsx`
La page d'exportation.
*   Elle refait appel à Python pour obtenir un gros résumé des performances du mois.
*   **La Magie du PDF** : Elle possède une fonction `exportPDF()`. Lorsqu'on clique sur le bouton de téléchargement :
    1.  Le code utilise `html2canvas` pour scruter la balise ayant l'identifiant `#report-content` et la transforme en une grande photographie PNG invisible.
    2.  Cette image est envoyée à `jsPDF`, qui la redimensionne au format papier A4 (210x297mm) et force votre navigateur à télécharger un fichier `.pdf`.
    3.  Les éléments de l'interface qui ne doivent pas être imprimés (comme le bouton de téléchargement lui-même) portent l'attribut spécial `data-html2canvas-ignore="true"`.
*   **L'Analyse Intelligente** : Sous chaque graphique, une fonction Javascript `getAnalysisText()` analyse les mathématiques. Par exemple, si `tonnage > 50000`, la fonction renvoie un long paragraphe en Français félicitant l'équipe pour ses performances. Ce texte dynamique est inséré dans un composant `<AnalysisBlock />` qui donne au rapport final une allure extrêmement professionnelle, comme s'il avait été rédigé par un ingénieur.

---

## EN CONCLUSION
Pour maîtriser cette application, il suffit de suivre mentalement le chemin d'une donnée :
1.  **L'Utilisateur** clique sur le menu (React - `Layout.jsx` / `App.jsx`).
2.  **La Page** demande des chiffres (React - `DashboardPage.jsx`).
3.  **Le Facteur** transporte la demande (Axios - `api.js`).
4.  **Le Serveur** l'intercepte (Flask - `server.py`).
5.  **La Base de données** trouve les chiffres (SQLite - `database.py`).
6.  Le tout fait le chemin inverse, et React dessine un joli graphique sur votre écran.
