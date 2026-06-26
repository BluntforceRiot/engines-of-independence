import {
  BUILDINGS,
  CHARTERS,
  DEFAULT_DOCTRINES,
  DEFAULT_POLICIES,
  ENDINGS,
  END_YEAR,
  EVENT_DECK,
  GRID_SIZE,
  MILESTONES,
  PROJECTS,
  START_YEAR
} from './data.js';

export const SAVE_KEY = 'engines-of-independence.save.v1';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function createNewState(charterId = 'balanced') {
  const grid = createGrid();
  const charter = CHARTERS[charterId] ?? CHARTERS.balanced;
  const state = {
    version: 2,
    seed: 1880,
    charterId: charter.id,
    monthIndex: 0,
    turn: 0,
    money: 3200,
    debt: 0,
    population: 155,
    trust: 58,
    health: 62,
    corruption: 12,
    shadowEconomy: 8,
    resilience: 42,
    innovation: 12,
    monetaryTrust: 64,
    liquidity: 52,
    credit: 32,
    inflation: 12,
    bankStability: 58,
    tradeConfidence: 58,
    policies: { ...DEFAULT_POLICIES },
    doctrines: { ...DEFAULT_DOCTRINES },
    completedProjects: [],
    completedMilestones: [],
    transientEffects: {},
    selectedBuildingId: 'road',
    grid,
    eventHistory: [
      {
        headline: 'Foundry Creek Files Incorporation Papers',
        summary: 'A town charter, a muddy road, and several overconfident committees agree to become machinery.'
      }
    ],
    lastIssue: {
      headline: 'Foundry Creek Files Incorporation Papers',
      summary: 'A town charter, a muddy road, and several overconfident committees agree to become machinery.'
    },
    gameOver: false,
    collapseReason: ''
  };

  applyCharterSetup(state, charter);

  placeInitial(state, 8, 8, 'townHall');
  placeInitial(state, 8, 9, 'road');
  placeInitial(state, 8, 10, 'road');
  placeInitial(state, 9, 9, 'mainStreet');
  placeInitial(state, 7, 9, 'residential');
  placeInitial(state, 7, 10, 'residential');
  placeInitial(state, 10, 9, 'farm');
  placeInitial(state, 11, 9, 'farm');

  return state;
}

function applyCharterSetup(state, charter) {
  const setup = charter.setup ?? {};
  for (const [key, value] of Object.entries(setup)) {
    if (key === 'policies') {
      state.policies = { ...state.policies, ...value };
    } else if (key === 'doctrines') {
      state.doctrines = { ...state.doctrines, ...value };
    } else if (key in state) {
      state[key] = value;
    }
  }
  state.lastIssue = {
    headline: `${charter.name} Filed at Town Hall`,
    summary: charter.description
  };
  state.eventHistory = [state.lastIssue];
}

function createGrid() {
  const grid = [];
  for (let y = 0; y < GRID_SIZE; y += 1) {
    const row = [];
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const riverX = 3 + Math.round(Math.sin(y * 0.65));
      const isWater = x === riverX || (y > 11 && x === riverX + 1);
      row.push({ terrain: isWater ? 'water' : 'land', buildingId: null });
    }
    grid.push(row);
  }
  return grid;
}

function placeInitial(state, x, y, buildingId) {
  state.grid[y][x] = { terrain: 'land', buildingId };
}

export function getDateLabel(state) {
  const year = START_YEAR + Math.floor(state.monthIndex / 12);
  return `${MONTHS[state.monthIndex % 12]} ${year}`;
}

export function getYear(state) {
  return START_YEAR + Math.floor(state.monthIndex / 12);
}

export function getCell(state, x, y) {
  if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) {
    return undefined;
  }
  return state.grid[y][x];
}

export function canBuild(state, x, y, buildingId) {
  const cell = getCell(state, x, y);
  const building = BUILDINGS[buildingId];
  if (!cell || !building) {
    return { ok: false, reason: 'No such plot or building.' };
  }
  if (cell.buildingId) {
    return { ok: false, reason: 'That plot already has machinery on it.' };
  }
  if (cell.terrain === 'water' && !building.requiresWater) {
    return { ok: false, reason: 'Only water works or hydro can use the river.' };
  }
  if (cell.terrain === 'land' && building.requiresWater && !isNearWater(state, x, y)) {
    return { ok: false, reason: `${building.name} must touch the river.` };
  }
  if (building.unlock && !building.unlock(state)) {
    return { ok: false, reason: getBuildingUnlockReason(state, buildingId) };
  }
  const unlockReason = getBuildingUnlockReason(state, buildingId);
  if (unlockReason) {
    return { ok: false, reason: unlockReason };
  }
  const cost = getBuildingCost(state, buildingId);
  if (state.money < cost) {
    return { ok: false, reason: `Needs $${cost}, but the treasury is short.` };
  }
  return { ok: true, reason: '' };
}

export function placeBuilding(state, x, y, buildingId) {
  const check = canBuild(state, x, y, buildingId);
  if (!check.ok) {
    return { state, ok: false, message: check.reason };
  }
  const next = cloneState(state);
  next.grid[y][x] = { ...next.grid[y][x], terrain: next.grid[y][x].terrain, buildingId };
  next.money -= getBuildingCost(state, buildingId);
  next.lastIssue = {
    headline: `${BUILDINGS[buildingId].name} Added to the Town Machine`,
    summary: `${BUILDINGS[buildingId].description} The ledger records the cost before voters can improve the sentence.`
  };
  next.eventHistory = pushEvent(next.eventHistory, next.lastIssue);
  const milestoneResult = awardMilestones(next);
  return {
    state: milestoneResult.state,
    ok: true,
    message: milestoneResult.awarded.length
      ? `${BUILDINGS[buildingId].name} built. Milestone: ${milestoneResult.awarded.at(-1).name}.`
      : `${BUILDINGS[buildingId].name} built.`
  };
}

