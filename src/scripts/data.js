export const START_YEAR = 1880;
export const END_YEAR = 1935;
export const GRID_SIZE = 18;

export const CHARTERS = {
  balanced: {
    id: 'balanced',
    name: 'Balanced Charter',
    description: 'A modest town with ordinary cash, ordinary fear, and no faction in full command.',
    setup: {}
  },
  industrial: {
    id: 'industrial',
    name: 'Industrial Boom',
    description: 'More starting cash, rail ambition, and a public already smelling smoke.',
    setup: {
      money: 3800,
      trust: 56,
      health: 66,
      resilience: 44,
      innovation: 15,
      bankStability: 64,
      inflation: 10,
      policies: { regulation: 'balanced', labor: 'tolerate', media: 'industry' },
      doctrines: { transport: 'rail', money: 'municipalBonds' }
    }
  },
  reform: {
    id: 'reform',
    name: 'Reform Coalition',
    description: 'Higher trust, stricter rules, public works pressure, and less patience for graft.',
    setup: {
      money: 3000,
      trust: 66,
      health: 66,
      corruption: 6,
      shadowEconomy: 5,
      resilience: 48,
      policies: { publicWorks: 'aggressive', regulation: 'strict', labor: 'support', media: 'independent', utility: 'public' },
      doctrines: { money: 'municipalBonds' }
    }
  },
  speculative: {
    id: 'speculative',
    name: 'Speculative Credit Town',
    description: 'A bank-led start with fast credit pressure, early debt, and a ledger already tapping its foot.',
    setup: {
      money: 2800,
      debt: 360,
      liquidity: 62,
      credit: 36,
      inflation: 0,
      bankStability: 86,
      monetaryTrust: 78,
      tradeConfidence: 62,
      policies: { banking: 'cautious', taxRate: 'low', publicWorks: 'balanced' },
      doctrines: { money: 'bankCredit', transport: 'gasoline' }
    }
  }
};

