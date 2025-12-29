// Constantes de l'application
export const CHARGES_PATRONALES = 0.42;
export const PRIME_SEGUR = 238;
export const JOURS_ANNEE = 365;

// Plan Comptable Général - Numéros de compte
export const COMPTES_IMMO = {
  bienImmo: { compte: '213', libelle: 'Constructions' },
  travaux: { compte: '213', libelle: 'Constructions (travaux)' },
  vehicule: { compte: '2182', libelle: 'Matériel de transport' },
  informatique: { compte: '2183', libelle: 'Matériel informatique' },
  mobilier: { compte: '2184', libelle: 'Mobilier' },
  fraisBancaires: { compte: '627', libelle: 'Frais bancaires (acquisition)' },
  fraisNotaire: { compte: '622', libelle: 'Frais notariés' }
};

export const COMPTES_EXPLOITATION = {
  'Alimentation': '601',
  'Carburant': '6061',
  'Assurances': '616',
  'Frais bancaires': '627',
  'Budget pédago': '6064',
  'Eau/Élec/Gaz': '606',
  'Entretien': '615',
  'Fournitures': '6064',
  'Loyer': '613',
  'Charges': '614'
};

// Valeurs par défaut
export const defaultGlobalParams = {
  augmentationAnnuelle: 2.5,
  tauxProvisionCongesPayes: 10,
  tauxProvisionGrossesReparations: 2,
  tauxProvisionCreancesDouteuses: 1,
  delaiPaiementClients: 30,
  delaiPaiementFournisseurs: 30
};

export const defaultDirection = {
  personnel: [
    { id: 1, titre: 'Directeur', etp: 1, salaire: 4500, segur: true },
    { id: 2, titre: 'Chef de Service', etp: 2, salaire: 3500, segur: true },
    { id: 3, titre: 'Secrétariat', etp: 2, salaire: 2400, segur: true },
    { id: 4, titre: 'Agent accueil', etp: 1, salaire: 2500, segur: true },
    { id: 5, titre: 'Comptable', etp: 1, salaire: 2400, segur: true }
  ],
  loyer: 2000,
  charges: 800,
  autresCharges: 500
};

export const defaultLieux = [
  {
    id: 1,
    nom: 'Lieu de Vie 1',
    enfantsParLieu: 6,
    tauxRemplissage: 95,
    investissements: {
      bienImmo: { montant: 380000, duree: 30, taux: 2.5 },
      travaux: { montant: 20000, duree: 10, taux: 2.0 },
      vehicule: { montant: 55000, duree: 5, taux: 3.0 },
      informatique: { montant: 5000, duree: 3, taux: 0 },
      mobilier: { montant: 5000, duree: 10, taux: 0 },
      fraisBancaires: { montant: 15000, duree: 15, taux: 0 },
      fraisNotaire: { montant: 28000, duree: 1, taux: 0 }
    },
    exploitation: [
      { id: 1, nom: 'Alimentation', montant: 2500 },
      { id: 2, nom: 'Carburant', montant: 1500 },
      { id: 3, nom: 'Assurances', montant: 600 },
      { id: 4, nom: 'Frais bancaires', montant: 200 },
      { id: 5, nom: 'Budget pédago', montant: 1500 },
      { id: 6, nom: 'Eau/Élec/Gaz', montant: 800 },
      { id: 7, nom: 'Entretien', montant: 250 },
      { id: 8, nom: 'Fournitures', montant: 300 }
    ],
    personnel: [
      { id: 1, titre: 'Éducateur Spécialisé', etp: 2, salaire: 3000, segur: true },
      { id: 2, titre: 'Directeur', etp: 0.2, salaire: 4500, segur: true },
      { id: 3, titre: 'Chef de service', etp: 0.4, salaire: 3500, segur: true },
      { id: 4, titre: 'Agent technique', etp: 0.1, salaire: 2400, segur: true },
      { id: 5, titre: 'IDE', etp: 0.1, salaire: 3000, segur: true },
      { id: 6, titre: 'Secrétariat', etp: 0.2, salaire: 2400, segur: true }
    ]
  }
];
