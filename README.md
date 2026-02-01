<<<<<<< HEAD
# E-commerce Fashion Website - Frontend-Only

Application e-commerce complète avec dashboard administrateur, construite avec Next.js 16 et TypeScript. Ce projet utilise Supabase comme solution "backend-as-a-service" pour la persistance des données principales et l'authentification.

## 🚀 Fonctionnalités

### Frontend
- ✅ Interface e-commerce moderne (Shop, Product, Cart, Wishlist)
- ✅ Dashboard administrateur complet
- ✅ Gestion des produits (CRUD)
- ✅ Gestion des commandes
- ✅ Gestion des clients
- ✅ Gestion des catégories
- ✅ Gestion des coupons
- ✅ Analytics et statistiques
- ✅ Gestion de l'inventaire
- ✅ Upload d'images (base64)
- ✅ Authentification simplifiée (Login/Register)
- ✅ Thème dark/light

- ✅ Initialisation automatique avec données mockées

## 📋 Prérequis

- Node.js 18+ 
- pnpm (ou npm/yarn)

## 🛠️ Installation

1. **Cloner le projet** (si applicable)
```bash
git clone <repository-url>
cd e-commerce-fashion-website
```

2. **Installer les dépendances**
```bash
pnpm install
```

### Configuration Supabase

L'application utilise Supabase pour la persistance des données et l'authentification. Vous devez configurer votre projet Supabase et fournir les variables d'environnement nécessaires.

1.  **Créer un projet Supabase**: Si vous n'en avez pas, créez un nouveau projet sur [Supabase](https://supabase.com/).
2.  **Récupérer les clés API**: Dans les paramètres de votre projet Supabase, trouvez votre `Project URL` et votre `Anon Key` (clés publiques).
3.  **Créer un fichier `.env.local`**: À la racine de votre projet, créez un fichier nommé `.env.local` et ajoutez-y les variables suivantes :
    ```env
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```
    Remplacez `YOUR_SUPABASE_PROJECT_URL` et `YOUR_SUPABASE_ANON_KEY` par les valeurs de votre projet Supabase.
4.  **Configuration des tables**: Pour le script `create-admin.ts`, vous aurez besoin d'une `SERVICE_ROLE_KEY`. Cette clé ne doit JAMAIS être exposée côté client.
    ```env
    SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
    ```
    Vous devrez également configurer les tables `profiles`, `carts`, et `cart_items` dans votre base de données Supabase. Le schéma est implicite via l'utilisation dans `auth-context.tsx` et `cart-context.tsx`.

La modification inclut également le déplacement de l'instruction `pnpm install` pour qu'elle précède la configuration de Supabase, car les dépendances doivent être installées avant toute exécution de script potentiellement lié à l'environnement.



## 🎯 Utilisation

### Démarrer le serveur de développement
```bash
pnpm dev
```

L'application sera accessible sur `http://localhost:3000`

### Accéder au dashboard admin
1. Aller sur `/admin/login`
2. Se connecter avec :
   - Email: `admin@nextgen.com`
   - Password: `admin123`

### Commandes disponibles
```bash
pnpm dev          # Démarrer le serveur de développement
pnpm build        # Build de production
pnpm start        # Démarrer le serveur de production
pnpm lint         # Linter le code
```

## 📁 Structure du projet

```
├── app/
│   ├── admin/           # Pages admin
│   │   ├── login/        # Page de connexion admin
│   │   ├── products/     # Gestion produits
│   │   ├── orders/       # Gestion commandes
│   │   ├── customers/    # Gestion clients
│   │   ├── categories/   # Gestion catégories
│   │   ├── coupons/      # Gestion coupons
│   │   ├── analytics/    # Statistiques
│   │   ├── inventory/    # Gestion inventaire
│   │   └── settings/     # Paramètres
│   ├── account/          # Pages compte (visiteurs)
│   └── ...               # Pages e-commerce
├── components/           # Composants React
├── context/             # Contexts React (Auth, Cart)
├── hooks/               # Hooks personnalisés
│   ├── use-products.ts   # Gestion produits (via Supabase)
│   ├── use-orders.ts     # Gestion commandes (via Supabase)
│   ├── use-customers.ts  # Gestion clients (via Supabase)
│   ├── use-categories.ts # Gestion catégories (via Supabase)
│   └── use-coupons.ts    # Gestion coupons (via Supabase)
├── lib/
│   ├── supabaseClient.ts # Configuration du client Supabase
│   └── utils.ts          # Fonctions utilitaires diverses
└── public/               # Fichiers statiques
```