export const BUILDINGS = {
  road: {
    id: 'road',
    name: 'Road',
    category: 'Transport',
    cost: 24,
    color: 0x61584a,
    height: 0.08,
    description: 'Cheap local mobility. Improves access and growth.',
    effects: { maintenance: 1, freight: 1, resilience: 0.2 }
  },
  residential: {
    id: 'residential',
    name: 'Residential Block',
    category: 'Town',
    cost: 85,
    color: 0xc88f5b,
    height: 0.7,
    description: 'Housing for workers and families. Needs jobs and trust to fill.',
    effects: { housing: 85, powerDemand: 2, maintenance: 1, trust: 0.2 }
  },
  mainStreet: {
    id: 'mainStreet',
    name: 'Main Street',
    category: 'Town',
    cost: 120,
    color: 0xd2ad66,
    height: 0.62,
    description: 'Commercial jobs and civic life. Loves roads, banks, and newspapers.',
    effects: { jobs: 32, revenue: 8, powerDemand: 3, freightDemand: 1, maintenance: 2, trust: 0.2 }
  },
  farm: {
    id: 'farm',
    name: 'Farm',
    category: 'Town',
    cost: 70,
    color: 0x8cb45f,
    height: 0.22,
    description: 'Food and early jobs. Diesel later makes farms stronger.',
    effects: { jobs: 18, food: 70, freightDemand: 1, maintenance: 1, resilience: 0.4 }
  },
  factory: {
    id: 'factory',
    name: 'Factory',
    category: 'Industry',
    cost: 180,
    color: 0x5f6267,
    height: 1.25,
    description: 'Industrial jobs and money. Also smoke, injuries, and freight demand.',
    effects: { jobs: 78, revenue: 28, powerDemand: 10, freightDemand: 5, pollution: 7, fireRisk: 5, maintenance: 5, health: -2 }
  },
  machineShop: {
    id: 'machineShop',
    name: 'Machine Shop',
    category: 'Industry',
    cost: 300,
    color: 0x6f7475,
    height: 0.92,
    minYear: 1890,
    description: 'Turns skilled labor into repair capacity, factory output, and practical invention.',
    effects: { jobs: 34, revenue: 16, powerDemand: 5, freightDemand: 3, pollution: 3, maintenance: 5, innovation: 8, resilience: 3 }
  },
  coalPlant: {
    id: 'coalPlant',
    name: 'Coal Steam Plant',
    category: 'Power',
    cost: 420,
    color: 0x2d2d31,
    accent: 0x2a2a2a,
    height: 1.45,
    description: 'Large cheap power and industry confidence. Dirty, risky, and coal-dependent.',
    effects: { powerSupply: 85, jobs: 22, revenue: 18, pollution: 16, fireRisk: 9, maintenance: 10, fuelDependency: 10, health: -5 }
  },
  hydroPlant: {
    id: 'hydroPlant',
    name: 'Hydro Works',
    category: 'Power',
    cost: 650,
    color: 0x427ba5,
    height: 0.9,
    requiresWater: true,
    description: 'Clean reliable power near the river. Expensive and politically sensitive.',
    effects: { powerSupply: 105, jobs: 14, maintenance: 6, resilience: 6, trust: 2, pollution: -3 }
  },
  dcPlant: {
    id: 'dcPlant',
    name: 'DC Local Plant',
    category: 'Power',
    cost: 300,
    color: 0xe0b650,
    height: 1.0,
    description: 'Stable local current. Comfortable early, inefficient at scale.',
    effects: { powerSupply: 42, jobs: 12, powerDemand: 1, maintenance: 7, trust: 1, resilience: 1 }
  },
  acPlant: {
    id: 'acPlant',
    name: 'AC Power House',
    category: 'Power',
    cost: 520,
    color: 0x6bbce5,
    height: 1.2,
    description: 'Scalable grid power. Needs substations, education, and public trust.',
    effects: { powerSupply: 95, jobs: 16, maintenance: 9, innovation: 2, resilience: -1 }
  },
  substation: {
    id: 'substation',
    name: 'AC Substation',
    category: 'Power',
    cost: 180,
    color: 0x9ed9ef,
    height: 0.55,
    description: 'Extends grid reliability and reduces cascade risk.',
    effects: { powerSupply: 12, powerDemand: 1, maintenance: 3, resilience: 2 }
  },
  powerLine: {
    id: 'powerLine',
    name: 'Power Line',
    category: 'Power',
    cost: 35,
    color: 0xb2c7cf,
    height: 0.25,
    description: 'Cheap grid reach. Improves supply coverage but adds maintenance.',
    effects: { powerSupply: 2, maintenance: 1, resilience: 0.2 }
  },
  gasolineDepot: {
    id: 'gasolineDepot',
    name: 'Gasoline Depot',
    category: 'Transport',
    cost: 240,
    color: 0xc44f36,
    height: 0.75,
    description: 'Fast flexible service mobility. Fire risk and fuel dependency follow.',
    effects: { jobs: 18, freight: 16, revenue: 10, fuelDependency: 8, fireRisk: 8, pollution: 3, maintenance: 4 }
  },
  dieselDepot: {
    id: 'dieselDepot',
    name: 'Diesel Depot',
    category: 'Transport',
    cost: 330,
    color: 0x3e5d3e,
    height: 0.78,
    description: 'Freight, farms, and winter reliability. Noisy, smoky, fuel-hungry.',
    effects: { jobs: 22, freight: 34, revenue: 12, fuelDependency: 11, pollution: 6, maintenance: 6, resilience: 4 }
  },
  rail: {
    id: 'rail',
    name: 'Rail Track',
    category: 'Transport',
    cost: 55,
    color: 0x34383a,
    height: 0.1,
    description: 'Heavy freight corridor. Best with a station or rail doctrine.',
    effects: { freight: 5, maintenance: 2, pollution: 1 }
  },
  railStation: {
    id: 'railStation',
    name: 'Freight Station',
    category: 'Transport',
    cost: 360,
    color: 0x78624a,
    height: 0.85,
    description: 'Turns track into economic muscle.',
    effects: { jobs: 26, freight: 52, revenue: 16, powerDemand: 3, maintenance: 7 }
  },
  streetcar: {
    id: 'streetcar',
    name: 'Electric Streetcar',
    category: 'Transport',
    cost: 390,
    color: 0x8fb8c9,
    height: 0.45,
    description: 'Compact growth and trust. Needs a stable electric grid.',
    effects: { jobs: 16, freight: 8, powerDemand: 7, maintenance: 7, trust: 4, pollution: -2 }
  },
  grainElevator: {
    id: 'grainElevator',
    name: 'Grain Elevator',
    category: 'Economy',
    cost: 260,
    color: 0xc7a869,
    height: 1.05,
    minYear: 1888,
    description: 'Stores harvests, steadies food prices, and turns farms into freight business.',
    effects: { jobs: 16, food: 42, freight: 18, revenue: 14, freightDemand: 2, maintenance: 4, tradeConfidence: 3 }
  },
  school: {
    id: 'school',
    name: 'School',
    category: 'Civic',
    cost: 210,
    color: 0xd7c68b,
    height: 0.7,
    description: 'Education, trust, innovation, and lower panic.',
    effects: { jobs: 12, powerDemand: 2, maintenance: 5, education: 7, innovation: 5, trust: 4 }
  },
  library: {
    id: 'library',
    name: 'Library',
    category: 'Civic',
    cost: 260,
    color: 0xbfaaa1,
    height: 0.8,
    description: 'Knowledge, calm, and civic memory.',
    effects: { jobs: 8, powerDemand: 2, maintenance: 4, education: 9, innovation: 4, trust: 3 }
  },
  townHall: {
    id: 'townHall',
    name: 'Town Hall',
    category: 'Civic',
    cost: 380,
    color: 0xe5dfcf,
    height: 1.0,
    description: 'Legitimacy and policy capacity. Corruption hurts more when this is weak.',
    effects: { jobs: 16, powerDemand: 3, maintenance: 8, trust: 7, corruption: -2 }
  },
  newspaper: {
    id: 'newspaper',
    name: 'Newspaper Office',
    category: 'Civic',
    cost: 220,
    color: 0xb7a078,
    height: 0.7,
    description: 'Turns events into belief. Helpful or dangerous depending on posture.',
    effects: { jobs: 14, revenue: 5, powerDemand: 2, maintenance: 3, trust: 2, education: 2 }
  },
  telegraphOffice: {
    id: 'telegraphOffice',
    name: 'Telegraph Office',
    category: 'Economy',
    cost: 300,
    color: 0xb69b74,
    height: 0.72,
    minYear: 1885,
    description: 'Moves prices, rumors, and dispatches faster than wagons can apologize.',
    effects: { jobs: 12, revenue: 12, powerDemand: 2, maintenance: 4, innovation: 5, tradeConfidence: 8, monetaryTrust: 2 }
  },
  bank: {
    id: 'bank',
    name: 'Bank',
    category: 'Economy',
    cost: 320,
    color: 0xa9b18e,
    height: 0.9,
    description: 'Credit, growth, and the possibility of panics.',
    effects: { jobs: 18, revenue: 26, powerDemand: 2, maintenance: 4, innovation: 2, corruption: 1 }
  },
  insuranceOffice: {
    id: 'insuranceOffice',
    name: 'Insurance Office',
    category: 'Economy',
    cost: 260,
    color: 0x8fa58b,
    height: 0.72,
    minYear: 1890,
    description: 'Prices risk before fire, flood, and speculation price it for you.',
    effects: { jobs: 12, revenue: 12, powerDemand: 1, maintenance: 3, fireRisk: -6, bankStability: 5, tradeConfidence: 4 }
  },
  patentOffice: {
    id: 'patentOffice',
    name: 'Patent Office',
    category: 'Economy',
    cost: 380,
    color: 0xd6c595,
    height: 0.84,
    minYear: 1895,
    minInnovation: 22,
    description: 'Turns inventors into paperwork, paperwork into capital, and capital into new trouble.',
    effects: { jobs: 14, revenue: 10, powerDemand: 2, maintenance: 5, innovation: 12, credit: 4, corruption: 1 }
  },
  sheriff: {
    id: 'sheriff',
    name: 'Sheriff Office',
    category: 'Civic',
    cost: 230,
    color: 0x486e8b,
    height: 0.72,
    description: 'Law, order, lower fire spread, and enforcement cost.',
    effects: { jobs: 14, powerDemand: 2, maintenance: 6, trust: 2, shadow: -4, fireRisk: -2 }
  },
  fireStation: {
    id: 'fireStation',
    name: 'Fire Station',
    category: 'Civic',
    cost: 250,
    color: 0xb54835,
    height: 0.78,
    description: 'Protects gasoline, factories, and wooden neighborhoods.',
    effects: { jobs: 12, powerDemand: 2, maintenance: 6, fireRisk: -10, resilience: 5, trust: 2 }
  },
  courthouse: {
    id: 'courthouse',
    name: 'Courthouse',
    category: 'Civic',
    cost: 360,
    color: 0xd6d0be,
    height: 0.96,
    minYear: 1886,
    description: 'Makes graft slower, disputes duller, and legitimacy slightly less accidental.',
    effects: { jobs: 18, powerDemand: 2, maintenance: 8, trust: 5, corruption: -6, shadow: -2 }
  },
  clinic: {
    id: 'clinic',
    name: 'Clinic',
    category: 'Civic',
    cost: 300,
    color: 0xe3e0d6,
    height: 0.78,
    description: 'Health and resilience against industrial costs.',
    effects: { jobs: 18, powerDemand: 4, maintenance: 8, health: 9, trust: 3, resilience: 2 }
  },
  sewerWorks: {
    id: 'sewerWorks',
    name: 'Sewer Works',
    category: 'Civic',
    cost: 540,
    color: 0x596d70,
    height: 0.66,
    minYear: 1890,
    requiresWater: true,
    description: 'Converts debt, pipes, and unpleasant realism into public health.',
    effects: { jobs: 18, powerDemand: 4, maintenance: 10, health: 14, resilience: 10, pollution: -3, trust: 2 }
  },
  temperanceHall: {
    id: 'temperanceHall',
    name: 'Temperance Hall',
    category: 'Social',
    cost: 170,
    color: 0xd8d1b0,
    height: 0.65,
    description: 'Moral reform and church pressure. Can make prohibition tempting.',
    effects: { jobs: 6, maintenance: 2, trust: 3, shadow: -1, corruption: -0.5 }
  },
  saloon: {
    id: 'saloon',
    name: 'Saloon',
    category: 'Social',
    cost: 150,
    color: 0x9b5838,
    height: 0.62,
    description: 'Revenue, cohesion, and visible disorder.',
    effects: { jobs: 18, revenue: 20, powerDemand: 1, maintenance: 2, trust: 1, shadow: 2, fireRisk: 2 }
  },
  speakeasy: {
    id: 'speakeasy',
    name: 'Speakeasy',
    category: 'Shadow',
    cost: 210,
    color: 0x5c3d62,
    height: 0.55,
    unlock: (state) => state.policies.alcohol === 'prohibition' || state.shadowEconomy >= 28,
    description: 'Illegal revenue leakage and corruption. Appears when prohibition or shadow power rises.',
    effects: { jobs: 12, revenue: 18, maintenance: 1, trust: -1, shadow: 8, corruption: 5 }
  },
  unionHall: {
    id: 'unionHall',
    name: 'Union Hall',
    category: 'Social',
    cost: 240,
    color: 0x8f4a3d,
    height: 0.66,
    description: 'Worker power, safety, and strike pressure if ignored.',
    effects: { jobs: 6, maintenance: 3, health: 4, trust: 4, corruption: -1 }
  },
  settlementHouse: {
    id: 'settlementHouse',
    name: 'Settlement House',
    category: 'Social',
    cost: 220,
    color: 0xcaa37d,
    height: 0.66,
    minYear: 1892,
    description: 'Turns neighbors, schooling, and practical care into trust the ledger can measure.',
    effects: { jobs: 10, powerDemand: 1, maintenance: 5, health: 6, trust: 6, shadow: -4, education: 3 }
  },
  radioStation: {
    id: 'radioStation',
    name: 'Radio Station',
    category: 'Social',
    cost: 420,
    color: 0x6d8fa6,
    height: 0.78,
    minYear: 1920,
    minInnovation: 35,
    description: 'Broadcasts market weather, civic myth, and panic with equal technical confidence.',
    effects: { jobs: 14, revenue: 8, powerDemand: 5, maintenance: 6, trust: 5, education: 4, innovation: 6, tradeConfidence: 4 }
  },
  publicWorks: {
    id: 'publicWorks',
    name: 'Public Works Yard',
    category: 'Civic',
    cost: 280,
    color: 0x879083,
    height: 0.62,
    description: 'Roads, sewers, bridges, and disaster recovery.',
    effects: { jobs: 20, freight: 8, powerDemand: 2, maintenance: 5, resilience: 9, health: 3 }
  },
  waterPump: {
    id: 'waterPump',
    name: 'Water Pump',
    category: 'Civic',
    cost: 260,
    color: 0x5fa4b2,
    height: 0.55,
    requiresWater: true,
    description: 'Health and fire resilience near the river.',
    effects: { jobs: 8, powerDemand: 3, maintenance: 5, health: 6, fireRisk: -4, resilience: 4 }
  },
  park: {
    id: 'park',
    name: 'Civic Square',
    category: 'Social',
    cost: 120,
    color: 0x6fa46b,
    height: 0.18,
    description: 'Trust, health, and lower heat from industrial choices.',
    effects: { maintenance: 2, trust: 4, health: 3, pollution: -2, resilience: 1 }
  },
  batteryHouse: {
    id: 'batteryHouse',
    name: 'Battery House',
    category: 'Power',
    cost: 520,
    color: 0x8fbad0,
    height: 0.58,
    minYear: 1900,
    minInnovation: 30,
    description: 'Stores a little power and a lot of confidence for outages and critical services.',
    effects: { powerSupply: 18, powerDemand: 2, maintenance: 8, resilience: 14, innovation: 3, fireRisk: 2 }
  }
};