export function getBuildingCost(state, buildingId) {
  const building = BUILDINGS[buildingId];
  let cost = building.cost;
  if (state.policies.utility === 'private' && ['acPlant', 'dcPlant', 'powerLine', 'substation'].includes(buildingId)) {
    cost *= 0.86;
  }
  if (state.policies.publicWorks === 'aggressive' && ['road', 'publicWorks', 'waterPump'].includes(buildingId)) {
    cost *= 0.9;
  }
  if (state.policies.regulation === 'strict' && ['factory', 'coalPlant', 'gasolineDepot', 'dieselDepot'].includes(buildingId)) {
    cost *= 1.12;
  }
  return Math.round(cost);
}

export function isNearWater(state, x, y) {
  const offsets = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [0, 0]
  ];
  return offsets.some(([dx, dy]) => getCell(state, x + dx, y + dy)?.terrain === 'water');
}

export function cloneState(state) {
  return {
    ...state,
    policies: { ...state.policies },
    doctrines: { ...state.doctrines },
    completedProjects: [...(state.completedProjects ?? [])],
    completedMilestones: [...(state.completedMilestones ?? [])],
    transientEffects: { ...(state.transientEffects ?? {}) },
    grid: state.grid.map((row) => row.map((cell) => ({ ...cell }))),
    eventHistory: state.eventHistory.map((event) => ({ ...event })),
    lastIssue: { ...state.lastIssue }
  };
}

export function getBuildingUnlockReason(state, buildingId) {
  const building = BUILDINGS[buildingId];
  if (!building) {
    return 'No such building.';
  }
  if (building.unlock && !building.unlock(state)) {
    return `${building.name} is not unlocked yet.`;
  }
  if (building.minYear && getYear(state) < building.minYear) {
    return `${building.name} unlocks in ${building.minYear}.`;
  }
  if (building.minInnovation && state.innovation < building.minInnovation) {
    return `${building.name} needs ${building.minInnovation} innovation.`;
  }
  return '';
}

export function canCompleteProject(state, projectId) {
  const project = PROJECTS[projectId];
  if (!project) {
    return { ok: false, reason: 'No such civic project.' };
  }
  if ((state.completedProjects ?? []).includes(projectId)) {
    return { ok: false, reason: 'Already completed.' };
  }
  if (project.minYear && getYear(state) < project.minYear) {
    return { ok: false, reason: `Unlocks in ${project.minYear}.` };
  }
  if (project.minInnovation && state.innovation < project.minInnovation) {
    return { ok: false, reason: `Needs ${project.minInnovation} innovation.` };
  }
  if (state.money < project.cost) {
    return { ok: false, reason: `Needs ${formatMoney(project.cost)}.` };
  }
  return { ok: true, reason: '' };
}

export function completeProject(state, projectId) {
  const check = canCompleteProject(state, projectId);
  if (!check.ok) {
    return { state, ok: false, message: check.reason };
  }
  const project = PROJECTS[projectId];
  const next = cloneState(state);
  next.completedProjects = [...(next.completedProjects ?? []), projectId];
  next.money -= project.cost;
  next.debt += project.debt ?? 0;
  next.lastIssue = {
    headline: project.headline,
    summary: project.summary
  };
  next.eventHistory = pushEvent(next.eventHistory, next.lastIssue);
  const milestoneResult = awardMilestones(next);
  return {
    state: milestoneResult.state,
    ok: true,
    message: milestoneResult.awarded.length
      ? `${project.name} completed. Milestone: ${milestoneResult.awarded.at(-1).name}.`
      : `${project.name} completed.`
  };
}

export function awardMilestones(state) {
  let next = cloneState(state);
  const awarded = [];
  const completed = new Set(next.completedMilestones ?? []);
  const stats = calculateStats(next);
  const counts = stats.counts ?? countBuildings(next);
  const year = getYear(next);

  for (const milestone of MILESTONES) {
    if (completed.has(milestone.id)) {
      continue;
    }
    if (!milestone.condition({ state: next, stats, counts, year })) {
      continue;
    }
    completed.add(milestone.id);
    next.completedMilestones = [...completed];
    applyStateEffects(next, milestone.reward ?? {});
    next.lastIssue = {
      headline: milestone.headline,
      summary: milestone.summary
    };
    next.eventHistory = pushEvent(next.eventHistory, next.lastIssue);
    awarded.push(milestone);
  }

  return { state: next, awarded };
}

function applyStateEffects(state, effects) {
  for (const [key, value] of Object.entries(effects)) {
    if (key === 'money' || key === 'debt' || key === 'population') {
      state[key] += value;
    } else if (key === 'shadow') {
      state.shadowEconomy = clamp(state.shadowEconomy + value, 0, 100);
    } else if (key in state && typeof state[key] === 'number') {
      state[key] = clamp(state[key] + value, 0, 100);
    } else {
      state.transientEffects[key] = (state.transientEffects[key] ?? 0) + value;
    }
  }
}

export function setPolicy(state, key, value) {
  const next = cloneState(state);
  next.policies[key] = value;
  next.lastIssue = {
    headline: 'Council Adjusts the Levers',
    summary: `The ${humanize(key)} engine now runs on ${humanize(value)}. Somewhere, a committee feels productive.`
  };
  next.eventHistory = pushEvent(next.eventHistory, next.lastIssue);
  return next;
}

export function setDoctrine(state, key, value) {
  const next = cloneState(state);
  next.doctrines[key] = value;
  next.lastIssue = {
    headline: 'Engine Doctrine Rewritten',
    summary: `${humanize(key)} now follows ${humanize(value)}. The town has converted preference into infrastructure risk.`
  };
  next.eventHistory = pushEvent(next.eventHistory, next.lastIssue);
  return next;
}

