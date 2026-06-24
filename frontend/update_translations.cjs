const fs = require('fs');
const path = require('path');

const locales = ['fr', 'ln', 'lu', 'kg', 'sw'];

const translations = {
  dashboard: {
    title: { fr: 'Aperçu Global', ln: 'Botala ya monene', sw: 'Muhtasari wa Jumla', lu: 'Tshilejilu tshinene', kg: 'Mbandu ya nene' },
    subtitle: { fr: 'Suivi en temps réel des indicateurs clés', ln: 'Bokembi misala mbala moko', sw: 'Ufuatiliaji wa wakati halisi wa viashiria', lu: 'Dikonkonona dya pa tshikondo', kg: 'Kutala bisalu na ntangu yai' },
    prod_trend: { fr: 'Tendance de Production (30 jours)', ln: 'Bokende ya production (mikolo 30)', sw: 'Mwelekeo wa Uzalishaji (siku 30)', lu: 'Malu a production (matuku 30)', kg: 'Kwendaka ya production (bilumbu 30)' },
    prod_trend_sub: { fr: 'Tonnage extrait par jour', ln: 'Tonnage ebimi mokolo na mokolo', sw: 'Tani iliyotolewa kwa siku', lu: 'Tonnage mupatula dituku dionso', kg: 'Tonnage yina kubasika konso kilumbu' },
    hse_incidents: { fr: 'Incidents HSE', ln: 'Likambo ya HSE', sw: 'Matukio ya HSE', lu: 'Malu a HSE', kg: 'Mambu ya HSE' },
    equip_status: { fr: 'État des Équipements', ln: 'Ndenge bisaleli eza', sw: 'Hali ya Vifaa', lu: 'Mwikadilu wa biombo', kg: 'Kuzinga ya bisadilu' },
    summary_safety: { fr: 'Résumé Sécurité', ln: 'Bokuse ya Bobateli', sw: 'Muhtasari wa Usalama', lu: 'Tshikoso tshia Bukubi', kg: 'Kukanga ya lutaninu' },
    summary_pegs: { fr: 'Résumé Pegs', ln: 'Bokuse ya Pegs', sw: 'Muhtasari wa Pegs', lu: 'Tshikoso tshia Pegs', kg: 'Kukanga ya Pegs' },
    summary_arsp: { fr: 'Résumé Personnel (ARSP)', ln: 'Bokuse ya basali', sw: 'Muhtasari wa Wafanyakazi', lu: 'Tshikoso tshia benzeji', kg: 'Kukanga ya bantu ya kisalu' },
    safety_open: { fr: 'Incidents ouverts', ln: 'Makambo efungwami', sw: 'Matukio wazi', lu: 'Malu mabulula', kg: 'Mambu ya kuki' },
    safety_critical: { fr: 'Critiques', ln: 'Makasi', sw: 'Muhimu', lu: 'Makola', kg: 'Ngolo' },
    pegs_total: { fr: 'Total', ln: 'Nyonso', sw: 'Jumla', lu: 'Bionso', kg: 'Yonso' },
    pegs_active: { fr: 'Actifs', ln: 'Ezo sala', sw: 'Inayofanya kazi', lu: 'Yenza mudimu', kg: 'Ke sala' },
    pegs_completed: { fr: 'Complétés', ln: 'Esili', sw: 'Imekamilika', lu: 'Bishikisha', kg: 'Me mana' },
    labor_total: { fr: 'Total Employés', ln: 'Basali nyonso', sw: 'Jumla ya Wafanyakazi', lu: 'Benzeji bionso', kg: 'Bantu yonso' },
    labor_national: { fr: 'Nationaux', ln: 'Bana mboka', sw: 'Wa kitaifa', lu: 'Bana ba ditunga', kg: 'Bana ya nsi' },
    labor_expat: { fr: 'Expatriés', ln: 'Bapaya', sw: 'Wageni', lu: 'Banyi', kg: 'Bantu ya nganda' }
  },
  kpi: {
    pegs_active: { fr: 'Pegs Actifs', ln: 'Pegs ezo sala', sw: 'Pegs zinazofanya kazi', lu: 'Pegs yenza mudimu', kg: 'Pegs ke sala' },
    tonnage: { fr: 'Tonnage (24h)', ln: 'Tonnage (ngonga 24)', sw: 'Tani (saa 24)', lu: 'Tonnage (mêba 24)', kg: 'Tonnage (ntangu 24)' },
    hse_incidents: { fr: 'Incidents HSE', ln: 'Likambo ya HSE', sw: 'Matukio ya HSE', lu: 'Malu a HSE', kg: 'Mambu ya HSE' },
    arsp_ratio: { fr: 'Ratio National', ln: 'Mokano ya bana mboka', sw: 'Uwiano wa Kitaifa', lu: 'Tshilejilu tshia bana ba ditunga', kg: 'Kiteso ya bana ya nsi' }
  },
  reports: {
    pegs_by_status: { fr: 'Pegs par Statut', ln: 'Pegs na statut', sw: 'Pegs kwa Hali', lu: 'Pegs ku statut', kg: 'Pegs na statut' },
    pegs_by_zone: { fr: 'Pegs par Zone', ln: 'Pegs na esika', sw: 'Pegs kwa Kanda', lu: 'Pegs ku miaba', kg: 'Pegs na kisika' },
    hse_by_severity: { fr: 'Incidents par Sévérité', ln: 'Likambo na bozito', sw: 'Matukio kwa Ukali', lu: 'Malu ku bukole', kg: 'Mambu na zitu' },
    fin_by_category: { fr: 'Dépenses par Catégorie (USD)', ln: 'Mbongo ebimi na lolenge', sw: 'Matumizi kwa Kitengo', lu: 'Mabanji mupatuka ku mushindu', kg: 'Mbongo me basika na mutindu' },
    summary_prod: { fr: 'Résumé Production', ln: 'Bokuse ya production', sw: 'Muhtasari wa Uzalishaji', lu: 'Tshikoso tshia production', kg: 'Kukanga ya production' },
    summary_fin: { fr: 'Résumé Financier', ln: 'Bokuse ya mbongo', sw: 'Muhtasari wa Kifedha', lu: 'Tshikoso tshia mabanji', kg: 'Kukanga ya mbongo' },
    summary_hse: { fr: 'Résumé HSE', ln: 'Bokuse ya HSE', sw: 'Muhtasari wa HSE', lu: 'Tshikoso tshia HSE', kg: 'Kukanga ya HSE' },
    total_pegs: { fr: 'Pegs Total', ln: 'Pegs Nyonso', sw: 'Jumla ya Pegs', lu: 'Pegs Bionso', kg: 'Pegs Yonso' },
    total_tonnage: { fr: 'Tonnage Total', ln: 'Tonnage Nyonso', sw: 'Jumla ya Tani', lu: 'Tonnage Bionso', kg: 'Tonnage Yonso' },
    total_volume: { fr: 'Volume Extrait', ln: 'Volume ebimi', sw: 'Kiasi kilichotolewa', lu: 'Volume mupatula', kg: 'Volume me basika' },
    total_expenses: { fr: 'Dépenses Totales', ln: 'Mbongo nyonso ebimi', sw: 'Jumla ya Matumizi', lu: 'Mabanji onso mupatuka', kg: 'Mbongo yonso me basika' },
    generating: { fr: 'Génération...', ln: 'Ezo sala...', sw: 'Inazalisha...', lu: 'Idi yenza...', kg: 'Ke sala...' }
  }
};

locales.forEach(loc => {
  const filePath = path.join(__dirname, 'src/locales', loc, 'translation.json');
  let data = {};
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  
  if (!data.dashboard) data.dashboard = {};
  if (!data.kpi) data.kpi = {};
  if (!data.reports) data.reports = {}; // already exists, but we merge
  
  Object.keys(translations.dashboard).forEach(key => {
    data.dashboard[key] = translations.dashboard[key][loc] || translations.dashboard[key].fr;
  });
  
  Object.keys(translations.kpi).forEach(key => {
    data.kpi[key] = translations.kpi[key][loc] || translations.kpi[key].fr;
  });
  
  Object.keys(translations.reports).forEach(key => {
    data.reports[key] = translations.reports[key][loc] || translations.reports[key].fr;
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${loc}`);
});
