import React, { useState, useRef } from 'react';
import { Plus, Trash2, Download, Building2, Users, Landmark, Settings, Calendar, TrendingUp, DollarSign, Save, Upload, Printer } from 'lucide-react';

const BudgetTool = () => {
  const fileInputRef = useRef(null);
  
  const [globalParams, setGlobalParams] = useState({
    augmentationAnnuelle: 2.5
  });

  const [direction, setDirection] = useState({
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
  });

  const [lieux, setLieux] = useState([
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
  ]);

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
    const detailsInvest = {};
    
    Object.entries(lieu.investissements).forEach(([key, inv]) => {
      const calc = calculerAmortissementEtInterets(inv);
      amortissements += calc.amortissement;
      interets += calc.interets;
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
      prixJour
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

  // EXPORT EXCEL
  const exporterExcel = () => {
    let csv = '\uFEFF';
    csv += 'BUDGET PRÉVISIONNEL - PROTECTION DE L\'ENFANCE\n';
    csv += `Date: ${new Date().toLocaleDateString('fr-FR')}\n\n`;
    
    csv += 'SYNTHÈSE 3 ANS\n';
    csv += 'Année,Budget Total,Budget Direction,Amortissements,Intérêts,Jours,Prix/Jour\n';
    summary3Ans.forEach(s => {
      csv += `${s.annee},${s.total.toFixed(2)},${s.budgetDirection.toFixed(2)},${s.amortissements.toFixed(2)},${s.interets.toFixed(2)},${s.jours.toFixed(0)},${s.prixJour.toFixed(2)}\n`;
    });
    
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
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `budget_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-8">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .lieu-page { page-break-after: always; }
          .print-page-break { page-break-after: always; }
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto">
        
        <div className="bg-white rounded-3xl shadow-lg border p-6 mb-6 no-print">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-800">Budget Prévisionnel</h1>
              <p className="text-slate-500 text-sm">Protection de l'Enfance - Projection sur 3 ans</p>
            </div>
            <div className="flex gap-3 items-center flex-wrap">
              <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                <span className="text-xs font-bold text-emerald-600 uppercase">Augmentation annuelle</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    step="0.1"
                    className="bg-transparent font-black text-xl text-emerald-700 outline-none w-16"
                    value={globalParams.augmentationAnnuelle}
                    onChange={(e) => setGlobalParams({...globalParams, augmentationAnnuelle: parseFloat(e.target.value) || 0})}
                  />
                  <TrendingUp className="text-emerald-400" size={20} />
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
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-xl transition-all"
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
                onClick={exporterExcel} 
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-xl transition-all"
              >
                <Download size={18} /> EXPORT EXCEL
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print-page-break">
          {summary3Ans.map(s => (
            <div key={s.annee} className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-3xl shadow-lg border-2 border-indigo-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-black text-indigo-400 uppercase tracking-wider">Année {s.annee}</span>
                <Calendar className="text-indigo-300" size={22} />
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
                  <span className="font-bold text-purple-600">{Math.round(s.budgetDirection).toLocaleString()} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Jours:</span>
                  <span className="font-bold">{Math.round(s.jours).toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-indigo-200">
                <div className="text-xs font-black text-slate-600 uppercase mb-3">Détail par lieu</div>
                <div className="space-y-2">
                  {s.detailsLieux.map(l => (
                    <div key={l.nom} className="bg-white/60 p-2 rounded-lg">
                      <div className="font-bold text-slate-700 text-sm mb-1">{l.nom}</div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Prix/jour (avec siège):</span>
                        <span className="font-black text-emerald-700">{Math.round(l.prixJour)} €</span>
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

        <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white rounded-3xl p-8 mb-8 shadow-xl print-page-break">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <Building2 className="text-indigo-400" size={28} /> Direction & Siège
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
              <label className="text-xs font-bold text-indigo-300 uppercase block mb-1">Compte 613</label>
              <label className="text-xs font-bold text-indigo-200 block mb-2">Loyer mensuel</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  className="bg-white/20 text-white font-bold text-lg px-3 py-2 rounded-lg w-full outline-none"
                  value={direction.loyer}
                  onChange={(e) => setDirection({...direction, loyer: parseInt(e.target.value) || 0})}
                />
                <DollarSign className="text-indigo-300" size={20} />
              </div>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <label className="text-xs font-bold text-indigo-300 uppercase block mb-1">Compte 614</label>
              <label className="text-xs font-bold text-indigo-200 block mb-2">Charges mensuelles</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  className="bg-white/20 text-white font-bold text-lg px-3 py-2 rounded-lg w-full outline-none"
                  value={direction.charges}
                  onChange={(e) => setDirection({...direction, charges: parseInt(e.target.value) || 0})}
                />
                <DollarSign className="text-indigo-300" size={20} />
              </div>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <label className="text-xs font-bold text-indigo-300 uppercase block mb-1">Compte 606</label>
              <label className="text-xs font-bold text-indigo-200 block mb-2">Autres charges</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  className="bg-white/20 text-white font-bold text-lg px-3 py-2 rounded-lg w-full outline-none"
                  value={direction.autresCharges}
                  onChange={(e) => setDirection({...direction, autresCharges: parseInt(e.target.value) || 0})}
                />
                <DollarSign className="text-indigo-300" size={20} />
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
                <div className="text-[9px] font-bold text-indigo-300 mb-2">Compte 641</div>
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
                      onChange={(e) => setDirection({...direction, personnel: direction.personnel.map(per => per.id === p.id ? {...per, etp: parseFloat(e.target.value) || 0} : per)})}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Salaire:</span>
                    <input 
                      type="number" 
                      className="bg-white/20 w-20 rounded px-2 py-1 text-center font-bold" 
                      value={p.salaire} 
                      onChange={(e) => setDirection({...direction, personnel: direction.personnel.map(per => per.id === p.id ? {...per, salaire: parseInt(e.target.value) || 0} : per)})}
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
              <span className="text-sm text-indigo-300">Budget Direction Annuel:</span>
              <span className="text-2xl font-black ml-3">{Math.round(calculerBudgetDirection().total).toLocaleString()} €</span>
            </div>
          </div>
        </div>

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
                      className="text-2xl font-black text-slate-800 outline-none border-b-2 border-transparent focus:border-indigo-500 transition-all"
                      value={lieu.nom}
                      onChange={(e) => setLieux(lieux.map(l => l.id === lieu.id ? {...l, nom: e.target.value} : l))}
                    />
                    <div className="flex gap-2 flex-wrap">
                      <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                        {Math.round(prixJourAvecSiege)} € / jour
                      </span>
                      <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                        {Math.round(budgetAvecSiege).toLocaleString()} € / an
                      </span>
                      <span className="bg-purple-100 text-purple-700 px-3 py-2 rounded-xl text-xs font-bold shadow-sm">
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
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200">
                    <label className="text-xs font-black text-blue-600 uppercase block mb-2">Nombre d'enfants</label>
                    <input 
                      type="number"
                      className="bg-white text-blue-700 font-black text-2xl px-4 py-2 rounded-xl w-full outline-none shadow-sm"
                      value={lieu.enfantsParLieu}
                      onChange={(e) => setLieux(lieux.map(l => l.id === lieu.id ? {...l, enfantsParLieu: parseInt(e.target.value) || 0} : l))}
                    />
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-200">
                    <label className="text-xs font-black text-purple-600 uppercase block mb-2">Taux d'occupation (%)</label>
                    <input 
                      type="number"
                      className="bg-white text-purple-700 font-black text-2xl px-4 py-2 rounded-xl w-full outline-none shadow-sm"
                      value={lieu.tauxRemplissage}
                      onChange={(e) => setLieux(lieux.map(l => l.id === lieu.id ? {...l, tauxRemplissage: parseFloat(e.target.value) || 0} : l))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                                <div className="text-[9px] font-bold text-indigo-600 uppercase">Compte {compteInfo.compte}</div>
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
                                  onChange={(e) => setLieux(lieux.map(l => l.id === lieu.id ? { ...l, investissements: {...l.investissements, [key]: {...inv, montant: parseInt(e.target.value) || 0}}} : l))}
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-slate-500 block">Durée (ans)</label>
                                <input 
                                  type="number"
                                  className="w-full text-xs font-bold bg-slate-50 rounded px-2 py-1 outline-none"
                                  value={inv.duree}
                                  onChange={(e) => setLieux(lieux.map(l => l.id === lieu.id ? { ...l, investissements: {...l.investissements, [key]: {...inv, duree: parseInt(e.target.value) || 0}}} : l))}
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-slate-500 block">Taux %</label>
                                <input 
                                  type="number"
                                  step="0.1"
                                  className="w-full text-xs font-bold bg-slate-50 rounded px-2 py-1 outline-none"
                                  value={inv.taux}
                                  onChange={(e) => setLieux(lieux.map(l => l.id === lieu.id ? { ...l, investissements: {...l.investissements, [key]: {...inv, taux: parseFloat(e.target.value) || 0}}} : l))}
                                />
                              </div>
                            </div>
                            {calc.mensualite > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-200 space-y-1">
                                <div className="flex items-center justify-between bg-indigo-50 px-2 py-1 rounded">
                                  <span className="text-[10px] font-bold text-indigo-700">💳 Mensualité:</span>
                                  <span className="font-black text-indigo-700 text-sm">{Math.round(calc.mensualite)} €/mois</span>
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
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-xl border-2 border-indigo-200 mt-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-[10px] font-bold text-indigo-600 uppercase">Total mensualités</div>
                            <div className="text-[9px] text-slate-500">Tous prêts confondus</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-black text-indigo-700">{Math.round(Object.values(budgetLieu.detailsInvest).reduce((sum, d) => sum + d.mensualite, 0)).toLocaleString()}</div>
                            <div className="text-xs font-bold text-indigo-600">€ / mois</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-3xl border border-emerald-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-black text-emerald-700 uppercase flex items-center gap-2">
                        <Settings size={18} /> Exploitation (mensuel)
                      </h3>
                      <button 
                        onClick={() => setLieux(lieux.map(l => l.id === lieu.id ? { ...l, exploitation: [...l.exploitation, { id: Date.now(), nom: 'Nouveau poste', montant: 0 }]} : l))}
                        className="bg-emerald-600 text-white p-1.5 rounded-lg hover:bg-emerald-700 transition-all shadow-sm no-print"
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
                              <div className="text-[9px] font-bold text-emerald-600 mb-1">Compte {numCompte}</div>
                              <input 
                                className="w-full text-xs font-bold text-slate-600 bg-transparent outline-none border-b border-emerald-100 pb-1"
                                value={item.nom}
                                onChange={(e) => setLieux(lieux.map(l => l.id === lieu.id ? { ...l, exploitation: l.exploitation.map(exp => exp.id === item.id ? {...exp, nom: e.target.value} : exp)} : l))}
                              />
                            </div>
                            <input 
                              type="number"
                              className="w-24 text-right text-xs font-black bg-emerald-50 rounded-lg px-2 py-1 outline-none"
                              value={item.montant}
                              onChange={(e) => setLieux(lieux.map(l => l.id === lieu.id ? { ...l, exploitation: l.exploitation.map(exp => exp.id === item.id ? {...exp, montant: parseInt(e.target.value) || 0} : exp)} : l))}
                            />
                            <span className="text-xs text-slate-400">€/mois</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-emerald-200">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-emerald-700">Total/an:</span>
                        <span className="text-emerald-800">{Math.round(budgetLieu.exploitation).toLocaleString()} €</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-3xl border border-indigo-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-black text-indigo-700 uppercase flex items-center gap-2">
                        <Users size={18} /> Équipe
                      </h3>
                      <button 
                        onClick={() => setLieux(lieux.map(l => l.id === lieu.id ? { ...l, personnel: [...l.personnel, { id: Date.now(), titre: 'Nouveau', etp: 1, salaire: 2000, segur: true }]} : l))}
                        className="bg-indigo-600 text-white p-1.5 rounded-lg hover:bg-indigo-700 transition-all shadow-sm no-print"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
                      {lieu.personnel.map(p => (
                        <div key={p.id} className="bg-white p-3 rounded-xl shadow-sm border border-indigo-100 group relative hover:shadow-md transition-all">
                          <button 
                            onClick={() => setLieux(lieux.map(l => l.id === lieu.id ? {...l, personnel: l.personnel.filter(per => per.id !== p.id)} : l))}
                            className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity no-print"
                          >
                            <Trash2 size={10} />
                          </button>
                          <div className="text-[9px] font-bold text-indigo-600 mb-1">Compte 641</div>
                          <input 
                            className="font-bold text-sm w-full mb-2 outline-none border-b border-indigo-100 pb-1" 
                            value={p.titre} 
                            onChange={(e) => setLieux(lieux.map(l => l.id === lieu.id ? {...l, personnel: l.personnel.map(per => per.id === p.id ? {...per, titre: e.target.value} : per)} : l))}
                          />
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="text-[9px] text-slate-500 block">ETP</label>
                              <input 
                                type="number" 
                                step="0.1" 
                                className="w-full bg-indigo-50 rounded px-2 py-1 font-bold" 
                                value={p.etp} 
                                onChange={(e) => setLieux(lieux.map(l => l.id === lieu.id ? {...l, personnel: l.personnel.map(per => per.id === p.id ? {...per, etp: parseFloat(e.target.value) || 0} : per)} : l))}
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-500 block">Salaire</label>
                              <input 
                                type="number" 
                                className="w-full bg-indigo-50 rounded px-2 py-1 font-bold" 
                                value={p.salaire} 
                                onChange={(e) => setLieux(lieux.map(l => l.id === lieu.id ? {...l, personnel: l.personnel.map(per => per.id === p.id ? {...per, salaire: parseInt(e.target.value) || 0} : per)} : l))}
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
                    <div className="mt-4 pt-4 border-t border-indigo-200">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-indigo-700">Masse salariale:</span>
                        <span className="text-indigo-800">{Math.round(budgetLieu.salaires).toLocaleString()} €</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
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
          className="w-full mt-8 py-5 border-2 border-dashed border-indigo-300 rounded-3xl text-indigo-500 font-black text-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-400 transition-all flex items-center justify-center gap-3 shadow-sm no-print"
        >
          <Plus size={24} /> AJOUTER UN NOUVEAU LIEU DE VIE
        </button>
      </div>
    </div>
  );
};

export default BudgetTool;