export function issueBond(state) {
  const next = cloneState(state);
  const flexiblePaper = ['greenbacks', 'municipalBonds'].includes(next.doctrines.money);
  next.money += flexiblePaper ? 1500 : 1200;
  next.debt += flexiblePaper ? 1650 : 1400;
  next.trust = clamp(next.trust - 2, 0, 100);
  next.liquidity = clamp(next.liquidity + (flexiblePaper ? 8 : 3), 0, 100);
  next.monetaryTrust = clamp(next.monetaryTrust - (next.doctrines.money === 'hardMoney' ? 5 : 2), 0, 100);
  next.inflation = clamp(next.inflation + (next.doctrines.money === 'greenbacks' ? 5 : 1), 0, 100);
  next.lastIssue = {
    headline: 'Council Borrows From the Future, Future Unavailable for Comment',
    summary: 'A bond sale funds immediate construction and adds interest to the town machinery.'
  };
  next.eventHistory = pushEvent(next.eventHistory, next.lastIssue);
  return awardMilestones(next).state;
}

export function calculateStats(state) {
  const counts = countBuildings(state);
  const developedPlots = Object.values(counts).reduce((sum, value) => sum + value, 0);
  const totals = aggregateBuildingEffects(state);
  const transient = state.transientEffects ?? {};
  const projectEffects = aggregateProjectEffects(state);
  const district = calculateDistrictEffects(state);

  let housing = 120 + totals.housing;
  let jobs = 40 + totals.jobs;
  let food = 65 + totals.food;
  // Small baseline covers lamps, muscle, and local mechanical work so the town has room to choose its first real power engine.
  let powerSupply = 24 + totals.powerSupply;
  let powerDemand = Math.max(12, totals.powerDemand + Math.ceil(state.population / 70));
  let freight = 20 + totals.freight;
  let freightDemand = Math.max(12, totals.freightDemand + counts.factory * 8 + Math.ceil(state.population / 95));
  let revenueBase = totals.revenue + state.population * 0.18 + jobs * 0.08;
  let maintenance = totals.maintenance + Math.ceil(state.population / 180);
  let pollution = totals.pollution;
  let fireRisk = 10 + totals.fireRisk;
  let health = state.health + totals.health;
  let trust = state.trust + totals.trust;
  let corruption = state.corruption + totals.corruption;
  let shadowEconomy = state.shadowEconomy + totals.shadow;
  let resilience = state.resilience + totals.resilience;
  let innovation = state.innovation + totals.innovation + totals.education * 0.35;
  let monetaryTrust = state.monetaryTrust + counts.bank * 3 + counts.townHall * 2 + totals.monetaryTrust;
  let liquidity = state.liquidity + counts.bank * 4 + counts.mainStreet * 1.5 + totals.liquidity;
  let credit = state.credit + counts.bank * 8 + counts.factory * 1.2 + counts.residential * 0.8 + totals.credit;
  let inflation = state.inflation + Math.max(0, state.money - 3500) * 0.002 + totals.inflation;
  let bankStability = state.bankStability + counts.bank * 3 + counts.townHall * 1.5 - state.debt * 0.004 + totals.bankStability;
  let tradeConfidence = state.tradeConfidence + counts.railStation * 3 + counts.bank * 2 + totals.freight * 0.04 + totals.tradeConfidence;
  let fuelDependency = totals.fuelDependency;
  let education = totals.education;
  let industrialPressure = counts.factory * 8 + counts.coalPlant * 6 + counts.dieselDepot * 4;

  applyEffects(transient);
  applyEffects(projectEffects);
  applyEffects(district.effects);

  function applyEffects(effects) {
    housing += effects.housing ?? 0;
    jobs += effects.jobs ?? 0;
    food += effects.food ?? 0;
    powerSupply += effects.powerSupply ?? 0;
    powerDemand += effects.powerDemand ?? 0;
    freight += effects.freight ?? 0;
    freightDemand += effects.freightDemand ?? 0;
    revenueBase += effects.revenue ?? 0;
    maintenance += effects.maintenance ?? 0;
    pollution += effects.pollution ?? 0;
    fireRisk += effects.fireRisk ?? 0;
    health += effects.health ?? 0;
    trust += effects.trust ?? 0;
    corruption += effects.corruption ?? 0;
    shadowEconomy += effects.shadow ?? effects.shadowEconomy ?? 0;
    resilience += effects.resilience ?? 0;
    innovation += effects.innovation ?? 0;
    monetaryTrust += effects.monetaryTrust ?? 0;
    liquidity += effects.liquidity ?? 0;
    credit += effects.credit ?? 0;
    inflation += effects.inflation ?? 0;
    bankStability += effects.bankStability ?? 0;
    tradeConfidence += effects.tradeConfidence ?? 0;
    fuelDependency += effects.fuelDependency ?? 0;
    education += effects.education ?? 0;
  }

  const tax = state.policies.taxRate;
  if (tax === 'low') {
    revenueBase *= 0.74;
    trust += 5;
    corruption -= 1;
  } else if (tax === 'high') {
    revenueBase *= 1.34;
    trust -= 7;
    corruption += 3;
    shadowEconomy += 2;
  }

  if (state.policies.publicWorks === 'minimal') {
    maintenance -= 5;
    resilience -= 6;
    health -= 2;
  } else if (state.policies.publicWorks === 'aggressive') {
    maintenance += 18;
    resilience += 13;
    health += 4;
    trust += 3;
  }

  if (state.policies.regulation === 'loose') {
    jobs *= 1.12;
    revenueBase *= 1.12;
    fireRisk += 8;
    pollution += 8;
    health -= 5;
    trust -= 2;
  } else if (state.policies.regulation === 'strict') {
    jobs *= 0.93;
    revenueBase *= 0.94;
    maintenance += 8;
    fireRisk -= 9;
    pollution -= 7;
    health += 6;
    trust += 4;
  }

  if (state.policies.alcohol === 'legal') {
    revenueBase += counts.saloon * 18;
    shadowEconomy += counts.saloon * 2;
    fireRisk += counts.saloon * 1.2;
    trust -= counts.saloon > 2 ? 2 : 0;
  } else if (state.policies.alcohol === 'regulated') {
    revenueBase += counts.saloon * 10;
    shadowEconomy += counts.saloon;
  } else {
    maintenance += 12 + counts.sheriff * 2;
    revenueBase -= counts.saloon * 8;
    shadowEconomy += 10 + counts.speakeasy * 6;
    corruption += 6;
    trust += counts.temperanceHall > 0 ? 2 : -2;
  }

  if (state.policies.utility === 'private') {
    maintenance -= 10;
    revenueBase += 12;
    corruption += 3;
    trust -= powerSupply < powerDemand ? 5 : 1;
  } else if (state.policies.utility === 'public') {
    maintenance += 12;
    trust += powerSupply >= powerDemand ? 5 : -7;
    corruption -= 1;
  }

  if (state.policies.labor === 'suppress') {
    jobs *= 1.07;
    revenueBase *= 1.05;
    trust -= counts.unionHall > 0 ? 7 : 2;
    health -= 2;
  } else if (state.policies.labor === 'support') {
    maintenance += 10;
    revenueBase *= 0.96;
    health += 4;
    trust += 5;
    fireRisk -= 2;
  }

  if (state.policies.media === 'booster') {
    revenueBase *= 1.04;
    trust += pollution < 45 && corruption < 40 ? 3 : -3;
  } else if (state.policies.media === 'sensational') {
    trust -= 3;
    corruption -= 2;
    shadowEconomy += 1;
  } else if (state.policies.media === 'industry') {
    revenueBase *= 1.08;
    jobs *= 1.04;
    corruption += 3;
    trust -= pollution > 50 ? 5 : 1;
  } else {
    trust += 2;
    corruption -= 1;
  }

  if (state.policies.banking === 'cautious') {
    credit -= 8;
    liquidity -= 2;
    bankStability += 10;
    inflation -= 4;
    trust += 1;
  } else if (state.policies.banking === 'speculative') {
    credit += 15;
    liquidity += 7;
    bankStability -= 12;
    inflation += 8;
    corruption += 3;
    revenueBase *= 1.06;
  }

  if (state.doctrines.electric === 'dc') {
    resilience += 3;
    trust += powerSupply >= powerDemand ? 2 : 0;
    if (state.population > 850) {
      maintenance += Math.ceil((state.population - 850) / 55);
      powerSupply *= 0.86;
    }
  } else if (state.doctrines.electric === 'ac') {
    powerSupply *= 1.18;
    innovation += 4;
    resilience += counts.substation > 1 ? 2 : -5;
    trust -= education < 24 ? 4 : 0;
  } else {
    powerSupply *= 1.1;
    maintenance += 8;
    resilience += 6;
    innovation += 5;
  }

  if (state.doctrines.transport === 'horse') {
    freight *= 0.82;
    fuelDependency -= 8;
    pollution -= 2;
  } else if (state.doctrines.transport === 'gasoline') {
    freight += 18 + counts.road * 1.5;
    revenueBase *= 1.05;
    fuelDependency += 18;
    fireRisk += 7;
  } else if (state.doctrines.transport === 'diesel') {
    freight *= 1.22;
    food *= 1.12;
    resilience += 5;
    fuelDependency += 22;
    pollution += 7;
  } else if (state.doctrines.transport === 'rail') {
    freight += 24 + counts.rail * 4 + counts.railStation * 14;
    maintenance += 12;
    pollution += 5;
  } else if (state.doctrines.transport === 'streetcar') {
    trust += 5;
    pollution -= 4;
    powerDemand += 8;
    maintenance += 8;
    freight += counts.streetcar * 4;
  }

  if (state.doctrines.money === 'hardMoney') {
    monetaryTrust += 9;
    tradeConfidence += 10;
    inflation -= 8;
    credit -= 10;
    liquidity -= 6;
    bankStability += 6;
    revenueBase *= 0.97;
  } else if (state.doctrines.money === 'bimetal') {
    credit += 8;
    liquidity += 8;
    food *= 1.06;
    inflation += 9;
    tradeConfidence -= 5;
    trust += counts.farm > 1 ? 3 : 0;
  } else if (state.doctrines.money === 'greenbacks') {
    liquidity += 14;
    credit += 5;
    inflation += 12;
    monetaryTrust -= state.debt > 1600 ? 8 : 3;
    if (state.policies.publicWorks === 'aggressive') {
      resilience += 5;
      revenueBase += 18;
    }
  } else if (state.doctrines.money === 'bankCredit') {
    credit += 18;
    liquidity += 8;
    bankStability -= 8;
    inflation += 6;
    housing *= 1.04;
    jobs *= 1.04;
    revenueBase *= 1.07;
  } else if (state.doctrines.money === 'municipalBonds') {
    liquidity += 10;
    resilience += state.policies.publicWorks === 'aggressive' ? 7 : 3;
    maintenance += 8;
    bankStability -= state.debt > 1800 ? 8 : 2;
    tradeConfidence += 2;
  } else if (state.doctrines.money === 'companyScrip') {
    jobs *= 1.08;
    revenueBase *= 1.08;
    credit += 6;
    monetaryTrust -= 12;
    trust -= counts.unionHall > 0 ? 7 : 4;
    corruption += 7;
    shadowEconomy += 4;
  } else if (state.doctrines.money === 'localScrip') {
    liquidity += 16;
    credit += 4;
    tradeConfidence -= 14;
    monetaryTrust -= 8;
    inflation += 6;
    shadowEconomy += 3;
  }

  const debtBurden = clamp((state.debt / Math.max(350, revenueBase + 180)) * 18, 0, 100);
  if (debtBurden > 45) {
    trust -= (debtBurden - 45) * 0.08;
    bankStability -= (debtBurden - 45) * 0.16;
    monetaryTrust -= (debtBurden - 45) * 0.1;
  }

  if (credit < 35) {
    jobs *= 0.97;
    housing *= 0.98;
    revenueBase *= 0.96;
  } else if (credit > 65) {
    jobs *= 1.03;
    housing *= 1.03;
    revenueBase *= 1.03;
    inflation += 2;
  }

  revenueBase *= 0.88 + clamp(tradeConfidence, 0, 100) / 500;
  revenueBase *= 1 - clamp(inflation - 45, 0, 60) / 450;
  trust -= clamp(inflation - 45, 0, 80) * 0.08;
  monetaryTrust -= clamp(inflation - 40, 0, 80) * 0.12;

  const powerReliability = clamp(powerSupply / Math.max(1, powerDemand), 0, 1.25);
  const freightReliability = clamp(freight / Math.max(1, freightDemand), 0, 1.25);
  const housingRatio = clamp(housing / Math.max(1, state.population), 0, 1.4);
  const jobsRatio = clamp(jobs / Math.max(1, state.population * 0.48), 0, 1.4);
  const foodRatio = clamp(food / Math.max(1, state.population * 0.32), 0, 1.4);

  if (powerReliability < 1) {
    trust -= (1 - powerReliability) * 16;
    revenueBase *= 0.85 + powerReliability * 0.15;
  }
  if (freightReliability < 1) {
    revenueBase *= 0.82 + freightReliability * 0.18;
    trust -= (1 - freightReliability) * 5;
  }

  pollution = clamp(pollution + Math.max(0, fuelDependency - 50) * 0.08, 0, 100);
  fireRisk = clamp(fireRisk - counts.fireStation * 7 - counts.waterPump * 3, 0, 100);
  health = clamp(health - pollution * 0.12 - Math.max(0, fireRisk - 55) * 0.05, 0, 100);
  trust = clamp(trust - corruption * 0.06 - shadowEconomy * 0.05 + Math.max(0, health - 60) * 0.03, 0, 100);
  corruption = clamp(corruption, 0, 100);
  shadowEconomy = clamp(shadowEconomy, 0, 100);
  resilience = clamp(resilience - Math.max(0, fuelDependency - 60) * 0.12 + counts.publicWorks * 2, 0, 100);
  innovation = clamp(innovation, 0, 100);
  monetaryTrust = clamp(monetaryTrust - shadowEconomy * 0.04 - corruption * 0.04, 0, 100);
  liquidity = clamp(liquidity, 0, 100);
  credit = clamp(credit, 0, 100);
  inflation = clamp(inflation, 0, 100);
  bankStability = clamp(bankStability - Math.max(0, credit - 70) * 0.12 + monetaryTrust * 0.04, 0, 100);
  tradeConfidence = clamp(tradeConfidence + monetaryTrust * 0.05 - inflation * 0.06, 0, 100);

  const expenses = Math.max(0, maintenance + state.debt * (0.004 + debtBurden / 20000));
  const revenue = Math.max(0, revenueBase);
  const netIncome = Math.round(revenue - expenses);

  return {
    counts,
    housing: Math.round(housing),
    jobs: Math.round(jobs),
    food: Math.round(food),
    powerSupply: Math.round(powerSupply),
    powerDemand: Math.round(powerDemand),
    powerReliability,
    freight: Math.round(freight),
    freightDemand: Math.round(freightDemand),
    freightReliability,
    fuelDependency: Math.round(clamp(fuelDependency, 0, 100)),
    maintenance: Math.round(maintenance),
    revenue: Math.round(revenue),
    expenses: Math.round(expenses),
    netIncome,
    pollution: Math.round(pollution),
    fireRisk: Math.round(fireRisk),
    health: Math.round(health),
    trust: Math.round(trust),
    corruption: Math.round(corruption),
    shadowEconomy: Math.round(shadowEconomy),
    resilience: Math.round(resilience),
    innovation: Math.round(innovation),
    monetaryTrust: Math.round(monetaryTrust),
    liquidity: Math.round(liquidity),
    credit: Math.round(credit),
    inflation: Math.round(inflation),
    debtBurden: Math.round(debtBurden),
    bankStability: Math.round(bankStability),
    tradeConfidence: Math.round(tradeConfidence),
    education: Math.round(education),
    industrialPressure: Math.round(industrialPressure),
    roadAccess: district.roadAccess,
    civicCoverage: district.civicCoverage,
    industrialConflict: district.industrialConflict,
    districtSynergy: district.districtSynergy,
    developedPlots,
    completedProjects: (state.completedProjects ?? []).length,
    completedMilestones: (state.completedMilestones ?? []).length,
    housingRatio,
    jobsRatio,
    foodRatio
  };
}

