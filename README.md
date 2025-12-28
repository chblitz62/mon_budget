<p align="center">
  <img src="logo.png" alt="AFERTES" width="300">
</p>

# Budget Prévisionnel - Protection de l'Enfance

Application web de gestion de budget prévisionnel pour les structures d'accueil dans le secteur de la protection de l'enfance.

**[Accéder à l'application](https://mon-budget-kappa.vercel.app)**

## Fonctionnalités

### Gestion budgétaire
- **Budget Direction & Siège** : Personnel administratif, loyer, charges
- **Budget par Lieu de Vie** : Personnel éducatif, charges d'exploitation, investissements
- **Projection sur 3 ans** avec augmentation annuelle paramétrable

### Calculs automatiques
- **Salaires** : Brut + charges patronales (42%) + prime Ségur
- **Amortissements** : Calcul linéaire sur la durée
- **Mensualités de prêt** : Formule d'amortissement standard
- **Prix de journée** : Budget total / jours d'occupation
- **Répartition du siège** : Proportionnelle aux jours par lieu

### Indicateurs financiers
- **Provisions pour charges** :
  - Congés payés (% masse salariale)
  - Grosses réparations (% immobilisations)
  - Créances douteuses (% chiffre d'affaires)
- **BFR (Besoin en Fonds de Roulement)** : Créances - Dettes fournisseurs

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
```

## Technologies

- React
- Tailwind CSS
- Lucide React (icônes)
- SheetJS (export Excel)

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

## Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Auteur

AFERTES - Formation et accompagnement dans le secteur social et médico-social