export const PROJECTS = {
  fireCode: {
    id: 'fireCode',
    name: 'Fire Code',
    cost: 360,
    minYear: 1882,
    description: 'Mandate safer storage, inspections, and exits. Less fire, more grumbling paperwork.',
    effects: { fireRisk: -12, resilience: 4, maintenance: 3, trust: 2 },
    headline: 'Fire Code Passes After Council Discovers Wood Burns',
    summary: 'Inspections and safer storage reduce disaster risk, though every shed now owns an opinion.'
  },
  sewerBond: {
    id: 'sewerBond',
    name: 'Sewer Bond',
    cost: 640,
    debt: 420,
    minYear: 1890,
    description: 'Finance underground public health. The pipes are invisible; the debt is not.',
    effects: { health: 10, resilience: 8, pollution: -4, maintenance: 7, trust: 3 },
    headline: 'Sewer Bond Wins; Streets Smell Less Like Policy',
    summary: 'Public health rises with buried infrastructure and a tidy new entry in the debt ledger.'
  },
  bankExaminers: {
    id: 'bankExaminers',
    name: 'Bank Examiners',
    cost: 300,
    minYear: 1893,
    description: 'Slow speculative credit and make bank books more boring, which is the point.',
    effects: { bankStability: 12, credit: -5, corruption: -2, monetaryTrust: 5, maintenance: 3 },
    headline: 'Bank Examiners Make Confidence Tedious Again',
    summary: 'Speculation cools as balance sheets become less creative and more legible.'
  },
  ruralElectrification: {
    id: 'ruralElectrification',
    name: 'Rural Electric Co-op',
    cost: 720,
    debt: 360,
    minYear: 1915,
    minInnovation: 34,
    description: 'Stretch practical power beyond downtown. Expensive, popular, and maintenance-hungry.',
    effects: { powerSupply: 22, powerDemand: 3, resilience: 8, trust: 5, maintenance: 8, innovation: 4 },
    headline: 'Rural Co-op Carries Current Past the Last Porch',
    summary: 'Outlying districts gain service and trust while maintenance crews gain calendars.'
  },
  antiGraftAudit: {
    id: 'antiGraftAudit',
    name: 'Anti-Graft Audit',
    cost: 280,
    minYear: 1884,
    description: 'Open the books, annoy the machine, and recover a little civic oxygen.',
    effects: { corruption: -12, trust: 5, shadow: -3, maintenance: 2 },
    headline: 'Audit Finds Ledger With Too Many Convenient Smudges',
    summary: 'Public trust rises as graft slows down and several officials rediscover handwriting.'
  },
  laborCompact: {
    id: 'laborCompact',
    name: 'Labor Compact',
    cost: 420,
    minYear: 1898,
    description: 'Negotiate safety and wages before the whistles stop negotiating for you.',
    effects: { trust: 6, health: 5, fireRisk: -4, maintenance: 8, revenue: -3 },
    headline: 'Labor Compact Keeps Whistles Blowing and Speeches Shorter',
    summary: 'Worker safety and trust improve, though payroll learns a heavier step.'
  },
  wireService: {
    id: 'wireService',
    name: 'Regional Wire Service',
    cost: 340,
    minYear: 1900,
    description: 'Connect the newspaper, banks, and stations to regional markets and faster rumor control.',
    effects: { tradeConfidence: 9, innovation: 5, trust: 3, monetaryTrust: 2, maintenance: 4 },
    headline: 'Wire Service Gives Facts a Fighting Chance Against Rumor',
    summary: 'Market confidence rises as the town learns the difference between news and shouting.'
  }
};

