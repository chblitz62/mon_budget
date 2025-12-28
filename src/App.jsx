import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Download, Building2, Users, Landmark, Settings, Calendar, TrendingUp, DollarSign, Save, Upload, Printer } from 'lucide-react';

// Valeurs par défaut
const defaultGlobalParams = {
  augmentationAnnuelle: 2.5,
  tauxProvisionCongesPayes: 10,
  tauxProvisionGrossesReparations: 2,
  tauxProvisionCreancesDouteuses: 1,
  delaiPaiementClients: 30,
  delaiPaiementFournisseurs: 30
};

const defaultDirection = {
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

const defaultLieux = [
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

// Fonction pour charger depuis localStorage
const loadFromStorage = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const BudgetTool = () => {
  const fileInputRef = useRef(null);

  const [globalParams, setGlobalParams] = useState(() => loadFromStorage('budget_globalParams', defaultGlobalParams));
  const [direction, setDirection] = useState(() => loadFromStorage('budget_direction', defaultDirection));
  const [lieux, setLieux] = useState(() => loadFromStorage('budget_lieux', defaultLieux));

  // Sauvegarde automatique dans localStorage
  useEffect(() => {
    localStorage.setItem('budget_globalParams', JSON.stringify(globalParams));
  }, [globalParams]);

  useEffect(() => {
    localStorage.setItem('budget_direction', JSON.stringify(direction));
  }, [direction]);

  useEffect(() => {
    localStorage.setItem('budget_lieux', JSON.stringify(lieux));
  }, [lieux]);

  // Fonctions de validation des champs numériques
  const validerNombre = (valeur, min = 0, max = Infinity) => {
    const num = parseFloat(valeur);
    if (isNaN(num)) return min;
    return Math.min(Math.max(num, min), max);
  };

  const validerEntier = (valeur, min = 0, max = Infinity) => {
    const num = parseInt(valeur);
    if (isNaN(num)) return min;
    return Math.min(Math.max(num, min), max);
  };

  const validerTaux = (valeur) => validerNombre(valeur, 0, 100);
  const validerETP = (valeur) => validerNombre(valeur, 0, 50);
  const validerSalaire = (valeur) => validerEntier(valeur, 0, 50000);
  const validerMontant = (valeur) => validerEntier(valeur, 0, 10000000);
  const validerDuree = (valeur) => validerEntier(valeur, 1, 50);
  const validerJours = (valeur) => validerEntier(valeur, 0, 365);

  const CHARGES_PATRONALES = 0.42;
  const PRIME_SEGUR = 238;
  const JOURS_ANNEE = 365;

  // Plan Comptable Général - Numéros de compte
  const COMPTES_IMMO = {
    bienImmo: { compte: '213', libelle: 'Constructions' },
    travaux: { compte: '213', libelle: 'Constructions (travaux)' },
    vehicule: { compte: '2182', libelle: 'Matériel de transport' },
    informatique: { compte: '2183', libelle: 'Matériel informatique' },
    mobilier: { compte: '2184', libelle: 'Mobilier' },
    fraisBancaires: { compte: '627', libelle: 'Frais bancaires (acquisition)' },
    fraisNotaire: { compte: '622', libelle: 'Frais notariés' }
  };

  const COMPTES_EXPLOITATION = {
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

  // CALCULS
  const calculerMensualitePret = (capital, dureeAnnees, tauxAnnuel) => {
    if (tauxAnnuel === 0 || capital === 0) return 0;
    const tauxMensuel = tauxAnnuel / 100 / 12;
    const nombreMois = dureeAnnees * 12;
    const mensualite = capital * (tauxMensuel * Math.pow(1 + tauxMensuel, nombreMois)) / (Math.pow(1 + tauxMensuel, nombreMois) - 1);
    return mensualite;
  };

  const calculerSalaireAnnuel = (salaire, etp, segur) => {
    const salaireAnnuel = salaire * 12 * etp;
    const charges = salaireAnnuel * CHARGES_PATRONALES;
    const primeSegur = segur ? (PRIME_SEGUR * 1.42) * 12 * etp : 0;
    return {
      brut: salaireAnnuel,
      charges: charges,
      segur: primeSegur,
      total: salaireAnnuel + charges + primeSegur
    };
  };

  const calculerAmortissementEtInterets = (investissement) => {
    const { montant, duree, taux } = investissement;
    const amortissement = montant / duree;
    const interets = (montant * taux) / 100;
    const mensualite = calculerMensualitePret(montant, duree, taux);
    const coutTotal = mensualite * duree * 12;
    const coutCredit = coutTotal - montant;
    return { 
      amortissement, 
      interets, 
      mensualite,
      coutTotal,
      coutCredit
    };
  };

  const calculerBudgetDirection = () => {
    const detailsSalaires = direction.personnel.map(p => ({
      titre: p.titre,
      ...calculerSalaireAnnuel(p.salaire, p.etp, p.segur)
    }));
    
    const totalSalaires = detailsSalaires.reduce((sum, s) => sum + s.total, 0);
    const chargesSiege = (direction.loyer + direction.charges + direction.autresCharges) * 12;
    
    return {
      salaires: totalSalaires,
      detailsSalaires,
      chargesSiege,
      total: totalSalaires + chargesSiege
    };
  };

  const calculerBudgetLieu = (lieu) => {
    const detailsSalaires = lieu.personnel.map(p => ({
      titre: p.titre,
      etp: p.etp,
      salaire: p.salaire,
      segur: p.segur,
      ...calculerSalaireAnnuel(p.salaire, p.etp, p.segur)
    }));
    
    const salaires = detailsSalaires.reduce((sum, s) => sum + s.total, 0);
    const exploitation = lieu.exploitation.reduce((sum, item) => sum + item.montant * 12, 0);
    
    let amortissements = 0;
    let interets = 0;
    let totalInvestissements = 0;
    const detailsInvest = {};
    
    Object.entries(lieu.investissements).forEach(([key, inv]) => {
      const calc = calculerAmortissementEtInterets(inv);
      amortissements += calc.amortissement;
      interets += calc.interets;
      totalInvestissements += inv.montant;
      detailsInvest[key] = calc;
    });

    const joursAnnuels = lieu.enfantsParLieu * (lieu.tauxRemplissage / 100) * JOURS_ANNEE;
    const totalAvantAmort = salaires + exploitation + interets;
    const total = totalAvantAmort + amortissements;
    const prixJour = joursAnnuels > 0 ? total / joursAnnuels : 0;

    return {
      salaires,
      detailsSalaires,
      exploitation,
      exploitationDetails: lieu.exploitation,
      amortissements,
      interets,
      detailsInvest,
      joursAnnuels,
      total,
      prixJour,
      totalInvestissements
    };
  };

  // CALCUL DES PROVISIONS
  const calculerProvisions = () => {
    const budgetDir = calculerBudgetDirection();
    let totalSalaires = budgetDir.salaires;
    let totalInvestissements = 0;
    let chiffreAffaires = 0;
    
    lieux.forEach(l => {
      const bLieu = calculerBudgetLieu(l);
      totalSalaires += bLieu.salaires;
      totalInvestissements += bLieu.totalInvestissements;
      chiffreAffaires += bLieu.total;
    });
    
    const provisionCongesPayes = totalSalaires * (globalParams.tauxProvisionCongesPayes / 100);
    const provisionGrossesReparations = totalInvestissements * (globalParams.tauxProvisionGrossesReparations / 100);
    const provisionCreancesDouteuses = chiffreAffaires * (globalParams.tauxProvisionCreancesDouteuses / 100);
    
    return {
      congesPayes: provisionCongesPayes,
      grossesReparations: provisionGrossesReparations,
      creancesDouteuses: provisionCreancesDouteuses,
      total: provisionCongesPayes + provisionGrossesReparations + provisionCreancesDouteuses
    };
  };

  // CALCUL DU BFR (Besoin en Fonds de Roulement)
  const calculerBFR = () => {
    let chiffreAffaires = 0;
    let achatsExploitation = 0;
    
    const budgetDir = calculerBudgetDirection();
    achatsExploitation += budgetDir.chargesSiege;
    
    lieux.forEach(l => {
      const bLieu = calculerBudgetLieu(l);
      chiffreAffaires += bLieu.total;
      achatsExploitation += bLieu.exploitation;
    });
    
    // Stocks = 0 dans le secteur social (pas de stock)
    const stocks = 0;
    
    // Créances clients (délai de paiement moyen)
    const creancesClients = (chiffreAffaires / 365) * globalParams.delaiPaiementClients;
    
    // Dettes fournisseurs (délai de paiement moyen)
    const dettesFournisseurs = (achatsExploitation / 365) * globalParams.delaiPaiementFournisseurs;
    
    // BFR = Stocks + Créances - Dettes
    const bfr = stocks + creancesClients - dettesFournisseurs;
    
    // En jours de CA
    const bfrEnJours = chiffreAffaires > 0 ? (bfr / chiffreAffaires) * 365 : 0;
    
    return {
      stocks,
      creancesClients,
      dettesFournisseurs,
      bfr,
      bfrEnJours,
      chiffreAffaires
    };
  };

  const summary3Ans = [1, 2, 3].map(annee => {
    const augmentation = Math.pow(1 + globalParams.augmentationAnnuelle / 100, annee - 1);
    const budgetDir = calculerBudgetDirection();
    const budgetDirAjuste = (budgetDir.salaires + budgetDir.chargesSiege) * augmentation;
    
    let totalJoursGlobal = 0;
    lieux.forEach(l => {
      const joursLieu = l.enfantsParLieu * (l.tauxRemplissage / 100) * JOURS_ANNEE;
      totalJoursGlobal += joursLieu;
    });
    
    let totalGlobal = budgetDirAjuste;
    let totalJours = 0;
    let amortTotal = 0;
    let interetsTotal = 0;
    let detailsLieux = [];

    lieux.forEach(l => {
      const bLieu = calculerBudgetLieu(l);
      const budgetLieuAjuste = (bLieu.salaires + bLieu.exploitation) * augmentation;
      
      const proportionLieu = totalJoursGlobal > 0 ? bLieu.joursAnnuels / totalJoursGlobal : 0;
      const partSiege = budgetDirAjuste * proportionLieu;
      
      const budgetLieuTotal = budgetLieuAjuste + bLieu.amortissements + bLieu.interets + partSiege;
      
      totalGlobal += budgetLieuAjuste + bLieu.amortissements + bLieu.interets;
      totalJours += bLieu.joursAnnuels;
      amortTotal += bLieu.amortissements;
      interetsTotal += bLieu.interets;
      
      detailsLieux.push({
        nom: l.nom,
        budget: budgetLieuTotal,
        budgetSansAllocSiege: budgetLieuAjuste + bLieu.amortissements + bLieu.interets,
        partSiege: partSiege,
        proportionLieu: proportionLieu * 100,
        jours: bLieu.joursAnnuels,
        prixJour: bLieu.joursAnnuels > 0 ? budgetLieuTotal / bLieu.joursAnnuels : 0,
        prixJourSansAllocSiege: bLieu.joursAnnuels > 0 ? (budgetLieuAjuste + bLieu.amortissements + bLieu.interets) / bLieu.joursAnnuels : 0
      });
    });

    return {
      annee,
      total: totalGlobal,
      prixJour: totalJours > 0 ? totalGlobal / totalJours : 0,
      amortissements: amortTotal,
      interets: interetsTotal,
      jours: totalJours,
      budgetDirection: budgetDirAjuste,
      detailsLieux
    };
  });

  // SAUVEGARDE AU FORMAT JSON
  const sauvegarderBudget = () => {
    const budgetData = {
      version: '1.0',
      dateCreation: new Date().toISOString(),
      globalParams,
      direction,
      lieux
    };
    
    const dataStr = JSON.stringify(budgetData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // CHARGEMENT D'UN FICHIER SAUVEGARDÉ
  const chargerBudget = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const budgetData = JSON.parse(e.target.result);
        if (budgetData.globalParams) setGlobalParams(budgetData.globalParams);
        if (budgetData.direction) setDirection(budgetData.direction);
        if (budgetData.lieux) setLieux(budgetData.lieux);
        alert('Budget chargé avec succès !');
      } catch (error) {
        alert('Erreur lors du chargement du fichier');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  // IMPRESSION PROFESSIONNELLE
  const imprimerBudget = () => {
    window.print();
  };

  // EXPORT CSV
  const exporterCSV = () => {
    let csv = '\uFEFF';
    csv += 'BUDGET PRÉVISIONNEL - PROTECTION DE L\'ENFANCE\n';
    csv += `Date: ${new Date().toLocaleDateString('fr-FR')}\n\n`;
    
    csv += 'SYNTHÈSE 3 ANS\n';
    csv += 'Année,Budget Total,Budget Direction,Amortissements,Intérêts,Jours,Prix/Jour\n';
    summary3Ans.forEach(s => {
      csv += `${s.annee},${s.total.toFixed(2)},${s.budgetDirection.toFixed(2)},${s.amortissements.toFixed(2)},${s.interets.toFixed(2)},${s.jours.toFixed(0)},${s.prixJour.toFixed(2)}\n`;
    });
    
    // PROVISIONS
    const provisions = calculerProvisions();
    csv += '\n\nPROVISIONS POUR CHARGES - ANNÉE 1\n';
    csv += 'Compte,Libellé,Base de calcul,Taux,Montant annuel\n';
    csv += `151,Provision congés payés,Masse salariale,${globalParams.tauxProvisionCongesPayes}%,${provisions.congesPayes.toFixed(2)}\n`;
    csv += `152,Provision grosses réparations,Immobilisations,${globalParams.tauxProvisionGrossesReparations}%,${provisions.grossesReparations.toFixed(2)}\n`;
    csv += `416,Provision créances douteuses,Chiffre d\'affaires,${globalParams.tauxProvisionCreancesDouteuses}%,${provisions.creancesDouteuses.toFixed(2)}\n`;
    csv += `15,TOTAL PROVISIONS,,,${provisions.total.toFixed(2)}\n`;
    
    // BFR
    const bfr = calculerBFR();
    csv += '\n\nBESOIN EN FONDS DE ROULEMENT - ANNÉE 1\n';
    csv += 'Élément,Montant (€),Détail\n';
    csv += `Stocks,${bfr.stocks.toFixed(2)},Pas de stock (secteur social)\n`;
    csv += `Créances clients,${bfr.creancesClients.toFixed(2)},CA / 365 × ${globalParams.delaiPaiementClients} jours\n`;
    csv += `Dettes fournisseurs,−${bfr.dettesFournisseurs.toFixed(2)},Achats / 365 × ${globalParams.delaiPaiementFournisseurs} jours\n`;
    csv += `BFR (Besoin en Fonds de Roulement),${bfr.bfr.toFixed(2)},${bfr.bfrEnJours.toFixed(0)} jours de CA\n`;
    csv += `\nChiffre d'affaires annuel,${bfr.chiffreAffaires.toFixed(2)},\n`;
    
    csv += '\n\nDÉTAIL PAR LIEU - ANNÉE 1\n';
    csv += 'Lieu,Budget Direct,Part Siège,Budget Total,Jours,Prix/jour,Proportion\n';
    summary3Ans[0].detailsLieux.forEach(lieu => {
      csv += `${lieu.nom},${lieu.budgetSansAllocSiege.toFixed(2)},${lieu.partSiege.toFixed(2)},${lieu.budget.toFixed(2)},${lieu.jours.toFixed(0)},${lieu.prixJour.toFixed(2)},${lieu.proportionLieu.toFixed(2)}%\n`;
    });
    
    const budgetDir = calculerBudgetDirection();
    csv += '\n\nDIRECTION & SIÈGE\n';
    csv += 'Compte,Poste,ETP,Salaire Mensuel,Salaire Annuel,Charges,Prime Ségur,Total\n';
    budgetDir.detailsSalaires.forEach(s => {
      const p = direction.personnel.find(per => per.titre === s.titre);
      csv += `641,${s.titre},${p.etp},${p.salaire},${s.brut.toFixed(2)},${s.charges.toFixed(2)},${s.segur.toFixed(2)},${s.total.toFixed(2)}\n`;
    });
    csv += `\n613,Loyer,,,${direction.loyer * 12}\n`;
    csv += `614,Charges,,,${direction.charges * 12}\n`;
    csv += `606,Autres,,,${direction.autresCharges * 12}\n`;
    csv += `\nTOTAL DIRECTION,,,${budgetDir.total.toFixed(2)}\n`;
    
    lieux.forEach(lieu => {
      const bLieu = calculerBudgetLieu(lieu);
      csv += `\n\n${lieu.nom.toUpperCase()}\n`;
      csv += `Enfants: ${lieu.enfantsParLieu}, Occupation: ${lieu.tauxRemplissage}%, Jours: ${bLieu.joursAnnuels.toFixed(0)}\n\n`;
      
      csv += 'PERSONNEL\n';
      csv += 'Compte,Poste,ETP,Salaire,Brut Annuel,Charges,Ségur,Total\n';
      bLieu.detailsSalaires.forEach(s => {
        const p = lieu.personnel.find(per => per.titre === s.titre);
        csv += `641,${s.titre},${p.etp},${p.salaire},${s.brut.toFixed(2)},${s.charges.toFixed(2)},${s.segur.toFixed(2)},${s.total.toFixed(2)}\n`;
      });
      csv += `Total,,,,${bLieu.salaires.toFixed(2)}\n\n`;
      
      csv += 'EXPLOITATION\n';
      csv += 'Compte,Poste,Mensuel,Annuel\n';
      lieu.exploitation.forEach(item => {
        const compte = COMPTES_EXPLOITATION[item.nom] || '606';
        csv += `${compte},${item.nom},${item.montant},${(item.montant * 12).toFixed(2)}\n`;
      });
      csv += `Total,,,${bLieu.exploitation.toFixed(2)}\n\n`;
      
      csv += 'INVESTISSEMENTS\n';
      csv += 'Compte,Poste,Montant,Durée,Taux,Mensualité,Amortissement,Intérêts,Coût Crédit\n';
      Object.entries(lieu.investissements).forEach(([key, inv]) => {
        const calc = bLieu.detailsInvest[key];
        const compteInfo = COMPTES_IMMO[key];
        csv += `${compteInfo.compte},${compteInfo.libelle},${inv.montant},${inv.duree},${inv.taux},${calc.mensualite.toFixed(2)},${calc.amortissement.toFixed(2)},${calc.interets.toFixed(2)},${calc.coutCredit.toFixed(2)}\n`;
      });
      csv += `\nTotal amortissements,,,,,${bLieu.amortissements.toFixed(2)}\n`;
      csv += `Total intérêts,,,,,${bLieu.interets.toFixed(2)}\n`;
    });
    
    // Notes
    csv += '\n\nNOTES MÉTHODOLOGIQUES\n';
    csv += '═══════════════════════════════════════════════════════════════════\n';
    csv += '\nPROVISIONS:\n';
    csv += '- Provision congés payés: anticipation des charges liées aux congés non pris\n';
    csv += '- Provision grosses réparations: anticipation des travaux importants sur immobilisations\n';
    csv += '- Provision créances douteuses: anticipation des impayés clients\n';
    csv += '\nBFR (Besoin en Fonds de Roulement):\n';
    csv += '- Représente le besoin de trésorerie pour financer l\'activité courante\n';
    csv += '- BFR = Stocks + Créances clients - Dettes fournisseurs\n';
    csv += '- Un BFR positif signifie un besoin de financement à court terme\n';
    csv += '- Un BFR négatif signifie un excédent de trésorerie\n';
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `budget_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // EXPORT EXCEL INTERACTIF AVEC ONGLETS
  const exporterExcelInteractif = async () => {
    // Importer la bibliothèque XLSX dynamiquement
    const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
    
    const wb = XLSX.utils.book_new();
    
    // ONGLET 1: SYNTHÈSE & PARAMÈTRES MODIFIABLES
    const synthese = [
      ['BUDGET PRÉVISIONNEL - PROTECTION DE L\'ENFANCE'],
      [`Date d'édition: ${new Date().toLocaleDateString('fr-FR')}`],
      [],
      ['PARAMÈTRES GLOBAUX'],
      ['Augmentation annuelle (%)', globalParams.augmentationAnnuelle],
      ['Délai paiement clients (jours)', globalParams.delaiPaiementClients],
      ['Délai paiement fournisseurs (jours)', globalParams.delaiPaiementFournisseurs],
      [],
      ['PROVISIONS (%)'],
      ['Taux provision congés payés', globalParams.tauxProvisionCongesPayes],
      ['Taux provision grosses réparations', globalParams.tauxProvisionGrossesReparations],
      ['Taux provision créances douteuses', globalParams.tauxProvisionCreancesDouteuses],
      [],
      ['PARAMÈTRES PAR LIEU', '', 'Nombre', 'Taux', '', 'RÉSULTATS'],
      ['Lieu', '', 'd\'enfants', 'occupation %', '', 'Budget annuel', 'Jours', 'Prix/jour']
    ];
    
    lieux.forEach((lieu, idx) => {
      const bLieu = calculerBudgetLieu(lieu);
      let totalJoursGlobal = 0;
      lieux.forEach(l => {
        totalJoursGlobal += l.enfantsParLieu * (l.tauxRemplissage / 100) * JOURS_ANNEE;
      });
      const proportionLieu = totalJoursGlobal > 0 ? bLieu.joursAnnuels / totalJoursGlobal : 0;
      const partSiege = calculerBudgetDirection().total * proportionLieu;
      const budgetAvecSiege = bLieu.total + partSiege;
      const prixJourAvecSiege = bLieu.joursAnnuels > 0 ? budgetAvecSiege / bLieu.joursAnnuels : 0;
      
      synthese.push([
        lieu.nom,
        '',
        lieu.enfantsParLieu,
        lieu.tauxRemplissage,
        '',
        Math.round(budgetAvecSiege),
        Math.round(bLieu.joursAnnuels),
        Math.round(prixJourAvecSiege)
      ]);
    });
    
    synthese.push([]);
    synthese.push(['SYNTHÈSE TRIENNALE']);
    synthese.push(['Année', 'Budget Total', 'Budget Direction', 'Amortissements', 'Intérêts', 'Jours', 'Prix/Jour Global']);
    
    summary3Ans.forEach(s => {
      synthese.push([
        `Année ${s.annee}`,
        Math.round(s.total),
        Math.round(s.budgetDirection),
        Math.round(s.amortissements),
        Math.round(s.interets),
        Math.round(s.jours),
        Math.round(s.prixJour)
      ]);
    });
    
    const wsSynthese = XLSX.utils.aoa_to_sheet(synthese);
    
    // Mise en forme
    wsSynthese['!cols'] = [
      { wch: 25 }, { wch: 3 }, { wch: 12 }, { wch: 15 }, { wch: 3 }, { wch: 15 }, { wch: 10 }, { wch: 12 }
    ];
    
    XLSX.utils.book_append_sheet(wb, wsSynthese, 'Synthèse');
    
    // ONGLET 2: DIRECTION & SIÈGE
    const budgetDir = calculerBudgetDirection();
    const direction_data = [
      ['DIRECTION & SIÈGE - BUDGET DÉTAILLÉ'],
      [],
      ['PERSONNEL'],
      ['Compte', 'Poste', 'ETP', 'Salaire Mensuel', 'Salaire Annuel Brut', 'Charges Patronales (42%)', 'Prime Ségur', 'Total Annuel']
    ];
    
    budgetDir.detailsSalaires.forEach(s => {
      const p = direction.personnel.find(per => per.titre === s.titre);
      direction_data.push([
        '641',
        s.titre,
        p.etp,
        p.salaire,
        Math.round(s.brut),
        Math.round(s.charges),
        Math.round(s.segur),
        Math.round(s.total)
      ]);
    });
    
    direction_data.push(['', '', '', '', '', '', 'TOTAL SALAIRES', Math.round(budgetDir.salaires)]);
    direction_data.push([]);
    direction_data.push(['CHARGES SIÈGE']);
    direction_data.push(['Compte', 'Libellé', 'Montant Mensuel', 'Montant Annuel']);
    direction_data.push(['613', 'Loyer', direction.loyer, direction.loyer * 12]);
    direction_data.push(['614', 'Charges locatives', direction.charges, direction.charges * 12]);
    direction_data.push(['606', 'Autres charges', direction.autresCharges, direction.autresCharges * 12]);
    direction_data.push(['', '', 'TOTAL CHARGES SIÈGE', Math.round(budgetDir.chargesSiege)]);
    direction_data.push([]);
    direction_data.push(['', '', 'BUDGET TOTAL DIRECTION', Math.round(budgetDir.total)]);
    
    const wsDirection = XLSX.utils.aoa_to_sheet(direction_data);
    wsDirection['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 8 }, { wch: 18 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsDirection, 'Direction');
    
    // ONGLET PAR LIEU DE VIE
    lieux.forEach((lieu, lieuIdx) => {
      const bLieu = calculerBudgetLieu(lieu);
      
      let totalJoursGlobal = 0;
      lieux.forEach(l => {
        totalJoursGlobal += l.enfantsParLieu * (l.tauxRemplissage / 100) * JOURS_ANNEE;
      });
      const proportionLieu = totalJoursGlobal > 0 ? bLieu.joursAnnuels / totalJoursGlobal : 0;
      const partSiege = calculerBudgetDirection().total * proportionLieu;
      const budgetAvecSiege = bLieu.total + partSiege;
      const prixJourAvecSiege = bLieu.joursAnnuels > 0 ? budgetAvecSiege / bLieu.joursAnnuels : 0;
      
      const lieu_data = [
        [lieu.nom.toUpperCase()],
        [],
        ['PARAMÈTRES'],
        ['Nombre d\'enfants', lieu.enfantsParLieu],
        ['Taux d\'occupation (%)', lieu.tauxRemplissage],
        ['Jours annuels', Math.round(bLieu.joursAnnuels)],
        ['Part du budget siège', `${(proportionLieu * 100).toFixed(2)}%`],
        [],
        ['PERSONNEL'],
        ['Compte', 'Poste', 'ETP', 'Salaire Mensuel', 'Salaire Annuel Brut', 'Charges Patronales', 'Prime Ségur', 'Total Annuel']
      ];
      
      bLieu.detailsSalaires.forEach(s => {
        const p = lieu.personnel.find(per => per.titre === s.titre);
        lieu_data.push([
          '641',
          s.titre,
          p.etp,
          p.salaire,
          Math.round(s.brut),
          Math.round(s.charges),
          Math.round(s.segur),
          Math.round(s.total)
        ]);
      });
      
      lieu_data.push(['', '', '', '', '', '', 'TOTAL SALAIRES', Math.round(bLieu.salaires)]);
      lieu_data.push([]);
      lieu_data.push(['CHARGES D\'EXPLOITATION']);
      lieu_data.push(['Compte', 'Poste', 'Montant Mensuel', 'Montant Annuel']);
      
      lieu.exploitation.forEach(item => {
        const compte = COMPTES_EXPLOITATION[item.nom] || '606';
        lieu_data.push([compte, item.nom, item.montant, item.montant * 12]);
      });
      
      lieu_data.push(['', '', 'TOTAL EXPLOITATION', Math.round(bLieu.exploitation)]);
      lieu_data.push([]);
      lieu_data.push(['INVESTISSEMENTS & FINANCEMENT']);
      lieu_data.push(['Compte', 'Poste', 'Montant', 'Durée (ans)', 'Taux (%)', 'Mensualité', 'Amort. annuel', 'Intérêts annuels', 'Coût crédit']);
      
      Object.entries(lieu.investissements).forEach(([key, inv]) => {
        const calc = bLieu.detailsInvest[key];
        const compteInfo = COMPTES_IMMO[key];
        lieu_data.push([
          compteInfo.compte,
          compteInfo.libelle,
          inv.montant,
          inv.duree,
          inv.taux,
          Math.round(calc.mensualite),
          Math.round(calc.amortissement),
          Math.round(calc.interets),
          Math.round(calc.coutCredit)
        ]);
      });
      
      const totalMensualites = Object.values(bLieu.detailsInvest).reduce((sum, d) => sum + d.mensualite, 0);
      
      lieu_data.push(['', '', '', '', '', Math.round(totalMensualites), Math.round(bLieu.amortissements), Math.round(bLieu.interets), '']);
      lieu_data.push([]);
      lieu_data.push(['SYNTHÈSE BUDGÉTAIRE']);
      lieu_data.push(['Poste', 'Montant Annuel (€)']);
      lieu_data.push(['Salaires', Math.round(bLieu.salaires)]);
      lieu_data.push(['Charges d\'exploitation', Math.round(bLieu.exploitation)]);
      lieu_data.push(['Intérêts d\'emprunt', Math.round(bLieu.interets)]);
      lieu_data.push(['Dotations aux amortissements', Math.round(bLieu.amortissements)]);
      lieu_data.push(['SOUS-TOTAL LIEU', Math.round(bLieu.total)]);
      lieu_data.push(['Part budget siège allouée', Math.round(partSiege)]);
      lieu_data.push(['BUDGET TOTAL AVEC SIÈGE', Math.round(budgetAvecSiege)]);
      lieu_data.push([]);
      lieu_data.push(['Prix de journée (lieu seul)', Math.round(bLieu.prixJour)]);
      lieu_data.push(['Prix de journée (avec siège)', Math.round(prixJourAvecSiege)]);
      
      const wsLieu = XLSX.utils.aoa_to_sheet(lieu_data);
      wsLieu['!cols'] = [{ wch: 10 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
      
      const sheetName = lieu.nom.substring(0, 31); // Max 31 caractères pour nom d'onglet Excel
      XLSX.utils.book_append_sheet(wb, wsLieu, sheetName);
    });
    
    // ONGLET PROVISIONS & BFR
    const provisions = calculerProvisions();
    const bfr = calculerBFR();
    
    const provisions_data = [
      ['PROVISIONS ET TRÉSORERIE'],
      [],
      ['PROVISIONS POUR CHARGES'],
      ['Compte', 'Libellé', 'Base de calcul', 'Taux (%)', 'Montant annuel (€)'],
      ['151', 'Provision congés payés', 'Masse salariale', globalParams.tauxProvisionCongesPayes, Math.round(provisions.congesPayes)],
      ['152', 'Provision grosses réparations', 'Immobilisations', globalParams.tauxProvisionGrossesReparations, Math.round(provisions.grossesReparations)],
      ['416', 'Provision créances douteuses', 'Chiffre d\'affaires', globalParams.tauxProvisionCreancesDouteuses, Math.round(provisions.creancesDouteuses)],
      ['15', 'TOTAL PROVISIONS', '', '', Math.round(provisions.total)],
      [],
      ['BESOIN EN FONDS DE ROULEMENT (BFR)'],
      ['Élément', 'Calcul', 'Montant (€)'],
      ['Stocks', 'Pas de stock (secteur social)', Math.round(bfr.stocks)],
      ['Créances clients', `CA / 365 × ${globalParams.delaiPaiementClients} jours`, Math.round(bfr.creancesClients)],
      ['Dettes fournisseurs', `Achats / 365 × ${globalParams.delaiPaiementFournisseurs} jours`, Math.round(bfr.dettesFournisseurs)],
      ['BFR', 'Stocks + Créances - Dettes', Math.round(bfr.bfr)],
      ['BFR en jours de CA', '', Math.round(bfr.bfrEnJours)],
      [],
      ['Chiffre d\'affaires annuel', '', Math.round(bfr.chiffreAffaires)],
      [],
      ['INTERPRÉTATION'],
      [bfr.bfr > 0 ? '⚠️ BFR positif' : '✓ BFR négatif'],
      [bfr.bfr > 0 ? 'Besoin de trésorerie à prévoir' : 'Excédent de trésorerie'],
      [bfr.bfr > 0 && bfr.bfrEnJours > 30 ? 'Envisager une ligne de crédit' : '']
    ];
    
    const wsProvisions = XLSX.utils.aoa_to_sheet(provisions_data);
    wsProvisions['!cols'] = [{ wch: 30 }, { wch: 35 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsProvisions, 'Provisions & BFR');
    
    // ONGLET COMPTE DE RÉSULTAT
    const compte_resultat = [
      ['COMPTE DE RÉSULTAT PRÉVISIONNEL'],
      ['Conforme au Plan Comptable Général'],
      [],
      ['Compte', 'Poste', 'Année 1 (€)', 'Année 2 (€)', 'Année 3 (€)'],
      [],
      ['CLASSE 7 - PRODUITS']
    ];
    
    compte_resultat.push([
      '70',
      'Produits d\'exploitation',
      Math.round(summary3Ans[0].total),
      Math.round(summary3Ans[1].total),
      Math.round(summary3Ans[2].total)
    ]);
    
    compte_resultat.push([]);
    compte_resultat.push(['CLASSE 6 - CHARGES']);
    
    summary3Ans.forEach((s, i) => {
      const augmentation = Math.pow(1 + globalParams.augmentationAnnuelle / 100, i);
      const budgetDir = calculerBudgetDirection();
      let totalSalaires = budgetDir.salaires;
      let totalChargesExploitation = budgetDir.chargesSiege;
      
      lieux.forEach(l => {
        const b = calculerBudgetLieu(l);
        totalSalaires += b.salaires;
        totalChargesExploitation += b.exploitation;
      });
      
      const totalSalairesBruts = totalSalaires / 1.42;
      const totalChargesSociales = totalSalaires - totalSalairesBruts;
      
      if (i === 0) {
        compte_resultat.push([
          '641',
          'Salaires et traitements',
          Math.round(totalSalairesBruts * augmentation),
          '',
          ''
        ]);
      } else {
        compte_resultat[compte_resultat.length - 1][i + 2] = Math.round(totalSalairesBruts * augmentation);
      }
    });
    
    compte_resultat.push(['645', 'Charges sociales et patronales']);
    summary3Ans.forEach((s, i) => {
      const augmentation = Math.pow(1 + globalParams.augmentationAnnuelle / 100, i);
      const budgetDir = calculerBudgetDirection();
      let totalSalaires = budgetDir.salaires;
      
      lieux.forEach(l => {
        const b = calculerBudgetLieu(l);
        totalSalaires += b.salaires;
      });
      
      const totalChargesSociales = totalSalaires - (totalSalaires / 1.42);
      compte_resultat[compte_resultat.length - 1][i + 2] = Math.round(totalChargesSociales * augmentation);
    });
    
    compte_resultat.push(['60/61/62', 'Autres charges externes']);
    summary3Ans.forEach((s, i) => {
      const augmentation = Math.pow(1 + globalParams.augmentationAnnuelle / 100, i);
      const budgetDir = calculerBudgetDirection();
      let totalChargesExploitation = budgetDir.chargesSiege;
      
      lieux.forEach(l => {
        const b = calculerBudgetLieu(l);
        totalChargesExploitation += b.exploitation;
      });
      
      compte_resultat[compte_resultat.length - 1][i + 2] = Math.round(totalChargesExploitation * augmentation);
    });
    
    compte_resultat.push([
      '681',
      'Dotations aux amortissements',
      Math.round(summary3Ans[0].amortissements),
      Math.round(summary3Ans[1].amortissements),
      Math.round(summary3Ans[2].amortissements)
    ]);
    
    compte_resultat.push([
      '661',
      'Charges d\'intérêts',
      Math.round(summary3Ans[0].interets),
      Math.round(summary3Ans[1].interets),
      Math.round(summary3Ans[2].interets)
    ]);
    
    compte_resultat.push([]);
    compte_resultat.push([
      '6',
      'TOTAL CHARGES',
      Math.round(summary3Ans[0].total),
      Math.round(summary3Ans[1].total),
      Math.round(summary3Ans[2].total)
    ]);
    
    compte_resultat.push([]);
    compte_resultat.push([
      '',
      'RÉSULTAT D\'EXPLOITATION',
      0,
      0,
      0
    ]);
    
    compte_resultat.push([]);
    compte_resultat.push(['Note: Budget équilibré (principe du secteur social)']);
    
    const wsCompteResultat = XLSX.utils.aoa_to_sheet(compte_resultat);
    wsCompteResultat['!cols'] = [{ wch: 10 }, { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsCompteResultat, 'Compte Résultat');
    
    // ONGLET NOTES
    const notes = [
      ['NOTES MÉTHODOLOGIQUES ET AVERTISSEMENTS'],
      [],
      ['CONVENTIONS COMPTABLES'],
      ['1. Référentiel: Plan Comptable Général (PCG) en vigueur'],
      ['2. Charges patronales: 42% du salaire brut'],
      ['3. Prime Ségur: 238€/mois chargée à 42% = 338€/mois'],
      ['4. Amortissements: Linéaire (montant / durée)'],
      ['5. Intérêts: Calculés sur capital total (simplification)'],
      ['6. Mensualités: Formule des prêts amortissables'],
      [`7. Augmentation annuelle: ${globalParams.augmentationAnnuelle}% (salaires et exploitation)`],
      [],
      ['PROVISIONS'],
      ['- Provision congés payés: anticipation charges liées aux congés non pris'],
      ['- Provision grosses réparations: anticipation travaux importants'],
      ['- Provision créances douteuses: anticipation impayés clients'],
      [],
      ['BESOIN EN FONDS DE ROULEMENT (BFR)'],
      ['- BFR = Stocks + Créances clients - Dettes fournisseurs'],
      ['- BFR positif = besoin de trésorerie à court terme'],
      ['- BFR négatif = excédent de trésorerie'],
      [],
      ['RÉPARTITION BUDGET SIÈGE'],
      ['- Méthode: répartition proportionnelle selon jours d\'occupation'],
      ['- Formule: Part lieu = (Jours lieu / Total jours) × Budget siège'],
      [],
      ['AVERTISSEMENTS'],
      ['⚠️ Document prévisionnel à valider par expert-comptable'],
      ['⚠️ Calcul intérêts simplifié (capital constant)'],
      ['⚠️ Vérifier conformité avec votre financeur'],
      ['⚠️ Actualiser régulièrement les données'],
      [],
      [`Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`],
      ['Outil: Budget Prévisionnel Protection de l\'Enfance']
    ];
    
    const wsNotes = XLSX.utils.aoa_to_sheet(notes);
    wsNotes['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsNotes, 'Notes');
    
    // Générer et télécharger le fichier
    XLSX.writeFile(wb, `Budget_Previsionnel_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .lieu-page { page-break-after: always; }
          .print-page-break { page-break-after: always; }
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="bg-white rounded-3xl shadow-lg border p-6 mb-6 no-print">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="AFERTES" className="h-12" />
              <div>
                <h1 className="text-3xl font-black text-slate-800">Budget Prévisionnel</h1>
                <p className="text-slate-500 text-sm">Protection de l'Enfance - Projection sur 3 ans</p>
              </div>
            </div>
            <div className="flex gap-3 items-center flex-wrap">
              <div className="bg-teal-50 px-4 py-2 rounded-xl border border-teal-200">
                <span className="text-xs font-bold text-teal-600 uppercase">Augmentation annuelle</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    className="bg-transparent font-black text-xl text-teal-700 outline-none w-16"
                    value={globalParams.augmentationAnnuelle}
                    onChange={(e) => setGlobalParams({...globalParams, augmentationAnnuelle: validerTaux(e.target.value)})}
                  />
                  <TrendingUp className="text-teal-500" size={20} />
                </div>
              </div>
              
              <button 
                onClick={sauvegarderBudget} 
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-xl transition-all"
              >
                <Save size={18} /> SAUVEGARDER
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={chargerBudget}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-xl transition-all"
              >
                <Upload size={18} /> CHARGER
              </button>
              
              <button 
                onClick={imprimerBudget} 
                className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-xl transition-all"
              >
                <Printer size={18} /> IMPRIMER
              </button>
              
              <button
                onClick={exporterExcelInteractif}
                className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-xl transition-all"
              >
                <Download size={18} /> EXPORT EXCEL
              </button>
            </div>
          </div>
        </div>

        {/* Provisions et BFR */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Provisions pour charges */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl shadow-lg border-2 border-orange-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-500 p-3 rounded-xl">
                <Settings className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-orange-900">Provisions pour Charges</h2>
                <p className="text-xs text-orange-700">Comptes 15x - Anticipation des risques</p>
              </div>
            </div>
            
            {(() => {
              const provisions = calculerProvisions();
              return (
                <>
                  <div className="space-y-3 mb-4">
                    <div className="bg-white p-3 rounded-xl flex justify-between items-center">
                      <div>
                        <div className="text-xs font-bold text-orange-600">Compte 151</div>
                        <div className="text-sm font-bold text-slate-700">Provision congés payés</div>
                        <div className="text-xs text-slate-500">
                          <input 
                            type="number"
                            step="0.5"
                            className="w-16 bg-orange-50 rounded px-2 py-1 font-bold text-center"
                            value={globalParams.tauxProvisionCongesPayes}
                            onChange={(e) => setGlobalParams({...globalParams, tauxProvisionCongesPayes: validerTaux(e.target.value)})}
                          />
                          % de la masse salariale
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-orange-700">{Math.round(provisions.congesPayes).toLocaleString()} €</div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-xl flex justify-between items-center">
                      <div>
                        <div className="text-xs font-bold text-orange-600">Compte 152</div>
                        <div className="text-sm font-bold text-slate-700">Provision grosses réparations</div>
                        <div className="text-xs text-slate-500">
                          <input 
                            type="number"
                            step="0.5"
                            className="w-16 bg-orange-50 rounded px-2 py-1 font-bold text-center"
                            value={globalParams.tauxProvisionGrossesReparations}
                            onChange={(e) => setGlobalParams({...globalParams, tauxProvisionGrossesReparations: validerTaux(e.target.value)})}
                          />
                          % des immobilisations
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-orange-700">{Math.round(provisions.grossesReparations).toLocaleString()} €</div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-xl flex justify-between items-center">
                      <div>
                        <div className="text-xs font-bold text-orange-600">Compte 416</div>
                        <div className="text-sm font-bold text-slate-700">Provision créances douteuses</div>
                        <div className="text-xs text-slate-500">
                          <input 
                            type="number"
                            step="0.1"
                            className="w-16 bg-orange-50 rounded px-2 py-1 font-bold text-center"
                            value={globalParams.tauxProvisionCreancesDouteuses}
                            onChange={(e) => setGlobalParams({...globalParams, tauxProvisionCreancesDouteuses: validerTaux(e.target.value)})}
                          />
                          % du chiffre d'affaires
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-orange-700">{Math.round(provisions.creancesDouteuses).toLocaleString()} €</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">TOTAL PROVISIONS ANNUEL</span>
                      <span className="text-2xl font-black">{Math.round(provisions.total).toLocaleString()} €</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* BFR */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl shadow-lg border-2 border-blue-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500 p-3 rounded-xl">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-blue-900">Besoin en Fonds de Roulement</h2>
                <p className="text-xs text-blue-700">Trésorerie nécessaire pour l'activité</p>
              </div>
            </div>
            
            {(() => {
              const bfr = calculerBFR();
              return (
                <>
                  <div className="space-y-3 mb-4">
                    <div className="bg-white p-3 rounded-xl">
                      <div className="text-xs font-bold text-blue-600 mb-2">Paramètres de paiement</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-600 block mb-1">Délai clients (jours)</label>
                          <input 
                            type="number"
                            className="w-full bg-blue-50 rounded px-3 py-2 font-bold text-center"
                            value={globalParams.delaiPaiementClients}
                            onChange={(e) => setGlobalParams({...globalParams, delaiPaiementClients: validerJours(e.target.value)})}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-600 block mb-1">Délai fournisseurs (jours)</label>
                          <input 
                            type="number"
                            className="w-full bg-blue-50 rounded px-3 py-2 font-bold text-center"
                            value={globalParams.delaiPaiementFournisseurs}
                            onChange={(e) => setGlobalParams({...globalParams, delaiPaiementFournisseurs: validerJours(e.target.value)})}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-xl flex justify-between items-center">
                      <div className="text-sm font-bold text-slate-700">+ Stocks</div>
                      <div className="text-lg font-black text-slate-600">{Math.round(bfr.stocks).toLocaleString()} €</div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-xl flex justify-between items-center">
                      <div className="text-sm font-bold text-slate-700">+ Créances clients</div>
                      <div className="text-lg font-black text-teal-600">{Math.round(bfr.creancesClients).toLocaleString()} €</div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-xl flex justify-between items-center">
                      <div className="text-sm font-bold text-slate-700">− Dettes fournisseurs</div>
                      <div className="text-lg font-black text-red-600">−{Math.round(bfr.dettesFournisseurs).toLocaleString()} €</div>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl ${bfr.bfr > 0 ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-gradient-to-r from-teal-600 to-cyan-600'} text-white`}>
                    <div className="text-sm font-bold mb-1">BESOIN EN FONDS DE ROULEMENT</div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-2xl font-black">{Math.round(bfr.bfr).toLocaleString()} €</div>
                        <div className="text-xs opacity-90">soit {Math.round(bfr.bfrEnJours)} jours de CA</div>
                      </div>
                      <div className="text-right">
                        {bfr.bfr > 0 ? (
                          <div className="text-xs">⚠️ Trésorerie à prévoir</div>
                        ) : (
                          <div className="text-xs">✓ Excédent de trésorerie</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-blue-100 border-l-4 border-blue-500 p-3 rounded">
                    <p className="text-xs text-blue-800">
                      <strong>💡 Conseil :</strong> Un BFR positif signifie que vous devez disposer de cette trésorerie pour financer votre activité courante. 
                      {bfr.bfr > 0 && bfr.bfrEnJours > 30 && ' Un BFR élevé peut nécessiter une ligne de crédit de trésorerie.'}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Synthèse 3 ans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print-page-break">
          {summary3Ans.map(s => (
            <div key={s.annee} className="bg-gradient-to-br from-white to-cyan-50 p-6 rounded-3xl shadow-lg border-2 border-teal-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-black text-teal-400 uppercase tracking-wider">Année {s.annee}</span>
                <Calendar className="text-teal-300" size={22} />
              </div>
              <div className="text-3xl font-black text-slate-800 mb-2">
                {Math.round(s.prixJour)} € <span className="text-base font-medium text-slate-400">/ jour</span>
              </div>
              <div className="text-sm text-slate-600 space-y-1 mb-4">
                <div className="flex justify-between">
                  <span>Budget Total:</span>
                  <span className="font-bold">{Math.round(s.total).toLocaleString()} €</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>dont Direction:</span>
                  <span className="font-bold text-slate-600">{Math.round(s.budgetDirection).toLocaleString()} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Jours:</span>
                  <span className="font-bold">{Math.round(s.jours).toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-teal-200">
                <div className="text-xs font-black text-slate-600 uppercase mb-3">Détail par lieu</div>
                <div className="space-y-2">
                  {s.detailsLieux.map(l => (
                    <div key={l.nom} className="bg-white/60 p-2 rounded-lg">
                      <div className="font-bold text-slate-700 text-sm mb-1">{l.nom}</div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Prix/jour (avec siège):</span>
                        <span className="font-black text-teal-700">{Math.round(l.prixJour)} €</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Part siège ({l.proportionLieu.toFixed(1)}%):</span>
                        <span className="font-bold">{Math.round(l.partSiege).toLocaleString()} €</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Budget total:</span>
                        <span className="font-bold">{Math.round(l.budget).toLocaleString()} €</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Jours:</span>
                        <span className="font-bold">{Math.round(l.jours).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Direction & Siège */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 text-white rounded-3xl p-8 mb-8 shadow-xl print-page-break">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <Building2 className="text-teal-400" size={28} /> Direction & Siège
            </h2>
            <div className="flex gap-2 no-print">
              <button 
                onClick={() => setDirection({...direction, personnel: [...direction.personnel, { id: Date.now(), titre: 'Nouveau poste', etp: 1, salaire: 2500, segur: true }]})}
                className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-all"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <label className="text-xs font-bold text-teal-300 uppercase block mb-1">Compte 613</label>
              <label className="text-xs font-bold text-teal-200 block mb-2">Loyer mensuel</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  className="bg-white/20 text-white font-bold text-lg px-3 py-2 rounded-lg w-full outline-none"
                  value={direction.loyer}
                  onChange={(e) => setDirection({...direction, loyer: validerMontant(e.target.value)})}
                />
                <DollarSign className="text-teal-300" size={20} />
              </div>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <label className="text-xs font-bold text-teal-300 uppercase block mb-1">Compte 614</label>
              <label className="text-xs font-bold text-teal-200 block mb-2">Charges mensuelles</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  className="bg-white/20 text-white font-bold text-lg px-3 py-2 rounded-lg w-full outline-none"
                  value={direction.charges}
                  onChange={(e) => setDirection({...direction, charges: validerMontant(e.target.value)})}
                />
                <DollarSign className="text-teal-300" size={20} />
              </div>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <label className="text-xs font-bold text-teal-300 uppercase block mb-1">Compte 606</label>
              <label className="text-xs font-bold text-teal-200 block mb-2">Autres charges</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  className="bg-white/20 text-white font-bold text-lg px-3 py-2 rounded-lg w-full outline-none"
                  value={direction.autresCharges}
                  onChange={(e) => setDirection({...direction, autresCharges: validerMontant(e.target.value)})}
                />
                <DollarSign className="text-teal-300" size={20} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {direction.personnel.map(p => (
              <div key={p.id} className="bg-white/10 p-4 rounded-2xl relative group border border-white/5 backdrop-blur-sm hover:bg-white/15 transition-all">
                <button 
                  onClick={() => setDirection({...direction, personnel: direction.personnel.filter(per => per.id !== p.id)})}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg no-print"
                >
                  <Trash2 size={14} />
                </button>
                <div className="text-[9px] font-bold text-teal-300 mb-2">Compte 641</div>
                <input 
                  className="bg-transparent font-bold text-sm border-b border-white/30 w-full mb-3 outline-none pb-1"
                  value={p.titre}
                  onChange={(e) => setDirection({...direction, personnel: direction.personnel.map(per => per.id === p.id ? {...per, titre: e.target.value} : per)})}
                />
                <div className="text-xs space-y-2 opacity-90">
                  <div className="flex justify-between items-center">
                    <span>ETP:</span>
                    <input 
                      type="number" 
                      step="0.1" 
                      className="bg-white/20 w-16 rounded px-2 py-1 text-center font-bold" 
                      value={p.etp} 
                      onChange={(e) => setDirection({...direction, personnel: direction.personnel.map(per => per.id === p.id ? {...per, etp: validerETP(e.target.value)} : per)})}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Salaire:</span>
                    <input 
                      type="number" 
                      className="bg-white/20 w-20 rounded px-2 py-1 text-center font-bold" 
                      value={p.salaire} 
                      onChange={(e) => setDirection({...direction, personnel: direction.personnel.map(per => per.id === p.id ? {...per, salaire: validerSalaire(e.target.value)} : per)})}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Ségur:</span>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded" 
                      checked={p.segur} 
                      onChange={(e) => setDirection({...direction, personnel: direction.personnel.map(per => per.id === p.id ? {...per, segur: e.target.checked} : per)})}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="text-right">
              <span className="text-sm text-teal-300">Budget Direction Annuel:</span>
              <span className="text-2xl font-black ml-3">{Math.round(calculerBudgetDirection().total).toLocaleString()} €</span>
            </div>
          </div>
        </div>

        {/* Lieux de vie */}
        <div className="space-y-8">
          {lieux.map((lieu, lieuIndex) => {
            const budgetLieu = calculerBudgetLieu(lieu);
            
            let totalJoursGlobal = 0;
            lieux.forEach(l => {
              const jours = l.enfantsParLieu * (l.tauxRemplissage / 100) * JOURS_ANNEE;
              totalJoursGlobal += jours;
            });
            const proportionLieu = totalJoursGlobal > 0 ? budgetLieu.joursAnnuels / totalJoursGlobal : 0;
            const partSiege = calculerBudgetDirection().total * proportionLieu;
            const budgetAvecSiege = budgetLieu.total + partSiege;
            const prixJourAvecSiege = budgetLieu.joursAnnuels > 0 ? budgetAvecSiege / budgetLieu.joursAnnuels : 0;
            
            return (
              <div key={lieu.id} className="bg-white rounded-3xl shadow-lg border-2 border-slate-100 p-8 hover:shadow-xl transition-all lieu-page">
                <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                  <div className="flex items-center gap-4">
                    <input 
                      className="text-2xl font-black text-slate-800 outline-none border-b-2 border-transparent focus:border-teal-500 transition-all"
                      value={lieu.nom}
                      onChange={(e) => setLieux(lieux.map(l => l.id === lieu.id ? {...l, nom: e.target.value} : l))}
                    />
                    <div className="flex gap-2 flex-wrap">
                      <span className="bg-teal-100 text-teal-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                        {Math.round(prixJourAvecSiege)} € / jour
                      </span>
                      <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                        {Math.round(budgetAvecSiege).toLocaleString()} € / an
                      </span>
                      <span className="bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold shadow-sm">
                        Siège: {Math.round(partSiege).toLocaleString()} € ({(proportionLieu * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setLieux(lieux.filter(l => l.id !== lieu.id))}
                    className="text-red-400 p-2 hover:bg-red-50 rounded-xl transition-all no-print"
                  >
                    <Trash2 size={22} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-2xl border border-blue-200">
                    <label className="text-xs font-black text-blue-600 uppercase block mb-2">Nombre d'enfants</label>
                    <input 
                      type="number"
                      className="bg-white text-blue-700 font-black text-2xl px-4 py-2 rounded-xl w-full outline-none shadow-sm"
                      value={lieu.enfantsParLieu}
                      onChange={(e) => setLieux(lieux.map(l => l.id === lieu.id ? {...l, enfantsParLieu: validerEntier(e.target.value, 1, 20)} : l))}
                    />
                  </div>
                  <div className="bg-gradient-to-r from-teal-50 to-pink-50 p-4 rounded-2xl border border-teal-200">
                    <label className="text-xs font-black text-slate-600 uppercase block mb-2">Taux d'occupation (%)</label>
                    <input 
                      type="number"
                      className="bg-white text-slate-700 font-black text-2xl px-4 py-2 rounded-xl w-full outline-none shadow-sm"
                      value={lieu.tauxRemplissage}
                      onChange={(e) => setLieux(lieux.map(l => l.id === lieu.id ? {...l, tauxRemplissage: validerTaux(e.target.value)} : l))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Investissements */}
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-3xl border border-slate-200">
                    <h3 className="text-sm font-black text-slate-600 uppercase mb-4 flex items-center gap-2">
                      <Landmark size={18} className="text-slate-400" /> Investissements & Prêts
                    </h3>
                    <div className="space-y-4 overflow-y-auto max-h-[450px] pr-2">
                      {Object.entries(lieu.investissements).map(([key, inv]) => {
                        const calc = budgetLieu.detailsInvest[key];
                        const compteInfo = COMPTES_IMMO[key];
                        return (
                          <div key={key} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <div className="text-[9px] font-bold text-teal-600 uppercase">Compte {compteInfo.compte}</div>
                                <div className="text-xs font-bold text-slate-700">{compteInfo.libelle}</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                              <div>
                                <label className="text-[9px] text-slate-500 block">Montant</label>
                                <input 
                                  type="number"
                                  className="w-full text-xs font-bold bg-slate-50 rounded px-2 py-1 outline-none"
                                  value={inv.montant}
                                  onChange={(e) => setLieux(lieux.map(l => l.id === lieu.id ? { ...l, investissements: {...l.investissements, [key]: {...inv, montant: validerMontant(e.target.value)}}} : l))}
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-slate-500 block">Durée (ans)</label>
                                <input 
                                  type="number"
                                  className="w-full text-xs font-bold bg-slate-50 rounded px-2 py-1 outline-none"
                                  value={inv.duree}
                                  onChange={(e) => setLieux(lieux.map(l => l.id === lieu.id ? { ...l, investissements: {...l.investissements, [key]: {...inv, duree: validerDuree(e.target.value)}}} : l))}
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-slate-500 block">Taux %</label>
                                <input 
                                  type="number"
                                  step="0.1"
                                  className="w-full text-xs font-bold bg-slate-50 rounded px-2 py-1 outline-none"
                                  value={inv.taux}
                                  onChange={(e) => setLieux(lieux.map(l => l.id === lieu.id ? { ...l, investissements: {...l.investissements, [key]: {...inv, taux: validerTaux(e.target.value)}}} : l))}
                                />
                              </div>
                            </div>
                            {calc.mensualite > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-200 space-y-1">
                                <div className="flex items-center justify-between bg-teal-50 px-2 py-1 rounded">
                                  <span className="text-[10px] font-bold text-slate-700">💳 Mensualité:</span>
                                  <span className="font-black text-slate-700 text-sm">{Math.round(calc.mensualite)} €/mois</span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-slate-600">Coût crédit:</span>
                                  <span className="font-bold text-orange-600">{Math.round(calc.coutCredit).toLocaleString()} €</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-600">Amortissements/an:</span>
                        <span className="text-slate-800">{Math.round(budgetLieu.amortissements).toLocaleString()} €</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-600">Intérêts/an:</span>
                        <span className="text-red-600">{Math.round(budgetLieu.interets).toLocaleString()} €</span>
                      </div>
                      <div className="bg-gradient-to-r from-slate-50 to-cyan-50 p-3 rounded-xl border-2 border-teal-200 mt-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-[10px] font-bold text-teal-600 uppercase">Total mensualités</div>
                            <div className="text-[9px] text-slate-500">Tous prêts confondus</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-black text-slate-700">{Math.round(Object.values(budgetLieu.detailsInvest).reduce((sum, d) => sum + d.mensualite, 0)).toLocaleString()}</div>
                            <div className="text-xs font-bold text-teal-600">€ / mois</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Exploitation */}
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-3xl border border-teal-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-black text-teal-700 uppercase flex items-center gap-2">
                        <Settings size={18} /> Exploitation (mensuel)
                      </h3>
                      <button 
                        onClick={() => setLieux(lieux.map(l => l.id === lieu.id ? { ...l, exploitation: [...l.exploitation, { id: Date.now(), nom: 'Nouveau poste', montant: 0 }]} : l))}
                        className="bg-teal-600 text-white p-1.5 rounded-lg hover:bg-teal-700 transition-all shadow-sm no-print"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
                      {lieu.exploitation.map(item => {
                        const numCompte = COMPTES_EXPLOITATION[item.nom] || '606';
                        return (
                          <div key={item.id} className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm group relative">
                            <button 
                              onClick={() => setLieux(lieux.map(l => l.id === lieu.id ? {...l, exploitation: l.exploitation.filter(e => e.id !== item.id)} : l))}
                              className="absolute -top-1 -left-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 no-print"
                            >
                              <Trash2 size={10} />
                            </button>
                            <div className="flex-1">
                              <div className="text-[9px] font-bold text-teal-600 mb-1">Compte {numCompte}</div>
                              <input 
                                className="w-full text-xs font-bold text-slate-600 bg-transparent outline-none border-b border-teal-100 pb-1"
                                value={item.nom}
                                onChange={(e) => setLieux(lieux.map(l => l.id === lieu.id ? { ...l, exploitation: l.exploitation.map(exp => exp.id === item.id ? {...exp, nom: e.target.value} : exp)} : l))}
                              />
                            </div>
                            <input 
                              type="number"
                              className="w-24 text-right text-xs font-black bg-teal-50 rounded-lg px-2 py-1 outline-none"
                              value={item.montant}
                              onChange={(e) => setLieux(lieux.map(l => l.id === lieu.id ? { ...l, exploitation: l.exploitation.map(exp => exp.id === item.id ? {...exp, montant: validerMontant(e.target.value)} : exp)} : l))}
                            />
                            <span className="text-xs text-slate-400">€/mois</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-teal-200">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-teal-700">Total/an:</span>
                        <span className="text-teal-800">{Math.round(budgetLieu.exploitation).toLocaleString()} €</span>
                      </div>
                    </div>
                  </div>

                  {/* Équipe */}
                  <div className="bg-gradient-to-br from-slate-50 to-cyan-50 p-6 rounded-3xl border border-teal-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-black text-slate-700 uppercase flex items-center gap-2">
                        <Users size={18} /> Équipe
                      </h3>
                      <button 
                        onClick={() => setLieux(lieux.map(l => l.id === lieu.id ? { ...l, personnel: [...l.personnel, { id: Date.now(), titre: 'Nouveau', etp: 1, salaire: 2000, segur: true }]} : l))}
                        className="bg-slate-700 text-white p-1.5 rounded-lg hover:bg-slate-800 transition-all shadow-sm no-print"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
                      {lieu.personnel.map(p => (
                        <div key={p.id} className="bg-white p-3 rounded-xl shadow-sm border border-teal-100 group relative hover:shadow-md transition-all">
                          <button 
                            onClick={() => setLieux(lieux.map(l => l.id === lieu.id ? {...l, personnel: l.personnel.filter(per => per.id !== p.id)} : l))}
                            className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity no-print"
                          >
                            <Trash2 size={10} />
                          </button>
                          <div className="text-[9px] font-bold text-teal-600 mb-1">Compte 641</div>
                          <input 
                            className="font-bold text-sm w-full mb-2 outline-none border-b border-teal-100 pb-1" 
                            value={p.titre} 
                            onChange={(e) => setLieux(lieux.map(l => l.id === lieu.id ? {...l, personnel: l.personnel.map(per => per.id === p.id ? {...per, titre: e.target.value} : per)} : l))}
                          />
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="text-[9px] text-slate-500 block">ETP</label>
                              <input 
                                type="number" 
                                step="0.1" 
                                className="w-full bg-teal-50 rounded px-2 py-1 font-bold" 
                                value={p.etp} 
                                onChange={(e) => setLieux(lieux.map(l => l.id === lieu.id ? {...l, personnel: l.personnel.map(per => per.id === p.id ? {...per, etp: validerETP(e.target.value)} : per)} : l))}
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-500 block">Salaire</label>
                              <input 
                                type="number" 
                                className="w-full bg-teal-50 rounded px-2 py-1 font-bold" 
                                value={p.salaire} 
                                onChange={(e) => setLieux(lieux.map(l => l.id === lieu.id ? {...l, personnel: l.personnel.map(per => per.id === p.id ? {...per, salaire: validerSalaire(e.target.value)} : per)} : l))}
                              />
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="text-slate-500">Prime Ségur</span>
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded" 
                              checked={p.segur} 
                              onChange={(e) => setLieux(lieux.map(l => l.id === lieu.id ? {...l, personnel: l.personnel.map(per => per.id === p.id ? {...per, segur: e.target.checked} : per)} : l))}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-teal-200">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-slate-700">Masse salariale:</span>
                        <span className="text-slate-800">{Math.round(budgetLieu.salaires).toLocaleString()} €</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Bouton ajouter lieu */}
        <button 
          onClick={() => {
            const nouveauLieu = {
              ...lieux[0],
              id: Date.now(),
              nom: `Lieu de Vie ${lieux.length + 1}`,
              personnel: lieux[0].personnel.map(p => ({...p, id: Date.now() + Math.random()})),
              exploitation: lieux[0].exploitation.map(e => ({...e, id: Date.now() + Math.random()}))
            };
            setLieux([...lieux, nouveauLieu]);
          }}
          className="w-full mt-8 py-5 border-2 border-dashed border-teal-300 rounded-3xl text-teal-500 font-black text-lg hover:bg-gradient-to-r hover:from-slate-50 hover:to-cyan-50 hover:border-teal-400 transition-all flex items-center justify-center gap-3 shadow-sm no-print"
        >
          <Plus size={24} /> AJOUTER UN NOUVEAU LIEU DE VIE
        </button>
      </div>
    </div>
  );
};

export default BudgetTool;