function aggregateBuildingEffects(state) {
  const totals = {
    housing: 0,
    jobs: 0,
    food: 0,
    powerSupply: 0,
    powerDemand: 0,
    freight: 0,
    freightDemand: 0,
    revenue: 0,
    maintenance: 0,
    pollution: 0,
    fireRisk: 0,
    health: 0,
    trust: 0,
    corruption: 0,
    shadow: 0,
    resilience: 0,
    innovation: 0,
    education: 0,
    fuelDependency: 0,
    monetaryTrust: 0,
    liquidity: 0,
    credit: 0,
    inflation: 0,
    bankStability: 0,
    tradeConfidence: 0
  };
  forEachBuilding(state, (buildingId) => {
    const effects = BUILDINGS[buildingId]?.effects ?? {};
    for (const [key, value] of Object.entries(effects)) {
      totals[key] = (totals[key] ?? 0) + value;
    }
  });
  return totals;
}

function aggregateProjectEffects(state) {
  const totals = {};
  for (const projectId of state.completedProjects ?? []) {
    const effects = PROJECTS[projectId]?.effects ?? {};
    addEffects(totals, effects);
  }
  return totals;
}

function calculateDistrictEffects(state) {
  const effects = {};
  let developed = 0;
  let roadAccessCount = 0;
  let civicCoverageCount = 0;
  let industrialConflict = 0;
  let districtSynergy = 0;

  forEachBuilding(state, (buildingId, _cell, x, y) => {
    if (buildingId === 'road' || buildingId === 'rail' || buildingId === 'powerLine') {
      return;
    }
    developed += 1;
    const adjacent = getNearbyBuildingIds(state, x, y, 1);
    const nearby = getNearbyBuildingIds(state, x, y, 2);
    const hasAccess = hasAny(adjacent, ['road', 'rail', 'railStation', 'streetcar']);
    const hasCivicCare = hasAny(nearby, ['park', 'school', 'library', 'clinic', 'settlementHouse', 'townHall']);
    const hasIndustryConflict = hasAny(nearby, ['factory', 'coalPlant', 'gasolineDepot', 'dieselDepot']);

    if (hasAccess) {
      roadAccessCount += 1;
      addEffects(effects, { freight: 0.8, revenue: 1.1, maintenance: 0.1 });
    } else {
      addEffects(effects, { trust: -0.45, freightDemand: 0.35, maintenance: 0.4 });
    }

    if (buildingId === 'residential') {
      if (hasCivicCare) {
        civicCoverageCount += 1;
        addEffects(effects, { trust: 1.6, health: 1.2, housing: 5 });
      }
      if (hasIndustryConflict) {
        industrialConflict += 1;
        addEffects(effects, { trust: -1.4, health: -1.3, fireRisk: 1.8, pollution: 1.3 });
      }
      if (hasAny(adjacent, ['mainStreet'])) {
        addEffects(effects, { housing: 5, revenue: 0.8 });
      }
    }

    if (buildingId === 'mainStreet') {
      if (hasAny(nearby, ['bank', 'telegraphOffice', 'newspaper', 'townHall', 'courthouse'])) {
        districtSynergy += 1;
        addEffects(effects, { revenue: 5, tradeConfidence: 2, monetaryTrust: 0.6 });
      }
      if (hasAny(adjacent, ['road', 'streetcar'])) {
        addEffects(effects, { jobs: 2, revenue: 2 });
      }
    }

    if (buildingId === 'factory' || buildingId === 'machineShop') {
      if (hasAny(nearby, ['rail', 'railStation', 'machineShop', 'powerLine', 'substation'])) {
        districtSynergy += 1;
        addEffects(effects, { jobs: 4, revenue: 6, freight: 5, freightDemand: 1 });
      }
      if (hasAny(nearby, ['unionHall', 'clinic', 'fireStation'])) {
        addEffects(effects, { health: 1.4, trust: 0.9, fireRisk: -1.5 });
      }
    }

    if (buildingId === 'farm') {
      if (hasAny(nearby, ['grainElevator', 'railStation', 'road'])) {
        districtSynergy += 1;
        addEffects(effects, { food: 10, freight: 3, revenue: 2 });
      }
      if (hasAny(nearby, ['dieselDepot'])) {
        addEffects(effects, { food: 8, fuelDependency: 1.5 });
      }
    }

    if (['coalPlant', 'dcPlant', 'acPlant', 'hydroPlant'].includes(buildingId)) {
      if (hasAny(nearby, ['substation', 'powerLine', 'batteryHouse'])) {
        districtSynergy += 1;
        addEffects(effects, { powerSupply: 5, resilience: 1.8, maintenance: 0.8 });
      }
      if (hasAny(nearby, ['waterPump', 'fireStation'])) {
        addEffects(effects, { fireRisk: -1.4, resilience: 1 });
      }
    }

    if (buildingId === 'bank') {
      if (hasAny(nearby, ['courthouse', 'telegraphOffice', 'newspaper', 'insuranceOffice'])) {
        districtSynergy += 1;
        addEffects(effects, { bankStability: 4, monetaryTrust: 2, tradeConfidence: 2, credit: 1 });
      }
    }

    if (buildingId === 'saloon' || buildingId === 'speakeasy') {
      if (hasAny(nearby, ['sheriff', 'courthouse'])) {
        addEffects(effects, { shadow: -2, corruption: -0.8 });
      }
      if (hasAny(nearby, ['mainStreet'])) {
        addEffects(effects, { revenue: 2, fireRisk: 0.8 });
      }
    }

    if (buildingId === 'sewerWorks' || buildingId === 'waterPump') {
      if (hasAny(nearby, ['residential', 'clinic', 'factory'])) {
        civicCoverageCount += 1;
        addEffects(effects, { health: 2, fireRisk: -1.5, resilience: 1.5 });
      }
    }
  });

  return {
    effects,
    roadAccess: developed ? Math.round((roadAccessCount / developed) * 100) : 100,
    civicCoverage: developed ? Math.round((civicCoverageCount / developed) * 100) : 0,
    industrialConflict,
    districtSynergy
  };
}

