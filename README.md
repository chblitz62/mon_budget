<p align="center">
  <img src="logo.png" alt="AFERTES" width="300">
</p>

<p align="center">
  <a href="https://github.com/chblitz62/mon_budget/actions/workflows/ci.yml">
    <img src="https://github.com/chblitz62/mon_budget/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
</p>

# Budget Prévisionnel - Protection de l'Enfance

Application web de gestion de budget prévisionnel pour les structures d'accueil dans le secteur de la protection de l'enfance.

**[Accéder à l'application](https://mon-budget-kappa.vercel.app)**

## Fonctionnalités

### Gestion budgétaire
- **Budget Direction & Siège** : Personnel administratif, loyer, charges
- **Budget par Lieu de Vie** : Personnel éducatif, charges d'exploitation, investissements
- **Projection sur 3 ans** avec augmentation annuelle paramétrable
- **Graphique de répartition** du budget (masse salariale, exploitation, amortissements, intérêts)

### Calculs automatiques
- **Salaires** : Brut + charges patronales (42%) + prime Ségur
- **Amortissements** : Calcul linéaire sur la durée
- **Mensualités de prêt** : Formule d'amortissement standard avec tableau détaillé
- **Prix de journée** : Budget total / jours d'occupation
- **Répartition du siège** : Proportionnelle aux jours par lieu
- **Total ETP** : Affichage par section

### Indicateurs financiers
- **Provisions pour charges** :
  - Congés payés (% masse salariale)
  - Grosses réparations (% immobilisations)
  - Créances douteuses (% chiffre d'affaires)
- **BFR (Besoin en Fonds de Roulement)** : Créances - Dettes fournisseurs

### Interface
- **Mode sombre** persistant
- **Sauvegarde automatique** dans le navigateur (localStorage)
- **Validation des champs** numériques

### Export
- Sauvegarde/chargement au format JSON
- Export CSV détaillé
- Export Excel avec onglets multiples
- Impression optimisée

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/chblitz62/mon_budget.git
cd mon_budget

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Lancer les tests
npm run test:run

# Build de production
npm run build
```

## Technologies

- React 18
- Vite
- Tailwind CSS
- Lucide React (icônes)
- SheetJS (export Excel)
- Vitest (tests)

## Structure du projet

```
src/
├── App.jsx                    # Composant principal de l'application
├── main.jsx                   # Point d'entrée React
├── index.css                  # Styles Tailwind
└── utils/
    ├── constants.js           # Constantes et valeurs par défaut
    ├── calculations.js        # Fonctions de calcul
    └── calculations.test.js   # Tests unitaires (31 tests)

.github/
└── workflows/
    └── ci.yml                 # Pipeline CI/CD GitHub Actions
```

## Tests

Le projet inclut 31 tests unitaires couvrant :
- Fonctions de validation
- Calculs financiers (mensualités, salaires, amortissements)
- Calculs de budget (direction, lieux)
- Provisions et BFR
- Synthèse 3 ans

```bash
npm run test      # Mode watch
npm run test:run  # Exécution unique
```

## Structure des données

### Paramètres globaux
| Paramètre | Description | Valeur par défaut |
|-----------|-------------|-------------------|
| Augmentation annuelle | Inflation appliquée aux salaires et charges | 2.5% |
| Taux provision congés payés | Sur la masse salariale | 10% |
| Taux provision grosses réparations | Sur les immobilisations | 2% |
| Taux provision créances douteuses | Sur le chiffre d'affaires | 1% |
| Délai paiement clients | Pour calcul BFR | 30 jours |
| Délai paiement fournisseurs | Pour calcul BFR | 30 jours |

### Constantes
| Constante | Valeur |
|-----------|--------|
| Charges patronales | 42% |
| Prime Ségur | 238 €/mois |
| Jours par an | 365 |

## CI/CD

Le projet utilise GitHub Actions pour l'intégration continue :
- Exécution des tests sur chaque push et pull request
- Build de vérification
- Déploiement automatique sur Vercel

## Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Auteur

AFERTES - Formation et accompagnement dans le secteur social et médico-social
