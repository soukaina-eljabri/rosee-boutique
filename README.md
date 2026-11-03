# Rosée — Les belles idées du quotidien

Boutique lifestyle responsive en **React + JavaScript**, **CSS natif avec CSS Grid** et **Node.js**. Le projet contient le code complet, ses illustrations SVG originales et les tests. Il est livré comme projet local, sans déploiement.

## Démarrer dans VS Code

Prérequis : **Node.js 22.12 ou supérieur**, avec npm.

1. Extraire le ZIP et ouvrir le dossier `rosee-boutique` dans VS Code.
2. Ouvrir le terminal dans ce dossier.
3. Exécuter :

```bash
npm ci
npm run dev
```

Ouvrir **http://localhost:5173**. Une commande lance Vite et l’API. Arrêter les deux avec `Ctrl+C`.

L’API écoute par défaut sur **http://127.0.0.1:3001**. Vite transmet les requêtes `/api` à Node : aucun réglage CORS n’est nécessaire.

```bash
npm run build
npm test
npm start
```

Après compilation, **http://localhost:3001** sert à la fois React et l’API. Les routes profondes comme `/produit/gourde-nomade` fonctionnent aussi au rechargement. `npm test` nécessite la compilation pour le test des fichiers statiques.

Configuration facultative : copier `.env.example` vers `.env` et ajuster `PORT`, `HOST` ou `DEV_PORT`. Pour écouter sur un réseau local, choisir explicitement `HOST=0.0.0.0` et `DEV_HOST=0.0.0.0`. Aucune clé ni aucun compte externe n’est requis.

## Arborescence

```text
rosee-boutique/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── .env.example
├── public/
│   ├── favicon.svg
│   └── images/                  # 26 SVG originaux, dont 3 vues par produit
├── src/
│   ├── main.jsx                 # Point d’entrée React
│   ├── App.jsx                  # Routes et structure commune
│   ├── api.js                   # fetch, JSON et erreurs HTTP
│   ├── styles.css               # Palette, CSS Grid, responsive, animations
│   ├── components/
│   │   ├── Hero.jsx
│   │   ├── ProductGrid.jsx      # ProductGrid et ProductCard
│   │   ├── Cart.jsx             # Panier latéral et vérification serveur
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── QuantityInput.jsx
│   │   └── Icon.jsx             # Icônes SVG, aucune dépendance externe
│   ├── context/
│   │   ├── CatalogContext.jsx   # Catalogue partagé, chargé depuis l’API
│   │   ├── CartContext.jsx      # Panier partagé et persistance
│   │   └── cartState.js         # Reducer et validation du panier restauré
│   ├── hooks/useDialog.js       # Ouverture, fermeture et défilement
│   ├── utils/money.js           # Affichage monétaire fr-MA / MAD
│   └── pages/
│       ├── Home.jsx
│       ├── Catalog.jsx
│       └── Product.jsx
├── server/
│   ├── index.js                # Initialisation et arrêt du serveur Node.js
│   ├── app.js                  # Routes API, validation et service de dist/
│   └── catalog.js              # Produits, catégories, stock, livraison
├── scripts/
│   ├── dev.mjs                 # Lance Node + Vite, compatible Windows
│   └── generate-assets.mjs     # Régénère les illustrations
├── tests/
│   ├── api.test.js
│   └── cart.test.js
├── CODE_PRINCIPAL.md           # Code intégral des principaux livrables
└── README.md
```

## Architecture et responsabilités

| Couche                   | Rôle                                                                    |
| ------------------------ | ----------------------------------------------------------------------- |
| React / React Router     | Accueil, catalogue, fiche produit et navigation sans rechargement       |
| CatalogContext           | Une source de données partagée, états de chargement et d’erreur         |
| CartContext + useReducer | Ajout, suppression, quantités et compteur du panier                     |
| localStorage             | Conservation versionnée des identifiants et quantités entre les visites |
| API Node.js              | Catalogue, filtres, prix de référence et contrôle des disponibilités    |
| CSS Grid                 | Hero, catégories, grille produits, filtres, fiche et panier             |

Le navigateur met immédiatement les quantités et les estimations à jour. Lorsque le panier est ouvert, l’API vérifie les lignes après une temporisation de 200 ms. Les requêtes obsolètes sont annulées pour éviter qu’un ancien total remplace le plus récent.

L’API reçoit uniquement les identifiants et quantités utiles. Elle retrouve elle-même les prix, additionne les lignes répétées puis vérifie le stock. Tous les calculs utilisent des **entiers en centimes**, afin d’éviter les imprécisions des nombres décimaux. Le prix fourni par un client n’est jamais utilisé.

## Vues et interactions