function getNearbyBuildingIds(state, x, y, radius) {
  const ids = [];
  for (let dy = -radius; dy <= radius; dy += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      if (dx === 0 && dy === 0) {
        continue;
      }
      const distance = Math.abs(dx) + Math.abs(dy);
      if (distance > radius) {
        continue;
      }
      const buildingId = getCell(state, x + dx, y + dy)?.buildingId;
      if (buildingId) {
        ids.push(buildingId);
      }
    }
  }
  return ids;
}

function hasAny(ids, needles) {
  return needles.some((needle) => ids.includes(needle));
}

function addEffects(target, effects) {
  for (const [key, value] of Object.entries(effects)) {
    target[key] = (target[key] ?? 0) + value;
  }
}

export function countBuildings(state) {
  const counts = Object.fromEntries(Object.keys(BUILDINGS).map((key) => [key, 0]));
  forEachBuilding(state, (buildingId) => {
    counts[buildingId] = (counts[buildingId] ?? 0) + 1;
  });
  return counts;
}

function forEachBuilding(state, callback) {
  for (let y = 0; y < state.grid.length; y += 1) {
    for (let x = 0; x < state.grid[y].length; x += 1) {
      const cell = state.grid[y][x];
      if (cell.buildingId) {
        callback(cell.buildingId, cell, x, y);
      }
    }
  }
}