export const POLICY_GROUPS = {
  taxRate: {
    label: 'Tax Rate',
    options: {
      low: { label: 'Low', description: 'Growth and trust, but thin public revenue.' },
      balanced: { label: 'Balanced', description: 'Reliable revenue without too much revolt.' },
      high: { label: 'High', description: 'More city capacity, less patience, more evasion.' }
    }
  },
  publicWorks: {
    label: 'Public Works',
    options: {
      minimal: { label: 'Minimal', description: 'Cheap now, brittle later.' },
      balanced: { label: 'Balanced', description: 'Moderate road, health, and resilience gains.' },
      aggressive: { label: 'Aggressive', description: 'Expensive infrastructure push with real resilience.' }
    }
  },
  regulation: {
    label: 'Regulation',
    options: {
      loose: { label: 'Loose', description: 'Industry runs hot. So do fires and scandals.' },
      balanced: { label: 'Balanced', description: 'Acceptable risks and costs.' },
      strict: { label: 'Strict', description: 'Safer and cleaner, but slower and pricier.' }
    }
  },
  alcohol: {
    label: 'Alcohol Policy',
    options: {
      legal: { label: 'Legal Saloons', description: 'Revenue and social life, plus disorder.' },
      regulated: { label: 'Regulated Saloons', description: 'Moderate revenue, moderate trouble.' },
      prohibition: { label: 'Prohibition', description: 'Visible reform, hidden bootlegging and graft.' }
    }
  },
  utility: {
    label: 'Utility Ownership',
    options: {
      private: { label: 'Private Franchise', description: 'Cheaper expansion, monopoly and leakage risk.' },
      mixed: { label: 'Mixed', description: 'Control and flexibility in uneasy balance.' },
      public: { label: 'Public Utility', description: 'Trust when it works, blame when it fails.' }
    }
  },
  labor: {
    label: 'Labor Policy',
    options: {
      suppress: { label: 'Suppress Unions', description: 'Short-term output, long-term strike pressure.' },
      tolerate: { label: 'Tolerate Unions', description: 'Uneasy but workable labor peace.' },
      support: { label: 'Negotiate/Support', description: 'Worker trust and safety with higher costs.' }
    }
  },
  media: {
    label: 'Media Posture',
    options: {
      independent: { label: 'Independent Press', description: 'Legitimacy and clearer warnings.' },
      booster: { label: 'Booster Paper', description: 'Growth optimism and hidden weak spots.' },
      sensational: { label: 'Sensational Paper', description: 'Scandals surface, panic travels.' },
      industry: { label: 'Industry-Owned Paper', description: 'Industrial confidence, legitimacy risk.' }
    }
  },
  banking: {
    label: 'Banking Policy',
    options: {
      cautious: { label: 'Cautious Banks', description: 'Stable credit, slower growth, fewer panics.' },
      balanced: { label: 'Balanced Credit', description: 'Moderate lending and ordinary anxiety.' },
      speculative: { label: 'Loose/Speculative Credit', description: 'Fast growth with sweaty ledgers and crash risk.' }
    }
  }
};

