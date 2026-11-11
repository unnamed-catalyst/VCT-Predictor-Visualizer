export const API_BASE = "https://vct-predictor-visualizer.onrender.com";

// Region keys match the logo folders in public/logos/<REGION>/<CODE>.png
export const REGIONS = [
  { key: "AMERICAS", label: "Americas", color: "#ff6b35" },
  { key: "EMEA", label: "EMEA", color: "#e8d44d" },
  { key: "APAC", label: "Pacific", color: "#2ad4d4" },
];

export const TEAMS = [
  { code: "100T", name: "100 Thieves", region: "AMERICAS" },
  { code: "2G", name: "2Game Esports", region: "AMERICAS" },
  { code: "C9", name: "Cloud9", region: "AMERICAS" },
  { code: "EG", name: "Evil Geniuses", region: "AMERICAS" },
  { code: "FUR", name: "FURIA", region: "AMERICAS" },
  { code: "G2", name: "G2 Esports", region: "AMERICAS" },
  { code: "KRU", name: "KRÜ Esports", region: "AMERICAS" },
  { code: "LEV", name: "Leviatán", region: "AMERICAS" },
  { code: "LOUD", name: "LOUD", region: "AMERICAS" },
  { code: "MIBR", name: "MIBR", region: "AMERICAS" },
  { code: "NRG", name: "NRG", region: "AMERICAS" },
  { code: "SEN", name: "Sentinels", region: "AMERICAS" },

  { code: "APK", name: "Apeks", region: "EMEA" },
  { code: "BBL", name: "BBL Esports", region: "EMEA" },
  { code: "FNC", name: "FNATIC", region: "EMEA" },
  { code: "FUT", name: "FUT Esports", region: "EMEA" },
  { code: "M8", name: "Gentle Mates", region: "EMEA" },
  { code: "GX", name: "GIANTX", region: "EMEA" },
  { code: "KC", name: "Karmine Corp", region: "EMEA" },
  { code: "MKOI", name: "KOI", region: "EMEA" },
  { code: "NAVI", name: "Natus Vincere", region: "EMEA" },
  { code: "TH", name: "Team Heretics", region: "EMEA" },
  { code: "TL", name: "Team Liquid", region: "EMEA" },
  { code: "VIT", name: "Team Vitality", region: "EMEA" },

  { code: "BME", name: "BOOM Esports", region: "APAC" },
  { code: "DFM", name: "DetonatioN FocusMe", region: "APAC" },
  { code: "DRX", name: "DRX", region: "APAC" },
  { code: "GEN", name: "Gen.G", region: "APAC" },
  { code: "GE", name: "Global Esports", region: "APAC" },
  { code: "NS", name: "Nongshim RedForce", region: "APAC" },
  { code: "PRX", name: "Paper Rex", region: "APAC" },
  { code: "RRQ", name: "Rex Regum Qeon", region: "APAC" },
  { code: "T1", name: "T1", region: "APAC" },
  { code: "TLN", name: "TALON", region: "APAC" },
  { code: "TS", name: "Team Secret", region: "APAC" },
  { code: "ZETA", name: "ZETA DIVISION", region: "APAC" },
];

export const regionOf = (key) => REGIONS.find((r) => r.key === key);
export const teamByCode = (code) => TEAMS.find((t) => t.code === code);
export const logoUrl = (team) =>
  `${import.meta.env.BASE_URL}logos/${team.region}/${team.code}.png`;