export function resolveNextMonth(state) {
  if (state.gameOver) {
    return state;
  }
  let next = cloneState(state);
  const beforeStats = calculateStats(next);
  next.monthIndex += 1;
  next.turn += 1;

  const growthScore =
    beforeStats.housingRatio * 0.8 +
    beforeStats.jobsRatio * 0.9 +
    beforeStats.foodRatio * 0.4 +
    beforeStats.powerReliability * 0.45 +
    beforeStats.freightReliability * 0.3 +
    beforeStats.credit / 140 +
    beforeStats.liquidity / 170 +
    beforeStats.trust / 80 +
    beforeStats.health / 100 -
    beforeStats.pollution / 130 -
    beforeStats.corruption / 190 -
    beforeStats.inflation / 230;
  const growthRate = clamp((growthScore - 3.1) * 0.012, -0.018, 0.026);
  const populationChange = Math.round(next.population * growthRate);
  next.population = Math.max(40, next.population + populationChange);
  next.money += beforeStats.netIncome;
  next.trust = clamp(beforeStats.trust + (populationChange > 0 ? 0.5 : -1), 0, 100);
  next.health = clamp(beforeStats.health, 0, 100);
  next.corruption = clamp(beforeStats.corruption + (next.policies.taxRate === 'high' ? 0.4 : -0.1), 0, 100);
  next.shadowEconomy = clamp(beforeStats.shadowEconomy + (next.policies.alcohol === 'prohibition' ? 0.9 : -0.1), 0, 100);
  next.resilience = clamp(beforeStats.resilience, 0, 100);
  next.innovation = clamp(beforeStats.innovation + (beforeStats.education > 25 ? 0.45 : 0), 0, 100);
  next.monetaryTrust = clamp(beforeStats.monetaryTrust + (beforeStats.netIncome >= 0 ? 0.3 : -0.6), 0, 100);
  next.liquidity = clamp(beforeStats.liquidity + (beforeStats.netIncome >= 0 ? 0.2 : -0.8), 0, 100);
  next.credit = clamp(beforeStats.credit + (next.policies.banking === 'speculative' ? 0.7 : next.policies.banking === 'cautious' ? -0.35 : 0.1), 0, 100);
  next.inflation = clamp(beforeStats.inflation + (next.doctrines.money === 'hardMoney' ? -0.3 : beforeStats.credit > 62 ? 0.55 : 0.1), 0, 100);
  next.bankStability = clamp(beforeStats.bankStability + (beforeStats.monetaryTrust > 60 ? 0.3 : -0.4), 0, 100);
  next.tradeConfidence = clamp(beforeStats.tradeConfidence + (beforeStats.monetaryTrust > 62 ? 0.25 : -0.35), 0, 100);
  next.transientEffects = {};

  if (next.money < -450) {
    next.money += 900;
    next.debt += 1100;
    next.trust = clamp(next.trust - 3, 0, 100);
    next.eventHistory = pushEvent(next.eventHistory, {
      headline: 'Emergency Bond Keeps the Lights Almost On',
      summary: 'The treasury borrowed because the alternative was explaining arithmetic to angry voters.'
    });
  }

  const event = selectEvent(next, beforeStats);
  if (event) {
    next = applyEvent(next, event);
  } else {
    next.lastIssue = buildRoutineIssue(next, beforeStats, populationChange);
  }

  next.eventHistory = pushEvent(next.eventHistory, next.lastIssue);
  next = awardMilestones(next).state;
  const endReason = getEndReason(next);
  if (endReason) {
    next.collapseReason = endReason;
  }
  next.gameOver = shouldEnd(next);
  if (next.gameOver && !next.ending) {
    next.ending = calculateEnding(next);
  }
  return next;
}