export const DOCTRINES = {
  electric: {
    label: 'Electric Doctrine',
    options: {
      dc: { label: 'DC Local', description: 'Local stability and lower fear, weak large-town range.' },
      ac: { label: 'AC Grid', description: 'Scales power and hydro, but can create fear and cascade risks.' },
      hybrid: { label: 'Hybrid Grid', description: 'Costly but resilient and efficient in educated towns.' }
    }
  },
  transport: {
    label: 'Transport Doctrine',
    options: {
      horse: { label: 'Horse/Local', description: 'Low fuel dependency, limited freight and growth.' },
      gasoline: { label: 'Gasoline Mobility', description: 'Flexible commercial growth, fire and fuel exposure.' },
      diesel: { label: 'Diesel Freight', description: 'Strong farms and freight, dirtier fuel dependence.' },
      rail: { label: 'Rail-First', description: 'Huge freight corridors, coal/water and maintenance burden.' },
      streetcar: { label: 'Streetcar Compact City', description: 'Trust and density if the electric grid holds.' }
    }
  },
  money: {
    label: 'Money Engine',
    options: {
      hardMoney: { label: 'Hard Money', description: 'Stable prices and outside confidence, but tight credit and harsher downturns.' },
      bimetal: { label: 'Silver/Bimetal', description: 'Frontier growth and debtor relief with inflation and faction fights.' },
      greenbacks: { label: 'Public Paper Money', description: 'Flexible public spending and debt relief with trust and inflation pressure.' },
      bankCredit: { label: 'Bank Credit Expansion', description: 'Housing, factories, and speculation. Growth now, panic later.' },
      municipalBonds: { label: 'Municipal Bonds', description: 'Big public works before the town can fully afford them. Debt service follows.' },
      companyScrip: { label: 'Company Scrip', description: 'Factory growth through company money, worker anger, and legitimacy loss.' },
      localScrip: { label: 'Emergency Local Scrip', description: 'Keeps local trade alive in crisis while outsiders lose confidence.' }
    }
  }
};

export const MILESTONES = [
  {
    id: 'first-grid',
    name: 'First Useful Grid',
    goal: 'Own at least 6 roads, rails, or power lines.',
    rewardLabel: '+$180, +3 resilience',
    condition: ({ counts }) => (counts.road ?? 0) + (counts.rail ?? 0) + (counts.powerLine ?? 0) >= 6,
    reward: { money: 180, resilience: 3 },
    headline: 'First Useful Grid Gives Mud a Timetable',
    summary: 'The town now has enough connective tissue to pretend its plans are intentional.'
  },
  {
    id: 'first-power',
    name: 'First Real Power',
    goal: 'Build coal, hydro, DC, AC, or battery power.',
    rewardLabel: '+4 trust, +4 innovation',
    condition: ({ counts }) => (counts.coalPlant ?? 0) + (counts.hydroPlant ?? 0) + (counts.dcPlant ?? 0) + (counts.acPlant ?? 0) + (counts.batteryHouse ?? 0) > 0,
    reward: { trust: 4, innovation: 4 },
    headline: 'Town Finds an Engine Larger Than Committee Breath',
    summary: 'Reliable power changes the civic mood from hopeful candles to dangerous ambition.'
  },
  {
    id: 'freight-proof',
    name: 'Freight Proof',
    goal: 'Reach 100% freight reliability with at least 300 people.',
    rewardLabel: '+$260, +4 trade confidence',
    condition: ({ state, stats }) => state.population >= 300 && stats.freightReliability >= 1,
    reward: { money: 260, tradeConfidence: 4 },
    headline: 'Freight Arrives Before Excuses',
    summary: 'Goods begin moving often enough that merchants call it confidence instead of luck.'
  },
  {
    id: 'civic-care',
    name: 'Civic Care Web',
    goal: 'Reach 35% civic coverage.',
    rewardLabel: '+5 health, +5 trust',
    condition: ({ stats }) => stats.civicCoverage >= 35,
    reward: { health: 5, trust: 5 },
    headline: 'Care Becomes Infrastructure',
    summary: 'Schools, clinics, parks, pumps, and neighbors start doing work the budget cannot spell.'
  },
  {
    id: 'money-confidence',
    name: 'Money Holds Together',
    goal: 'Reach 65 monetary trust and 60 bank stability.',
    rewardLabel: '+$220, +5 liquidity',
    condition: ({ stats }) => stats.monetaryTrust >= 65 && stats.bankStability >= 60,
    reward: { money: 220, liquidity: 5 },
    headline: 'Money Holds Still Long Enough to Be Useful',
    summary: 'Creditors, farmers, and shopkeepers briefly agree that a dollar means something.'
  },
  {
    id: 'anti-shadow',
    name: 'Streetlight Republic',
    goal: 'Keep corruption and shadow economy below 20 after 1890.',
    rewardLabel: '+6 trust, +4 monetary trust',
    condition: ({ year, stats }) => year >= 1890 && stats.corruption < 20 && stats.shadowEconomy < 20,
    reward: { trust: 6, monetaryTrust: 4 },
    headline: 'Streetlights Make the Machine Squint',
    summary: 'The town is not pure, but enough business happens in daylight to matter.'
  },
  {
    id: 'public-machinery',
    name: 'Public Machinery',
    goal: 'Complete 3 civic projects.',
    rewardLabel: '+6 resilience, +4 innovation',
    condition: ({ state }) => (state.completedProjects ?? []).length >= 3,
    reward: { resilience: 6, innovation: 4 },
    headline: 'Public Machinery Begins to Compound',
    summary: 'Codes, pipes, audits, wires, and compacts begin acting like one machine.'
  },
  {
    id: 'modern-town',
    name: 'Modern Town',
    goal: 'Reach 900 people and 45 innovation.',
    rewardLabel: '+$500, +6 trade confidence',
    condition: ({ state, stats }) => state.population >= 900 && stats.innovation >= 45,
    reward: { money: 500, tradeConfidence: 6 },
    headline: 'Modern Town Discovered Under Smoke and Paperwork',
    summary: 'The settlement becomes too complicated to run on memory, charm, or one angry clerk.'
  }
];