- **Accueil** : hero illustré, indispensables de la semaine, trois catégories, sélection de quatre articles, présentation de la marque.
- **Catalogue** : catégories, recherche, budget maximum, utilité, nouveautés, tri et remise à zéro. Les critères sont conservés dans l’URL et combinables. Les filtres s’exécutent sur le catalogue déjà chargé pour une réponse immédiate ; l’API expose aussi ces filtres pour une évolution vers un catalogue paginé.
- **Fiche produit** : trois vues, flèches et miniatures, bénéfices, coloris, détails, stock, quantité et ajout. Les produits indisponibles restent consultables.
- **Panier** : panneau animé, modification et suppression sans rafraîchissement, compteur, livraison, progression vers le franco et total vérifié. Le récapitulatif précise qu’aucune commande n’est créée.
- **Responsive** : grille produits à quatre colonnes sur grand écran puis deux colonnes ; hero, catégories et fiche sur une colonne sur mobile.
- **Accessibilité** : boutons et liens sémantiques, labels, états annoncés, focus visible, lien d’évitement, `dialog` natif avec focus modal et fermeture par Échap, respect de `prefers-reduced-motion`.

## Contrat API

| Méthode et route        | Réponse / usage                                          |
| ----------------------- | -------------------------------------------------------- |
| `GET /api/health`       | État du serveur                                          |
| `GET /api/products`     | `{ products, total, categories, shop }`                  |
| `GET /api/products/:id` | `{ product, shop }`, ou 404                              |
| `POST /api/cart/quote`  | Lignes vérifiées, sous-total, livraison, total et devise |

Filtres acceptés par `GET /api/products` :

```text
category=maison|lifestyle|accessoires
utility=emporter|organiser|ralentir
new=true|false
minPrice=0
maxPrice=250
q=nomade
sort=featured|price-asc|price-desc|newest
```

Les paramètres de prix sont exprimés en MAD. Les valeurs dans les réponses sont en centimes.

Exemple de requête :

```http
POST /api/cart/quote
Content-Type: application/json

{"items":[{"productId":"gourde-nomade","quantity":2}]}
```

Extrait de réponse :

```json
{
  "currency": "MAD",
  "subtotalCents": 37800,
  "shippingCents": 2900,
  "totalCents": 40700,
  "freeShippingThresholdCents": 50000
}
```

Erreurs structurées : `{ "error": "Message lisible" }`. L’API gère les requêtes invalides (400), les produits inconnus (404), les méthodes incorrectes (405), le stock insuffisant (409), les corps trop gros (413) et les contenus autres que JSON (415).

## Personnaliser

| Besoin                                        | Fichier                                                                                       |
| --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Nom, texte et liens                           | `Navbar.jsx`, `Hero.jsx`, `Home.jsx`, `Footer.jsx`, `index.html`                              |
| Couleurs, colonnes, espacements et animations | Variables et règles dans `src/styles.css`                                                     |
| Produits, prix, stock et catégories           | `server/catalog.js`                                                                           |
| Coût et seuil de livraison                    | Objet `shop` dans `server/catalog.js` ; adapter aussi les textes promotionnels de l’interface |
| Devise et format monétaire                    | `shop.currency` et `src/utils/money.js` ; adapter les libellés MAD/DH                         |
| Images                                        | `public/images/` et tableau `images` des produits                                             |
| Port de l’API                                 | `PORT` dans `.env`                                                                            |

Pour modifier les illustrations sources : `npm run assets`. Les SVG sont des créations originales incluses dans le projet. Il s’agit d’illustrations d’exemple, pas de photos de produits réels.

## Périmètre de cette version

Cette base est fonctionnelle pour la découverte des produits et la gestion du panier. Les produits, caractéristiques, prix et stocks sont des exemples. Le catalogue est conservé dans un module JavaScript ; le stock est vérifié mais **aucune réservation, commande ou transaction** n’est enregistrée.

Pour ouvrir une vraie boutique, les prochaines briques sont une base de données pour catalogue et commandes, un traitement transactionnel du stock, un prestataire de paiement avec webhooks, et un espace d’administration authentifié. Le paiement et la commande ne sont pas simulés comme réussis.

## Validation

La compilation de production et les 15 tests automatisés vérifient notamment les filtres combinés, les prix serveur, les frais de livraison, le dépassement de stock, les doublons, les JSON invalides, les limites de taille, les routes profondes et la restauration d’un panier corrompu.

Contrôle navigateur effectué : accueil et catalogue sur ordinateur, filtres combinés et filtre prix sans résultat, carrousel, ajout et modification du panier, livraison offerte, récapitulatif, fermeture par Échap, conservation après rechargement et suppression. Une fenêtre responsive de 375 px de largeur utile confirme une grille à deux colonnes, un menu mobile fonctionnel et aucun débordement horizontal sur l’accueil et le catalogue.

Références techniques officielles : [React](https://react.dev/learn), [Vite](https://vite.dev/guide/), [HTTP Node.js](https://nodejs.org/api/http.html), [dialog HTML](https://developer.mozilla.org/fr/docs/Web/HTML/Element/dialog).