function selectEvent(state, stats) {
  const counts = countBuildings(state);
  const eligible = EVENT_DECK.filter((event) => event.condition({ state, stats, counts }));
  if (!eligible.length) {
    return null;
  }
  const rng = mulberry32(state.seed + state.turn * 1013 + state.monthIndex * 37);
  const roll = rng();
  if (roll < 0.42) {
    return null;
  }
  return eligible[Math.floor(rng() * eligible.length)];
}

function applyEvent(state, event) {
  const next = cloneState(state);
  for (const [key, value] of Object.entries(event.effect ?? {})) {
    if (key === 'money' || key === 'debt') {
      next[key] += value;
    } else if (key === 'shadow') {
      next.shadowEconomy = clamp(next.shadowEconomy + value, 0, 100);
    } else if (key === 'monetaryTrust') {
      next.monetaryTrust = clamp(next.monetaryTrust + value, 0, 100);
    } else if (key === 'liquidity') {
      next.liquidity = clamp(next.liquidity + value, 0, 100);
    } else if (key === 'credit') {
      next.credit = clamp(next.credit + value, 0, 100);
    } else if (key === 'inflation') {
      next.inflation = clamp(next.inflation + value, 0, 100);
    } else if (key === 'bankStability') {
      next.bankStability = clamp(next.bankStability + value, 0, 100);
    } else if (key === 'tradeConfidence') {
      next.tradeConfidence = clamp(next.tradeConfidence + value, 0, 100);
    } else if (key in next) {
      next[key] = clamp(next[key] + value, 0, 100);
    } else {
      next.transientEffects[key] = (next.transientEffects[key] ?? 0) + value;
    }
  }
  next.lastIssue = {
    headline: event.headline,
    summary: event.summary
  };
  return next;
}