export const EVENT_DECK = [
  {
    id: 'bank-panic',
    headline: 'Bank Credit Fuels Main Street Boom; Ledger Begins Sweating',
    summary: 'Depositors discovered that confidence works best when nobody tries to redeem it at once.',
    condition: ({ state, stats }) => stats.bankStability < 45 && (stats.credit > 58 || state.debt > 1900),
    effect: { money: -260, trust: -8, monetaryTrust: -10, liquidity: -12, bankStability: -8, credit: -10 }
  },
  {
    id: 'gold-drain',
    headline: 'Gold Men Praise Stability, Farmers Ask If Stability Can Pull a Plow',
    summary: 'Hard money pleased outside creditors and starved local expansion at the same time.',
    condition: ({ state, stats }) => state.doctrines.money === 'hardMoney' && (state.debt > 1500 || stats.liquidity < 45),
    effect: { money: -110, trust: -3, liquidity: -8, credit: -5, monetaryTrust: 3 }
  },
  {
    id: 'silver-fever',
    headline: 'Silver Fever Reaches Farms Before It Reaches Bankers',
    summary: 'Debtors cheered easier money while downtown bankers practiced grim faces.',
    condition: ({ state, counts }) => state.doctrines.money === 'bimetal' && counts.farm > 1,
    effect: { money: 140, trust: 2, inflation: 7, credit: 4, tradeConfidence: -5 }
  },
  {
    id: 'greenback-fight',
    headline: 'Council Prints Confidence, Confidence Declines to Appear',
    summary: 'Paper money kept public works moving and gave hard-money factions something to shout about.',
    condition: ({ state }) => state.doctrines.money === 'greenbacks' && (state.policies.publicWorks === 'aggressive' || state.debt > 1600),
    effect: { money: 160, inflation: 9, monetaryTrust: -7, trust: -3 }
  },
  {
    id: 'company-scrip-scandal',
    headline: 'Company Scrip Accepted Everywhere, Provided Everywhere Is the Company Store',
    summary: 'The mill payroll became a private currency, and the union hall suddenly had excellent attendance.',
    condition: ({ state, counts }) => state.doctrines.money === 'companyScrip' && (counts.factory > 1 || counts.unionHall > 0),
    effect: { money: 150, corruption: 6, trust: -7, monetaryTrust: -8 }
  },
  {
    id: 'bond-default-scare',
    headline: 'Bond-Funded Dam Opens; Future Taxpayers Asked to Enjoy the View',
    summary: 'The infrastructure worked. The debt service also worked, unfortunately.',
    condition: ({ state, stats }) => (state.doctrines.money === 'municipalBonds' || state.debt > 2600) && stats.debtBurden > 55,
    effect: { trust: -7, monetaryTrust: -6, money: -180, corruption: 2 }
  },
  {
    id: 'counterfeit-scrip',
    headline: 'Emergency Scrip Keeps Bread Moving, Outsiders Call It Fancy Wallpaper',
    summary: 'Local paper kept shops open while counterfeiters treated civic need as an invitation.',
    condition: ({ state, stats }) => state.doctrines.money === 'localScrip' || (stats.liquidity < 35 && stats.monetaryTrust < 45),
    effect: { liquidity: 8, tradeConfidence: -10, monetaryTrust: -8, corruption: 6, shadow: 5 }
  },
  {
    id: 'speculation-boom',
    headline: 'Speculation Boom Makes Every Empty Lot Feel Underpriced',
    summary: 'Loose credit turned mud into opportunity and opportunity into leverage.',
    condition: ({ state, stats }) => state.doctrines.money === 'bankCredit' && state.policies.banking === 'speculative' && stats.bankStability > 45,
    effect: { money: 260, credit: 10, inflation: 6, bankStability: -6, corruption: 2 }
  },
  {
    id: 'speculation-bust',
    headline: 'Speculation Bust Discovers Buildings Still Need Tenants',
    summary: 'The boom stopped, but the debt had already taken off its coat.',
    condition: ({ state, stats }) => state.doctrines.money === 'bankCredit' && stats.bankStability < 48 && stats.inflation > 45,
    effect: { money: -330, trust: -8, credit: -12, bankStability: -9, monetaryTrust: -7 }
  },
  {
    id: 'ac-panic',
    headline: 'AC Lines Reach the Ridge, Local Paper Requests Calm',
    summary: 'New wires brought power and rumors in equal measure. Education and a steady press kept the panic manageable.',
    condition: ({ state, stats }) => state.doctrines.electric === 'ac' && stats.education < 24 && stats.trust < 58,
    effect: { trust: -6, corruption: 1 }
  },
  {
    id: 'substation-failure',
    headline: 'Substation Failure Sends Half the Town Back to Lamps',
    summary: 'A brittle grid exposed every unpaid maintenance bill at once.',
    condition: ({ state, stats }) => state.doctrines.electric !== 'dc' && stats.powerReliability < 0.92 && stats.resilience < 42,
    effect: { money: -160, trust: -5, resilience: -3 }
  },
  {
    id: 'dc-spaghetti',
    headline: 'DC Spaghetti Strangles Expansion Committee',
    summary: 'Local current kept early blocks steady, then asked for a plant on every corner.',
    condition: ({ state, stats }) => state.doctrines.electric === 'dc' && stats.population > 900,
    effect: { money: -110, trust: -2 }
  },
  {
    id: 'coal-smoke',
    headline: 'Coal Plant Doubles Output, Sun Files Complaint',
    summary: 'The mills cheered and the clinic coughed. Output has a smell.',
    condition: ({ counts, stats }) => counts.coalPlant > 0 && stats.pollution > 42,
    effect: { health: -6, trust: -3 }
  },
  {
    id: 'mine-strike',
    headline: 'Mine Strike Tightens the Town Belt',
    summary: 'Heavy industry found out that workers are also an engine.',
    condition: ({ counts, state }) => (counts.factory + counts.coalPlant + counts.dieselDepot) >= 4 && state.policies.labor === 'suppress',
    effect: { money: -180, trust: -6, freight: -6 }
  },
  {
    id: 'gasoline-fire',
    headline: 'Gasoline Depot Turns Shortcut Into Bonfire',
    summary: 'Flexible mobility proved very committed to combustion.',
    condition: ({ counts, stats }) => counts.gasolineDepot > 0 && stats.fireRisk > 38,
    effect: { money: -220, trust: -5, health: -3 }
  },
  {
    id: 'diesel-winter',
    headline: 'Diesel Saves the Harvest, Residents Request New Lungs',
    summary: 'The trucks did not sing, but they arrived when the horses did not.',
    condition: ({ state, counts }) => state.doctrines.transport === 'diesel' && (counts.farm + counts.dieselDepot) >= 2,
    effect: { money: 120, resilience: 5, pollution: 2 }
  },
  {
    id: 'fuel-shortage',
    headline: 'Fuel Shortage Turns Progress Into a Queue',
    summary: 'The town learned that mobility is not the same thing as independence.',
    condition: ({ stats }) => stats.fuelDependency > 50 && stats.resilience < 55,
    effect: { money: -160, freight: -8, trust: -4 }
  },
  {
    id: 'hydro-flood',
    headline: 'Hydro Works Flexes, River Reminds Council Who Owns the Valley',
    summary: 'Clean power came with geography attached.',
    condition: ({ counts }) => counts.hydroPlant > 0,
    effect: { money: -120, resilience: -2, powerSupply: 10 }
  },
  {
    id: 'temperance-campaign',
    headline: 'Temperance League Counts Saloons, Discovers Arithmetic',
    summary: 'The moral engine is warming up in the church basement.',
    condition: ({ counts, state }) => counts.saloon > 1 && state.policies.alcohol !== 'prohibition',
    effect: { trust: -2, shadow: 2 }
  },
  {
    id: 'prohibition-backfire',
    headline: 'Council Bans Saloons, Accidentally Invents Speakeasies',
    summary: 'The visible vice went down. The invisible machinery got organized.',
    condition: ({ state }) => state.policies.alcohol === 'prohibition',
    effect: { shadow: 9, corruption: 5, money: -90 }
  },
  {
    id: 'speakeasy-boom',
    headline: 'Basements Become Boomtowns After Dark',
    summary: 'The shadow economy discovered music, cash, and friendly inspectors.',
    condition: ({ counts, stats }) => counts.speakeasy > 0 || stats.shadowEconomy > 45,
    effect: { money: 90, shadow: 5, corruption: 4, trust: -2 }
  },
  {
    id: 'newspaper-scandal',
    headline: 'Gazette Finds Ledger With Too Many Erasures',
    summary: 'Corruption converts public money into private advantage until ink converts it into scandal.',
    condition: ({ stats, state }) => stats.corruption > 48 || state.policies.media === 'sensational',
    effect: { trust: -8, corruption: -4 }
  },
  {
    id: 'bond-panic',
    headline: 'Bond Buyers Ask If Town Hall Has a Basement Full of Cash',
    summary: 'Debt built roads faster than confidence could catch up.',
    condition: ({ state }) => state.debt > 2300,
    effect: { money: -180, trust: -6, corruption: 2 }
  },
  {
    id: 'public-works-triumph',
    headline: 'Public Works Bond Passes; Streets Become Roads Instead of Suggestions',
    summary: 'Taxes became culverts, culverts became trust, and the mud briefly lost.',
    condition: ({ state, counts }) => state.policies.publicWorks === 'aggressive' && counts.publicWorks > 0,
    effect: { trust: 7, resilience: 7, money: -80 }
  },
  {
    id: 'factory-accident',
    headline: 'Factory Accident Converts Loose Policy Into Reform Speech',
    summary: 'The machinery was efficient right up to the part where people had names.',
    condition: ({ state, counts, stats }) => state.policies.regulation === 'loose' && counts.factory > 1 && stats.fireRisk > 30,
    effect: { health: -7, trust: -7, money: -140 }
  },
  {
    id: 'union-strike',
    headline: 'Union Strike Halts Whistles, Starts Speeches',
    summary: 'Production paused while the town remembered wages are also infrastructure.',
    condition: ({ state, counts, stats }) => counts.unionHall > 0 && stats.industrialPressure > 38 && state.policies.labor !== 'support',
    effect: { money: -150, trust: -3 }
  },
  {
    id: 'bank-boom',
    headline: 'Bank Boom Lends Tomorrow to Today',
    summary: 'Credit turned ambition into foundations and risk into fine print.',
    condition: ({ counts }) => counts.bank > 0,
    effect: { money: 170, trust: 2, corruption: 1 }
  },
  {
    id: 'rumor-wave',
    headline: 'Rumor Wave Reaches Main Street Before the Facts',
    summary: 'Low education and loud papers make excellent rails for fear.',
    condition: ({ state, stats }) => stats.education < 20 && stats.trust < 50 && state.policies.media !== 'independent',
    effect: { trust: -6, shadow: 3 }
  },
  {
    id: 'machine-shop-breakthrough',
    headline: 'Machine Shop Builds Part Nobody Can Name, Everyone Needs',
    summary: 'A practical invention improves repairs, output, and the town habit of calling luck by a technical name.',
    condition: ({ counts, stats }) => counts.machineShop > 0 && stats.innovation > 32,
    effect: { money: 180, innovation: 5, resilience: 2, freight: 4 }
  },
  {
    id: 'grain-market-rally',
    headline: 'Grain Elevator Turns Harvest Into Negotiating Position',
    summary: 'Storage and rail timing let farmers sell with less desperation and more arithmetic.',
    condition: ({ counts, stats }) => counts.grainElevator > 0 && stats.food > 120,
    effect: { money: 150, tradeConfidence: 4, trust: 2, inflation: -2 }
  },
  {
    id: 'courthouse-crackdown',
    headline: 'Courthouse Makes Graft Walk Down Main Street in Daylight',
    summary: 'The machine still turns, but the gears are slightly less hidden and much more embarrassed.',
    condition: ({ counts, stats }) => counts.courthouse > 0 && stats.corruption > 24,
    effect: { corruption: -7, trust: 4, shadow: -2 }
  },
  {
    id: 'telegraph-rumor-check',
    headline: 'Telegraph Beats Rumor to the Depot by Six Minutes',
    summary: 'Fast dispatches help bankers, editors, and nervous shopkeepers agree on one reality for a while.',
    condition: ({ counts, state }) => counts.telegraphOffice > 0 && state.policies.media !== 'sensational',
    effect: { trust: 3, monetaryTrust: 3, tradeConfidence: 5 }
  },
  {
    id: 'insurance-rating-fight',
    headline: 'Insurance Men Rate Fire Risk, Saloons Rate Insurance Men Poorly',
    summary: 'Premiums make danger visible before flames do, which is useful and unpopular.',
    condition: ({ counts, stats }) => counts.insuranceOffice > 0 && stats.fireRisk > 26,
    effect: { fireRisk: -5, money: -70, bankStability: 4, trust: 1 }
  },
  {
    id: 'settlement-house-truce',
    headline: 'Settlement House Turns Angry Queue Into Committee',
    summary: 'Practical care and translation work lower street heat before the sheriff gets creative.',
    condition: ({ counts, stats }) => counts.settlementHouse > 0 && (stats.shadowEconomy > 24 || stats.trust < 55),
    effect: { trust: 5, health: 3, shadow: -4 }
  },
  {
    id: 'radio-market-mood',
    headline: 'Radio Carries Prices, Songs, and Mildly Improved Confidence',
    summary: 'The town hears itself in public and briefly mistakes coordination for destiny.',
    condition: ({ counts }) => counts.radioStation > 0,
    effect: { tradeConfidence: 5, trust: 3, innovation: 3, powerDemand: 2 }
  },
  {
    id: 'civic-project-dividend',
    headline: 'Civic Projects Compound, Accountants Discover a Feeling',
    summary: 'Fire codes, audits, wires, and pipes begin working together like someone planned them.',
    condition: ({ state, stats }) => (state.completedProjects ?? []).length >= 3 && stats.resilience > 55,
    effect: { trust: 5, resilience: 4, maintenance: 3, corruption: -2 }
  }
];