## 🔐 Authentification

### Utilisateur Admin
- Email: `admin@nextgen.com`
- Password: `admin123`

### Créer un nouvel utilisateur
Les utilisateurs peuvent s'inscrire via `/account`. Par défaut, ils ont le rôle `customer`.

**Note** : Tous les utilisateurs sont gérés via Supabase Auth et les profils utilisateurs sont stockés dans la table `profiles` de Supabase. Les données peuvent être initialisées avec des scripts (comme `create-admin.ts`).

## 💾 Stockage des données

L'application utilise **Supabase** pour la persistance des données principales et l'authentification, et **localStorage** pour le stockage temporaire des données du formulaire de paiement.

### Données Supabase (Principales)
Les données suivantes sont stockées dans votre base de données Supabase :
-   `users` (via Supabase Auth)
-   `profiles` (rôles et informations supplémentaires des utilisateurs)
-   `products` - Produits
-   `categories` - Catégories
-   `orders` - Commandes
-   `customers` - Clients
-   `coupons` - Coupons
-   `carts` - Paniers (pour les utilisateurs connectés)
-   `cart_items` - Articles des paniers

Pour réinitialiser les données Supabase, vous devrez effacer les tables correspondantes directement via l'interface Supabase ou via des scripts SQL.

### Données localStorage (Temporaires)
`localStorage` est utilisé uniquement pour la persistance des données du formulaire de paiement (`checkout_form_data`) afin d'améliorer l'expérience utilisateur et d'éviter la perte de données temporaires en cas de navigation ou de rafraîchissement.

Pour réinitialiser les données `localStorage` :
1.  Ouvrir la console du navigateur (F12)
2.  Exécuter : `localStorage.clear()`
3.  Recharger la page

## 🎨 Fonctionnalités principales

### Dashboard Admin
- Vue d'ensemble avec statistiques
- Graphiques et analytics
- Gestion complète des produits, commandes, clients
- Gestion de l'inventaire
- Système de coupons

### E-commerce
- Catalogue de produits
- Panier d'achat
- Liste de souhaits
- Pages produit détaillées
- Filtres et recherche

## 🔧 Configuration

**Aucune configuration nécessaire !** L'application fonctionne immédiatement après l'installation des dépendances.

### Variables d'environnement (optionnel)
Si vous souhaitez personnaliser l'application, vous pouvez créer un fichier `.env` :
```env
NODE_ENV="development"
```

## 📝 Architecture Frontend avec BaaS (Supabase)

Cette application est conçue avec une architecture "frontend-first" qui utilise Supabase comme solution de Backend-as-a-Service (BaaS) pour gérer la persistance des données et l'authentification.

### Avantages
-   ✅ Développement rapide et simplifié pour le frontend
-   ✅ Moins de complexité côté serveur à gérer
-   ✅ Déploiement simplifié pour l'application frontend
-   ✅ Données persistantes et sécurisées via Supabase Auth et Base de données
-   ✅ Authentification robuste

### Limitations
-   ⚠️ Dépendance à un service tiers (Supabase)
-   ⚠️ Les schémas de base de données doivent être gérés dans Supabase
-   ⚠️ Coût potentiel lié à l'utilisation du BaaS à grande échelle

## 🐛 Dépannage

### Problèmes Supabase
-   Vérifier que les variables d'environnement Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) sont correctement configurées dans votre fichier `.env.local`.
-   S'assurer que votre projet Supabase est configuré et que les tables nécessaires (comme `profiles`, `carts`, `cart_items`, etc.) existent et ont les permissions appropriées.
-   Consulter les logs de votre projet Supabase pour d'éventuelles erreurs côté serveur.

### Problème d'authentification
-   Vérifier les identifiants de connexion.
-   S'assurer que l'utilisateur existe dans Supabase Auth.
-   Pour les administrateurs, s'assurer que le script `create-admin.ts` a été exécuté et que le rôle 'admin' est attribué dans la table `profiles`.

### Réinitialiser les données locales du navigateur
-   Pour effacer les données temporaires du formulaire de paiement ou tout autre élément stocké localement, vous pouvez exécuter `localStorage.clear()` dans la console de votre navigateur, puis recharger la page.

## 📄 Licence

Ce projet est un exemple d'application e-commerce frontend-only.

## 👨‍💻 Développement

Pour contribuer ou modifier le projet :
1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)

---

**Note** : Cette application est conçue comme une démonstration frontend-only. Pour une application de production, considérez l'ajout d'un backend pour la sécurité, la synchronisation et la persistance des données.