function buildRoutineIssue(state, stats, populationChange) {
  const moneyTone = stats.netIncome >= 0 ? 'Treasury Turns Crank, Coins Fall Out' : 'Treasury Crank Squeaks, Coins Decline';
  const growthTone = populationChange > 8 ? 'families arrive with furniture and expectations' : populationChange < 0 ? 'boarding houses discover vacancies' : 'the town holds steady and complains efficiently';
  return {
    headline: moneyTone,
    summary: `This month ${growthTone}. Net ledger: ${formatMoney(stats.netIncome)}. Power ${(stats.powerReliability * 100).toFixed(0)}%, freight ${(stats.freightReliability * 100).toFixed(0)}%, trust ${stats.trust}.`
  };
}

function shouldEnd(state) {
  return getYear(state) > END_YEAR || Boolean(getEndReason(state));
}

function getEndReason(state) {
  if (state.collapseReason) {
    return state.collapseReason;
  }
  if (state.trust <= 4) {
    return 'Public Trust Collapsed';
  }
  if (state.health <= 4) {
    return 'Public Health Collapsed';
  }
  if (state.money < -1500) {
    return 'The Treasury Broke';
  }
  if (state.debt > 6200) {
    return 'Debt Burden Broke the Charter';
  }
  if (state.monetaryTrust <= 4) {
    return 'Money Stopped Meaning Enough';
  }
  if (state.inflation >= 96 && state.bankStability <= 12) {
    return 'Prices Outran the Banks';
  }
  if (state.population < 45) {
    return 'The Town Emptied Out';
  }
  return '';
}

export function calculateEnding(state) {
  const stats = calculateStats(state);
  const score = {
    population: clamp(Math.round((state.population / 2200) * 100), 0, 100),
    economy: clamp(Math.round(((stats.revenue + stats.jobs) / 420) * 100), 0, 100),
    power: clamp(Math.round(stats.powerReliability * 85), 0, 100),
    freight: clamp(Math.round(stats.freightReliability * 85), 0, 100),
    trust: stats.trust,
    health: stats.health,
    pollution: 100 - stats.pollution,
    resilience: stats.resilience,
    corruption: 100 - stats.corruption,
    shadow: 100 - stats.shadowEconomy,
    innovation: stats.innovation,
    monetaryTrust: stats.monetaryTrust,
    inflation: 100 - stats.inflation,
    bankStability: stats.bankStability,
    tradeConfidence: stats.tradeConfidence,
    access: stats.roadAccess,
    civicCoverage: stats.civicCoverage,
    development: clamp(Math.round((stats.developedPlots / 42) * 100 + (state.completedProjects ?? []).length * 5 + (state.completedMilestones ?? []).length * 3), 0, 100)
  };
  const averageScore = Object.values(score).reduce((sum, value) => sum + value, 0) / Object.values(score).length;
  const ambitionFactor = clamp(0.45 + score.development / 140, 0.45, 1);
  const total = Math.round(averageScore * ambitionFactor);
  const archetype = ENDINGS.find((ending) => ending.condition(score, state, stats)) ?? ENDINGS.at(-1);
  const reachedFullEra = getYear(state) > END_YEAR && !state.collapseReason;
  const headline = state.collapseReason
    ? `Ledger Closes Early: ${state.collapseReason}`
    : reachedFullEra
      ? `${archetype.title} Declared After Fifty-Five Years of Machinery`
      : `Ledger Closed Early: ${archetype.title}`;
  return {
    title: archetype.title,
    headline,
    summary: archetype.summary,
    score,
    total,
    stats
  };
}

export function endRun(state) {
  const next = cloneState(state);
  if (getYear(next) <= END_YEAR && !next.collapseReason) {
    next.collapseReason = 'Council Closed the Books';
  }
  next.gameOver = true;
  next.ending = calculateEnding(next);
  return next;
}

export function saveState(state) {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function loadState() {
  const raw = window.localStorage.getItem(SAVE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.grid || !parsed?.policies || !parsed?.doctrines) {
      return null;
    }
    return normalizeState(parsed);
  } catch {
    return null;
  }
}

function normalizeState(parsed) {
  return {
    ...parsed,
    version: 2,
    charterId: parsed.charterId ?? 'balanced',
    completedProjects: Array.isArray(parsed.completedProjects) ? parsed.completedProjects : [],
    completedMilestones: Array.isArray(parsed.completedMilestones) ? parsed.completedMilestones : [],
    transientEffects: parsed.transientEffects ?? {},
    policies: { ...DEFAULT_POLICIES, ...(parsed.policies ?? {}) },
    doctrines: { ...DEFAULT_DOCTRINES, ...(parsed.doctrines ?? {}) },
    eventHistory: Array.isArray(parsed.eventHistory) ? parsed.eventHistory : [],
    lastIssue: parsed.lastIssue ?? {
      headline: 'Recovered Ledger Opens to a Blank Page',
      summary: 'The save file loaded, though its newspaper archives arrived without ceremony.'
    }
  };
}

export function pushEvent(history, event) {
  return [event, ...history].slice(0, 12);
}

export function formatMoney(value) {
  const prefix = value < 0 ? '-' : '';
  return `${prefix}$${Math.abs(Math.round(value)).toLocaleString('en-US')}`;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return function random() {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function humanize(value) {
  return String(value)
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .toLowerCase();
}