export const ENDINGS = [
  {
    id: 'sleepy-charter-town',
    title: 'Sleepy Charter Town',
    condition: (score) => score.development < 30,
    summary: 'The charter survived, but mostly as a polite promise. The town kept its books cleaner than its ambitions.'
  },
  {
    id: 'clean-power-republic',
    title: 'Clean Power Republic',
    condition: (score) => score.power >= 70 && score.pollution >= 70 && score.trust >= 60,
    summary: 'Your town turned wires, rivers, schools, and civic trust into a durable public machine.'
  },
  {
    id: 'diesel-freight-empire',
    title: 'Diesel Freight Empire',
    condition: (score) => score.freight >= 78 && score.economy >= 60 && score.pollution < 62,
    summary: 'Freight won the argument. The town moves anything, anywhere, and coughs while doing it.'
  },
  {
    id: 'coal-machine-town',
    title: 'Coal Machine Town',
    condition: (score) => score.economy >= 70 && score.pollution < 50 && score.health < 60,
    summary: 'The mills roared, the treasury smiled, and the clinic never got a quiet day.'
  },
  {
    id: 'dc-village-network',
    title: 'DC Village Network',
    condition: (score, state) => state.doctrines.electric === 'dc' && score.trust >= 62 && score.population < 55,
    summary: 'Small districts stayed bright and neighborly, even if the horizon remained suspiciously close.'
  },
  {
    id: 'gasoline-sprawl-boomtown',
    title: 'Gasoline Sprawl Boomtown',
    condition: (score, state) => state.doctrines.transport === 'gasoline' && score.population >= 62,
    summary: 'The town learned to move fast, spread out, and keep a bucket near every shed.'
  },
  {
    id: 'progressive-public-works',
    title: 'Progressive Public Works Town',
    condition: (score, state) => state.policies.publicWorks === 'aggressive' && score.resilience >= 70 && score.trust >= 60,
    summary: 'The public ledger became roads, pumps, schools, clinics, and a tax bill people almost forgave.'
  },
  {
    id: 'prohibition-noir',
    title: 'Prohibition Noir Town',
    condition: (score) => score.shadow < 45 || score.corruption < 45,
    summary: 'The law closed the front door and the town built a better back door.'
  },
  {
    id: 'company-machine-town',
    title: 'Company Machine Town',
    condition: (score) => score.economy >= 70 && score.trust < 48,
    summary: 'Output was excellent. Legitimacy was outsourced and never delivered.'
  },
  {
    id: 'hard-money-fortress',
    title: 'Hard Money Fortress',
    condition: (score, state) => state.doctrines.money === 'hardMoney' && score.monetaryTrust >= 70 && score.inflation >= 75 && score.population < 62,
    summary: 'Prices stayed respectable, bankers slept well, and expansion kept asking permission.'
  },
  {
    id: 'credit-boomtown',
    title: 'Credit Boomtown',
    condition: (score, state, stats) => state.doctrines.money === 'bankCredit' && score.population >= 60 && stats.debtBurden >= 35,
    summary: 'Credit built the town fast enough that the ledger had to jog behind it.'
  },
  {
    id: 'scrip-mill-republic',
    title: 'Scrip Mill Republic',
    condition: (score, state) => state.doctrines.money === 'companyScrip' && score.economy >= 62 && score.trust < 58,
    summary: 'The mills paid, the company store accepted, and civic legitimacy stood outside with empty pockets.'
  },
  {
    id: 'greenback-public-works-state',
    title: 'Greenback Public Works State',
    condition: (score, state) => state.doctrines.money === 'greenbacks' && score.resilience >= 62 && score.inflation < 70,
    summary: 'Paper money poured itself into pumps, roads, schools, and arguments about whether confidence is printable.'
  },
  {
    id: 'monetary-chaos-town',
    title: 'Monetary Chaos Town',
    condition: (score) => score.monetaryTrust < 45 && score.inflation < 45 && score.bankStability < 50,
    summary: 'Money became rumor with denominations. Trade survived by improvising and trusting nobody for long.'
  },
  {
    id: 'civic-engine-commonwealth',
    title: 'Civic Engine Commonwealth',
    condition: (score, state, stats) => (state.completedProjects ?? []).length >= 4 && stats.civicCoverage >= 45 && score.trust >= 65,
    summary: 'The town built pipes, codes, courts, schools, and wires until civilization became a working apparatus.'
  },
  {
    id: 'wire-and-credit-republic',
    title: 'Wire and Credit Republic',
    condition: (score, state, stats) => stats.tradeConfidence >= 78 && stats.bankStability >= 70 && score.innovation >= 58,
    summary: 'Information, credit, and cautious ambition moved faster than horses and slower than panic.'
  },
  {
    id: 'balanced-republic',
    title: 'Balanced Republic',
    condition: () => true,
    summary: 'No single engine ruled the town. Steel, ink, law, debt, and weather all got a vote.'
  }
];

export const DEFAULT_POLICIES = {
  taxRate: 'balanced',
  publicWorks: 'balanced',
  regulation: 'balanced',
  alcohol: 'regulated',
  utility: 'mixed',
  labor: 'tolerate',
  media: 'independent',
  banking: 'balanced'
};

export const DEFAULT_DOCTRINES = {
  electric: 'dc',
  transport: 'horse',
  money: 'hardMoney'
};
