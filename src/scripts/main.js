import { BUILDINGS, CHARTERS, DOCTRINES, MILESTONES, POLICY_GROUPS, PROJECTS } from './data.js';
import { BoardScene } from './scene.js';
import {
  calculateEnding,
  calculateStats,
  canBuild,
  canCompleteProject,
  completeProject,
  createNewState,
  endRun,
  formatMoney,
  getBuildingCost,
  getBuildingUnlockReason,
  getDateLabel,
  getYear,
  issueBond,
  loadState,
  placeBuilding,
  resolveNextMonth,
  saveState,
  setDoctrine,
  setPolicy
} from './simulation.js';

let state = createNewState();
let hoveredTile = { x: 8, y: 8 };
let notice = 'Choose a building, click the map, then advance the newspaper month by month.';
const FIRST_LEDGER_KEY = 'engines-of-independence.firstLedgerDismissed.v1';
const PRESSURE_EFFECT_KEYS = new Set([
  'maintenance',
  'pollution',
  'fireRisk',
  'corruption',
  'shadow',
  'shadowEconomy',
  'inflation',
  'fuelDependency',
  'powerDemand',
  'freightDemand'
]);
const EFFECT_LABELS = {
  housing: 'housing',
  jobs: 'jobs',
  food: 'food',
  powerSupply: 'power',
  powerDemand: 'power demand',
  freight: 'freight',
  freightDemand: 'freight demand',
  revenue: 'revenue',
  maintenance: 'maintenance',
  pollution: 'pollution',
  fireRisk: 'fire risk',
  health: 'health',
  trust: 'trust',
  corruption: 'corruption',
  shadow: 'shadow economy',
  shadowEconomy: 'shadow economy',
  resilience: 'resilience',
  innovation: 'innovation',
  education: 'education',
  fuelDependency: 'fuel dependence',
  monetaryTrust: 'money trust',
  liquidity: 'liquidity',
  credit: 'credit',
  inflation: 'inflation',
  bankStability: 'banking',
  tradeConfidence: 'trade confidence'
};

const els = {
  renderTarget: document.querySelector('#render-target'),
  hudStats: document.querySelector('#hud-stats'),
  buildMenu: document.querySelector('#build-menu'),
  policyControls: document.querySelector('#policy-controls'),
  doctrineControls: document.querySelector('#doctrine-controls'),
  projectControls: document.querySelector('#project-controls'),
  forecastPanel: document.querySelector('#forecast-panel'),
  firstLedger: document.querySelector('#first-ledger'),
  advisorPanel: document.querySelector('#advisor-panel'),
  charterGoals: document.querySelector('#charter-goals'),
  selectedTile: document.querySelector('#selected-tile'),
  newspaperHeadline: document.querySelector('#newspaper-headline'),
  newspaperCopy: document.querySelector('#newspaper-copy'),
  issueDate: document.querySelector('#issue-date'),
  eventFeed: document.querySelector('#event-feed'),
  nextTurnButton: document.querySelector('#next-turn-button'),
  yearButton: document.querySelector('#year-button'),
  bondButton: document.querySelector('#bond-button'),
  endNowButton: document.querySelector('#end-now-button'),
  resetViewButton: document.querySelector('#reset-view-button'),
  focusMapButton: document.querySelector('#focus-map-button'),
  newGameButton: document.querySelector('#new-game-button'),
  saveButton: document.querySelector('#save-button'),
  titleScreen: document.querySelector('#title-screen'),
  charterSelect: document.querySelector('#charter-select'),
  charterBrief: document.querySelector('#charter-brief'),
  howButton: document.querySelector('#how-button'),
  howPanel: document.querySelector('#how-panel'),
  startGameButton: document.querySelector('#start-game-button'),
  loadGameButton: document.querySelector('#load-game-button'),
  confirmScreen: document.querySelector('#confirm-screen'),
  confirmEndButton: document.querySelector('#confirm-end-button'),
  cancelEndButton: document.querySelector('#cancel-end-button'),
  endingScreen: document.querySelector('#ending-screen'),
  endingTitle: document.querySelector('#ending-title'),
  endingSummary: document.querySelector('#ending-summary'),
  endingMeta: document.querySelector('#ending-meta'),
  endingArticle: document.querySelector('#ending-article'),
  endingScores: document.querySelector('#ending-scores'),
  recapFallback: document.querySelector('#recap-fallback'),
  copySummaryButton: document.querySelector('#copy-summary-button'),
  inspectButton: document.querySelector('#inspect-button'),
  restartButton: document.querySelector('#restart-button'),
  toastLayer: document.querySelector('#toast-layer')
};

const board = new BoardScene(
  els.renderTarget,
  (x, y) => handleTileClick(x, y),
  (x, y) => {
    hoveredTile = { x, y };
    renderSelectedTile();
  }
);

bindUi();
renderCharterSelect();
refreshLoadButton();
renderAll();

function bindUi() {
  els.startGameButton.addEventListener('click', () => {
    state = createNewState(els.charterSelect.value);
    notice = "The charter is signed. Open the Town Clerk's First Ledger, then put down roads, housing, jobs, and an engine.";
    hideTitle();
    showToast("Town Clerk's First Ledger opened.", 'good');
    saveState(state);
    renderAll();
  });

  els.loadGameButton.addEventListener('click', () => {
    const loaded = loadState();
    state = loaded ?? createNewState(els.charterSelect.value);
    notice = loaded ? 'Local save restored.' : 'No local save found; a new town has been chartered.';
    hideTitle();
    showToast(loaded ? 'Saved town restored.' : 'No save found; new charter opened.', loaded ? 'good' : '');
    renderAll();
  });

  els.howButton.addEventListener('click', () => {
    els.howPanel.classList.toggle('hidden');
    els.howButton.textContent = els.howPanel.classList.contains('hidden') ? 'HOW THE ENGINES WORK' : 'HIDE ENGINE NOTES';
  });

  els.newGameButton.addEventListener('click', () => {
    if (!window.confirm('Start a new town and overwrite the local save?')) {
      return;
    }
    state = createNewState(state.charterId ?? els.charterSelect.value);
    notice = 'New charter filed. The machinery is clean, for now.';
    saveState(state);
    showToast('New charter filed.', 'good');
    hideEnding();
    renderAll();
  });

  els.saveButton.addEventListener('click', () => {
    saveState(state);
    notice = 'Local save written to this browser.';
    renderAll();
  });

  els.nextTurnButton.addEventListener('click', () => {
    state = resolveNextMonth(state);
    notice = state.gameOver ? 'The final edition is on the press.' : 'A new issue of the Engine Gazette has landed.';
    showPressureToast();
    saveState(state);
    renderAll();
  });

  els.yearButton.addEventListener('click', () => {
    let advanced = 0;
    while (advanced < 12 && !state.gameOver) {
      state = resolveNextMonth(state);
      advanced += 1;
    }
    notice = state.gameOver
      ? `Ran ${advanced} month${advanced === 1 ? '' : 's'} before the final edition hit the press.`
      : 'A year of machinery, weather, money, and argument has passed.';
    showPressureToast();
    saveState(state);
    renderAll();
  });

  els.bondButton.addEventListener('click', () => {
    state = issueBond(state);
    notice = 'Bond funding issued. Public capacity rises; future patience falls.';
    showToast('Public works funded.', 'good');
    saveState(state);
    renderAll();
  });

  els.endNowButton.addEventListener('click', () => {
    els.confirmScreen.classList.remove('hidden');
  });

  els.cancelEndButton.addEventListener('click', () => {
    els.confirmScreen.classList.add('hidden');
  });

  els.confirmEndButton.addEventListener('click', () => {
    state = endRun(state);
    notice = 'The ledger has been closed early.';
    els.confirmScreen.classList.add('hidden');
    showToast('Final edition printed.', 'good');
    saveState(state);
    renderAll();
  });

  els.resetViewButton.addEventListener('click', () => {
    board.resetView();
  });

  els.focusMapButton.addEventListener('click', () => {
    document.body.classList.toggle('focus-map');
    els.focusMapButton.textContent = document.body.classList.contains('focus-map') ? 'Show UI' : 'Focus Map';
  });

  window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'f' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      document.body.classList.toggle('focus-map');
      els.focusMapButton.textContent = document.body.classList.contains('focus-map') ? 'Show UI' : 'Focus Map';
    }
    if (event.key === 'Escape' && document.body.classList.contains('focus-map')) {
      document.body.classList.remove('focus-map');
      els.focusMapButton.textContent = 'Focus Map';
    }
    if (event.key === 'Escape' && !els.confirmScreen.classList.contains('hidden')) {
      els.confirmScreen.classList.add('hidden');
    }
  });

  els.inspectButton.addEventListener('click', () => {
    hideEnding();
  });

  els.copySummaryButton.addEventListener('click', async () => {
    const ending = state.ending ?? calculateEnding(state);
    const summary = buildRunSummary(ending);
    try {
      await navigator.clipboard.writeText(summary);
      els.copySummaryButton.textContent = 'Copied';
      els.recapFallback.classList.add('hidden');
      showToast('Recap copied.', 'good');
      setTimeout(() => {
        els.copySummaryButton.textContent = 'Copy Recap';
      }, 1400);
    } catch {
      els.recapFallback.value = summary;
      els.recapFallback.classList.remove('hidden');
      els.recapFallback.focus();
      els.recapFallback.select();
      showToast('Clipboard blocked. Recap is selectable below.', 'bad');
    }
  });

  els.restartButton.addEventListener('click', () => {
    state = createNewState(state.charterId ?? els.charterSelect.value);
    notice = 'Another town takes its first breath of smoke and ambition.';
    saveState(state);
    hideEnding();
    renderAll();
  });

  els.charterSelect.addEventListener('change', () => {
    renderCharterBrief();
  });
}

function hideTitle() {
  document.body.classList.remove('title-mode');
  els.titleScreen.classList.add('hidden');
}

function refreshLoadButton() {
  els.loadGameButton.hidden = !loadState();
}

function renderCharterSelect() {
  els.charterSelect.innerHTML = Object.values(CHARTERS)
    .map((charter) => `<option value="${escapeHtml(charter.id)}">${escapeHtml(charter.name)}</option>`)
    .join('');
  renderCharterBrief();
}

function renderCharterBrief() {
  const charter = CHARTERS[els.charterSelect.value] ?? CHARTERS.balanced;
  const risk = {
    balanced: 'Low pressure',
    industrial: 'Smoke and debt pressure',
    reform: 'Budget pressure',
    speculative: 'Inflation pressure'
  }[charter.id] ?? 'Mixed pressure';
  els.charterBrief.innerHTML = `
    <strong>${escapeHtml(charter.name)}</strong>
    <span>${escapeHtml(risk)}. ${escapeHtml(charter.description)}</span>
  `;
}

function handleTileClick(x, y) {
  if (state.gameOver) {
    return;
  }
  const result = placeBuilding(state, x, y, state.selectedBuildingId);
  state = result.state;
  notice = result.message;
  if (result.ok) {
    saveState(state);
    showToast(getBuildSuccessToast(state.selectedBuildingId), 'good');
  } else {
    showToast(getBuildFailureToast(result.message), 'bad');
  }
  renderAll();
  if (result.ok) {
    board.pulseTile?.(x, y);
  }
}

function getBuildSuccessToast(buildingId) {
  const building = BUILDINGS[buildingId];
  const name = building?.name ?? 'Engine';
  const byId = {
    road: 'Road extended.',
    residential: 'Housing added.',
    coalPlant: 'Coal engine online.',
    dcPlant: 'Local current online.',
    acPlant: 'Grid engine online.',
    bank: 'Bank chartered.',
    newspaper: 'Newspaper press started.',
    publicWorks: 'Public works funded.',
    rail: 'Freight corridor laid.'
  };
  return byId[buildingId] ?? `${name} added.`;
}

function getBuildFailureToast(message) {
  const lower = message.toLowerCase();
  if (lower.includes('treasury') || lower.includes('needs $')) {
    return 'Need more money.';
  }
  if (lower.includes('already')) {
    return 'That tile is occupied.';
  }
  if (lower.includes('river') || lower.includes('water')) {
    return 'This engine requires river access.';
  }
  if (lower.includes('unlock')) {
    return 'This policy unlocks later.';
  }
  if (lower.includes('civic') || lower.includes('trust')) {
    return 'Build civic support before this engine can stabilize.';
  }
  return message || 'This placement will not work yet.';
}

function renderAll() {
  renderBuildMenu();
  renderPolicyControls();
  renderDoctrineControls();
  renderProjectControls();
  renderForecast();
  renderFirstLedger();
  renderAdvisorPanel();
  renderCharterGoals();
  renderHud();
  renderSelectedTile();
  renderNewspaper();
  board.renderState(state);
  if (state.gameOver) {
    renderEnding();
  }
  refreshLoadButton();
}

function renderFirstLedger() {
  const dismissed = window.localStorage.getItem(FIRST_LEDGER_KEY) === 'dismissed';
  if (dismissed || state.turn > 18 || state.gameOver || !els.titleScreen.classList.contains('hidden')) {
    els.firstLedger.innerHTML = '';
    return;
  }
  els.firstLedger.innerHTML = `
    <div class="first-ledger-heading">
      <div>
        <p class="eyebrow">Town Clerk's First Ledger</p>
        <strong>Make independence practical.</strong>
      </div>
      <button class="small-button" type="button" data-dismiss-first-ledger>Dismiss</button>
    </div>
    <ul>
      <li>Build roads to open the map.</li>
      <li>Add housing so people can live near the engine.</li>
      <li>Add jobs so independence is not just decorative.</li>
      <li>Choose an early power engine.</li>
      <li>Watch freight, access, civic trust, banks, inflation, corruption, and unrest before ending the year.</li>
    </ul>
  `;
  els.firstLedger.querySelector('[data-dismiss-first-ledger]').addEventListener('click', () => {
    window.localStorage.setItem(FIRST_LEDGER_KEY, 'dismissed');
    els.firstLedger.innerHTML = '';
    showToast("Town Clerk's First Ledger dismissed.", '');
  });
}

function renderAdvisorPanel() {
  const stats = calculateStats(state);
  const cards = getAdvisorCards(stats);
  els.advisorPanel.innerHTML = `
    <div class="advisor-heading">
      <p class="eyebrow">Town Desk</p>
      <span>${escapeHtml(CHARTERS[state.charterId]?.name ?? 'Balanced Charter')}</span>
    </div>
    <div class="advisor-list">
      ${cards
        .map(
          (card) => `
            <div class="advisor-card ${card.tone}">
              <strong>${escapeHtml(card.title)}</strong>
              <span>${escapeHtml(card.copy)}</span>
            </div>
          `
        )
        .join('')}
    </div>
  `;
}

function getAdvisorCards(stats) {
  const cards = [];
  const year = getYear(state);
  const counts = stats.counts;

  if (state.turn < 2) {
    cards.push({
      tone: 'good',
      title: 'Open with a skeleton',
      copy: 'Roads and Main Street create access. Add housing, one job engine, and power before you mash Run Year.'
    });
  }

  if (stats.powerReliability < 0.9) {
    cards.push({
      tone: 'bad',
      title: 'Power is thin',
      copy: 'DC, coal, hydro, lines, substations, or battery houses keep growth from stalling.'
    });
  } else if ((counts.dcPlant ?? 0) + (counts.coalPlant ?? 0) + (counts.hydroPlant ?? 0) + (counts.acPlant ?? 0) === 0) {
    cards.push({
      tone: '',
      title: 'First engine due',
      copy: 'The baseline works for lamps and muscle. A real plant turns the town into an industrial argument.'
    });
  }

  if (stats.freightReliability < 0.9) {
    cards.push({
      tone: 'bad',
      title: 'Freight is choking',
      copy: 'Roads, rails, depots, grain elevators, and rail stations make the economy less muddy.'
    });
  }

  if (stats.industrialConflict >= 2) {
    cards.push({
      tone: 'bad',
      title: 'Homes smell the mills',
      copy: 'Separate industry from housing, then add parks, clinics, fire stations, or union halls.'
    });
  }

  if (stats.bankStability < 45 || stats.monetaryTrust < 45) {
    cards.push({
      tone: 'bad',
      title: 'Money is wobbling',
      copy: 'Cautious banking, hard money, bank examiners, audits, and lower debt calm the credit engine.'
    });
  } else if (stats.inflation > 70) {
    cards.push({
      tone: 'bad',
      title: 'Prices are loud',
      copy: 'Inflation will eat trust if banks also weaken. Slow credit, watch debt, and build confidence.'
    });
  }

  if (stats.civicCoverage < 25 && state.population > 250) {
    cards.push({
      tone: '',
      title: 'Care is lagging',
      copy: 'Schools, clinics, parks, pumps, sewer works, and settlement houses make growth survivable.'
    });
  }

  const projectReady = Object.values(PROJECTS).find((project) => {
    const completed = (state.completedProjects ?? []).includes(project.id);
    return !completed && canCompleteProject(state, project.id).ok;
  });
  if (projectReady) {
    cards.push({
      tone: 'good',
      title: `${projectReady.name} is ready`,
      copy: 'Civic projects are permanent public machinery. They are boring until they save the run.'
    });
  }

  if (year >= 1890 && stats.innovation < 22) {
    cards.push({
      tone: '',
      title: 'Innovation unlocks tools',
      copy: 'Schools, libraries, machine shops, telegraphs, radio, and patents move the build menu forward.'
    });
  }

  if (!cards.length) {
    cards.push({
      tone: 'good',
      title: 'Choose an identity',
      copy: 'The town is stable enough to pursue clean power, freight empire, public works, or credit machine.'
    });
  }

  return cards.slice(0, 3);
}

function renderHud() {
  const stats = calculateStats(state);
  const items = [
    ['Date', getDateLabel(state)],
    ['Money', formatMoney(state.money)],
    ['Debt', formatMoney(state.debt)],
    ['Population', state.population.toLocaleString('en-US')],
    ['Jobs/Housing', `${stats.jobs}/${stats.housing}`],
    ['Power', `${stats.powerSupply}/${stats.powerDemand}`],
    ['Freight', `${stats.freight}/${stats.freightDemand}`],
    ['Net', formatMoney(stats.netIncome)],
    ['Trust', statValue(stats.trust)],
    ['Health', statValue(stats.health)],
    ['Money Trust', statValue(stats.monetaryTrust)],
    ['Credit', statValue(stats.credit)],
    ['Inflation', statValue(stats.inflation, true)],
    ['Banking', statValue(stats.bankStability)],
    ['Pollution', statValue(stats.pollution, true)],
    ['Fire', statValue(stats.fireRisk, true)],
    ['Fuel Depend.', statValue(stats.fuelDependency, true)],
    ['Trade Conf.', statValue(stats.tradeConfidence)],
    ['Resilience', statValue(stats.resilience)],
    ['Corruption', statValue(stats.corruption, true)],
    ['Shadow', statValue(stats.shadowEconomy, true)]
  ];
  els.hudStats.innerHTML = items
    .map(([label, value]) => `<div class="hud-stat"><span>${escapeHtml(label)}</span><strong>${value}</strong></div>`)
    .join('');
}

function statValue(value, inverse = false) {
  const tone = inverse ? value >= 65 ? 'bad' : value <= 25 ? 'good' : '' : value >= 65 ? 'good' : value <= 25 ? 'bad' : '';
  return `<span class="${tone}">${Math.round(value)}</span>`;
}

function renderBuildMenu() {
  const categories = groupBuildings();
  els.buildMenu.innerHTML = Object.entries(categories)
    .map(([category, buildings]) => `
      <section class="build-category">
        <h3>${escapeHtml(category)}</h3>
        <div class="build-buttons">
          ${buildings.map((building) => renderBuildButton(building)).join('')}
        </div>
      </section>
    `)
    .join('');
  els.buildMenu.querySelectorAll('[data-building-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const buildingId = button.dataset.buildingId;
      if (button.classList.contains('locked')) {
        notice = getBuildingUnlockReason(state, buildingId);
        renderSelectedTile();
        return;
      }
      state = { ...state, selectedBuildingId: buildingId };
      notice = `${BUILDINGS[buildingId].name} selected. ${BUILDINGS[buildingId].description}`;
      renderBuildMenu();
      renderSelectedTile();
    });
  });
}

function renderBuildButton(building) {
  const unlockReason = getBuildingUnlockReason(state, building.id);
  const locked = Boolean(unlockReason);
  const active = state.selectedBuildingId === building.id;
  const cost = getBuildingCost(state, building.id);
  return `
    <button
      class="build-button ${active ? 'active' : ''} ${locked ? 'locked' : ''}"
      data-building-id="${escapeHtml(building.id)}"
      type="button"
      title="${escapeHtml(locked ? unlockReason : building.description)}"
    >
      <strong>${escapeHtml(building.name)}</strong>
      <span>${formatMoney(cost)} - ${escapeHtml(locked ? unlockReason : building.description)}</span>
    </button>
  `;
}

function groupBuildings() {
  return Object.values(BUILDINGS).reduce((groups, building) => {
    groups[building.category] ??= [];
    groups[building.category].push(building);
    return groups;
  }, {});
}

function renderPolicyControls() {
  els.policyControls.innerHTML = Object.entries(POLICY_GROUPS)
    .map(([key, group]) => renderSelectRow('policy', key, group, state.policies[key]))
    .join('');
  els.policyControls.querySelectorAll('select[data-policy-key]').forEach((select) => {
    select.addEventListener('change', () => {
      state = setPolicy(state, select.dataset.policyKey, select.value);
      notice = `${POLICY_GROUPS[select.dataset.policyKey].label} changed.`;
      showToast('Policy enacted.', 'good');
      saveState(state);
      renderAll();
    });
  });
}

function renderDoctrineControls() {
  els.doctrineControls.innerHTML = Object.entries(DOCTRINES)
    .map(([key, group]) => renderSelectRow('doctrine', key, group, state.doctrines[key]))
    .join('');
  els.doctrineControls.querySelectorAll('select[data-doctrine-key]').forEach((select) => {
    select.addEventListener('change', () => {
      state = setDoctrine(state, select.dataset.doctrineKey, select.value);
      notice = `${DOCTRINES[select.dataset.doctrineKey].label} changed.`;
      showToast('Engine doctrine rewritten.', 'good');
      saveState(state);
      renderAll();
    });
  });
}

function renderProjectControls() {
  els.projectControls.innerHTML = Object.values(PROJECTS)
    .map((project) => {
      const completed = (state.completedProjects ?? []).includes(project.id);
      const check = canCompleteProject(state, project.id);
      const locked = !completed && !check.ok;
      const debtNote = project.debt ? `, +${formatMoney(project.debt)} debt` : '';
      return `
        <button
          class="project-button ${completed ? 'completed' : ''} ${locked ? 'locked' : ''}"
          type="button"
          data-project-id="${escapeHtml(project.id)}"
          title="${escapeHtml(completed ? 'Completed.' : locked ? check.reason : project.description)}"
        >
          <strong>${escapeHtml(project.name)}</strong>
          <span>${completed ? 'Completed' : `${formatMoney(project.cost)}${debtNote} - ${escapeHtml(locked ? check.reason : project.description)}`}</span>
        </button>
      `;
    })
    .join('');

  els.projectControls.querySelectorAll('[data-project-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const projectId = button.dataset.projectId;
      if (button.classList.contains('completed')) {
        notice = `${PROJECTS[projectId].name} is already part of the town machine.`;
        renderAll();
        return;
      }
      const result = completeProject(state, projectId);
      state = result.state;
      notice = result.message;
      if (result.ok) {
        showToast('Public works funded.', 'good');
        saveState(state);
      } else {
        showToast(result.message, 'bad');
      }
      renderAll();
    });
  });
}

function renderForecast() {
  const stats = calculateStats(state);
  const benefits = getTopBenefits(stats);
  const pressures = getTopPressures(stats);
  const signals = [
    {
      label: 'Budget',
      value: formatMoney(stats.netIncome),
      tone: stats.netIncome >= 20 ? 'good' : stats.netIncome < 0 ? 'bad' : ''
    },
    {
      label: 'Power',
      value: `${Math.round(stats.powerReliability * 100)}%`,
      tone: stats.powerReliability >= 1 ? 'good' : stats.powerReliability < 0.85 ? 'bad' : ''
    },
    {
      label: 'Freight',
      value: `${Math.round(stats.freightReliability * 100)}%`,
      tone: stats.freightReliability >= 1 ? 'good' : stats.freightReliability < 0.85 ? 'bad' : ''
    },
    {
      label: 'Access',
      value: `${stats.roadAccess}%`,
      tone: stats.roadAccess >= 75 ? 'good' : stats.roadAccess < 50 ? 'bad' : ''
    },
    {
      label: 'Civic',
      value: `${stats.civicCoverage}%`,
      tone: stats.civicCoverage >= 45 ? 'good' : stats.civicCoverage < 20 ? 'bad' : ''
    },
    {
      label: 'Conflict',
      value: `${stats.industrialConflict}`,
      tone: stats.industrialConflict >= 3 ? 'bad' : stats.industrialConflict === 0 ? 'good' : ''
    },
    {
      label: 'Banks',
      value: `${stats.bankStability}`,
      tone: stats.bankStability >= 65 ? 'good' : stats.bankStability < 35 ? 'bad' : ''
    },
    {
      label: 'Inflation',
      value: `${stats.inflation}`,
      tone: stats.inflation <= 25 ? 'good' : stats.inflation >= 65 ? 'bad' : ''
    }
  ];
  els.forecastPanel.innerHTML = `
    <p class="eyebrow">Pressure Ledger</p>
    <div class="pressure-stance">
      <strong>${escapeHtml(DOCTRINES.money.options[state.doctrines.money].label)}</strong>
      <span>${escapeHtml(DOCTRINES.transport.options[state.doctrines.transport].label)} / ${escapeHtml(DOCTRINES.electric.options[state.doctrines.electric].label)}</span>
    </div>
    <div class="forecast-grid">
      ${signals
        .map(
          (signal) => `
            <div class="forecast-pill ${signal.tone}">
              <span>${escapeHtml(signal.label)}</span>
              <strong>${escapeHtml(signal.value)}</strong>
            </div>
          `
        )
        .join('')}
    </div>
    <div class="pressure-columns">
      <div>
        <strong>Top benefits</strong>
        <ul>${benefits.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </div>
      <div>
        <strong>Top pressures</strong>
        <ul>${pressures.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </div>
    </div>
    <p class="consequence-line">${escapeHtml(getConsequenceLine(stats))}</p>
    <p>${escapeHtml(getForecastLine(stats))}</p>
  `;
}

function getTopBenefits(stats) {
  const candidates = [
    ['Power surplus', Math.round((stats.powerReliability - 1) * 100)],
    ['Freight flow', Math.round((stats.freightReliability - 1) * 100)],
    ['Public trust', stats.trust - 50],
    ['Civic health', stats.health - 50],
    ['Bank confidence', stats.bankStability - 50],
    ['Trade confidence', stats.tradeConfidence - 50],
    ['Resilience', stats.resilience - 50],
    ['Access', stats.roadAccess - 50]
  ];
  return candidates
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label]) => label);
}

function getTopPressures(stats) {
  const candidates = [
    ['Inflation heat', stats.inflation],
    ['Corruption drag', stats.corruption],
    ['Shadow economy', stats.shadowEconomy],
    ['Fire risk', stats.fireRisk],
    ['Pollution', stats.pollution],
    ['Debt burden', stats.debtBurden],
    ['Industrial conflict', stats.industrialConflict * 16],
    ['Civic gap', Math.max(0, 45 - stats.civicCoverage)]
  ];
  const result = candidates
    .filter(([, value]) => value > 8)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label]) => label);
  return result.length ? result : ['No dominant pressure yet'];
}

function getConsequenceLine(stats) {
  if (stats.bankStability >= 70 && stats.credit > 55) {
    return 'The banks applaud. The workers squint.';
  }
  if (state.policies.publicWorks === 'aggressive') {
    return 'Public works rise, but the tax office has become a weather system.';
  }
  if (state.policies.media === 'sensational' || stats.corruption > 35) {
    return 'The press smells a scandal and possibly breakfast.';
  }
  if (stats.shadowEconomy > 30 || state.policies.alcohol === 'legal') {
    return 'The saloon economy reports record unofficial optimism.';
  }
  if ((stats.counts.coalPlant ?? 0) > 0 || stats.pollution > 35) {
    return 'The grid is alive, but the coal smoke has opinions.';
  }
  return 'Independence is holding, provided the ledger keeps believing itself.';
}

function getForecastLine(stats) {
  const warning = getPressureWarning(stats);
  if (warning) {
    return warning;
  }
  if (stats.powerReliability < 0.85) {
    return 'Power is the immediate bottleneck. Plants, lines, substations, or battery capacity would calm the machinery.';
  }
  if (stats.freightReliability < 0.85) {
    return 'Freight is choking growth. Roads, rail, depots, grain elevators, or district access can loosen it.';
  }
  if (stats.industrialConflict >= 3) {
    return 'Industry is too close to homes. Parks, clinics, fire stations, unions, and cleaner siting can cool the street.';
  }
  if (stats.bankStability < 35 || stats.monetaryTrust < 35) {
    return 'The money engine is wobbling. Bank examiners, hard money, audits, or slower credit can steady confidence.';
  }
  if (stats.civicCoverage < 20) {
    return 'The town is growing faster than care. Schools, clinics, parks, settlement houses, and sewer works will matter.';
  }
  return 'No single pressure dominates. This is when a town quietly decides what kind of machine it wants to become.';
}

function getPressureWarning(stats) {
  if (stats.inflation >= 70) {
    return 'Inflation is heating up.';
  }
  if (stats.corruption >= 55) {
    return 'Corruption is becoming structural.';
  }
  if (stats.trust <= 35) {
    return 'Civic trust is thin.';
  }
  if (stats.shadowEconomy >= 45) {
    return 'The shadow economy is no longer shadow-sized.';
  }
  if (stats.freightReliability < 0.75) {
    return 'Freight bottlenecks are choking growth.';
  }
  if (stats.industrialConflict >= 4) {
    return 'Unrest is entering the chat.';
  }
  return '';
}

function showPressureToast() {
  const warning = getPressureWarning(calculateStats(state));
  if (warning) {
    showToast(warning, 'bad');
  }
}

function renderCharterGoals() {
  const completed = new Set(state.completedMilestones ?? []);
  const remaining = MILESTONES.filter((milestone) => !completed.has(milestone.id)).slice(0, 2);
  const recent = MILESTONES.filter((milestone) => completed.has(milestone.id)).slice(-2);
  els.charterGoals.innerHTML = `
    <div class="charter-heading">
      <p class="eyebrow">Charter Goals</p>
      <span>${completed.size}/${MILESTONES.length}</span>
    </div>
    <div class="goal-list">
      ${remaining
        .map(
          (milestone) => `
            <div class="goal-item">
              <strong>${escapeHtml(milestone.name)}</strong>
              <span>${escapeHtml(milestone.goal)}</span>
              <em>${escapeHtml(milestone.rewardLabel)}</em>
            </div>
          `
        )
        .join('')}
      ${remaining.length ? '' : '<div class="goal-item complete"><strong>Charter Complete</strong><span>The town has proved every public ambition on the docket.</span></div>'}
    </div>
    ${
      recent.length
        ? `<p class="recent-goals">Recent: ${recent.map((milestone) => escapeHtml(milestone.name)).join(', ')}</p>`
        : ''
    }
  `;
}

function renderSelectRow(type, key, group, currentValue) {
  const dataAttr = type === 'policy' ? 'data-policy-key' : 'data-doctrine-key';
  const current = group.options[currentValue];
  return `
    <div class="policy-row">
      <label>
        <span>${escapeHtml(group.label)}</span>
        <span>${escapeHtml(current.label)}</span>
      </label>
      <select ${dataAttr}="${escapeHtml(key)}" title="${escapeHtml(current.description)}">
        ${Object.entries(group.options)
          .map(([value, option]) => {
            const locked = type === 'doctrine' && !canSelectDoctrine(key, value);
            const suffix = locked ? ' (crisis only)' : '';
            return `<option value="${escapeHtml(value)}" ${value === currentValue ? 'selected' : ''} ${locked ? 'disabled' : ''}>${escapeHtml(option.label + suffix)}</option>`;
          })
          .join('')}
      </select>
      <p>${escapeHtml(current.description)}</p>
    </div>
  `;
}

function canSelectDoctrine(key, value) {
  if (key !== 'money' || value !== 'localScrip') {
    return true;
  }
  const stats = calculateStats(state);
  return state.money < 0 || stats.monetaryTrust < 45 || stats.bankStability < 45 || stats.liquidity < 35;
}

function renderSelectedTile() {
  const selected = BUILDINGS[state.selectedBuildingId];
  const cell = state.grid[hoveredTile.y]?.[hoveredTile.x];
  const building = cell?.buildingId ? BUILDINGS[cell.buildingId] : null;
  const buildCheck = selected && cell ? canBuild(state, hoveredTile.x, hoveredTile.y, selected.id) : { ok: false, reason: '' };
  const tileName = building ? building.name : cell?.terrain === 'water' ? 'River' : 'Open Plot';
  const tileType = cell?.terrain === 'water' ? 'Water plot' : 'Land plot';
  const builtBenefits = building ? formatEffectList(building.effects, 'benefit') : 'No engine installed.';
  const builtPressures = building ? formatEffectList(building.effects, 'pressure') : 'No active pressure.';
  const selectedBenefits = selected ? formatEffectList(selected.effects, 'benefit') : '';
  const selectedPressures = selected ? formatEffectList(selected.effects, 'pressure') : '';
  const acceptLine = buildCheck.ok ? 'This plot can accept the selected engine.' : buildCheck.reason || notice;
  els.selectedTile.innerHTML = `
    <p class="eyebrow">Plot ${hoveredTile.x + 1}, ${hoveredTile.y + 1}</p>
    <h2>${escapeHtml(tileName)}</h2>
    <div class="tile-tags">
      <span>${escapeHtml(tileType)}</span>
      <span>${building ? 'Active engine' : 'Buildable ledger space'}</span>
    </div>
    <p>${building ? escapeHtml(building.description) : escapeHtml(cell?.terrain === 'water' ? 'Water can power hydro and pumps.' : 'Ready for machinery, politics, and regret.')}</p>
    <div class="tile-ledger">
      <div>
        <strong>Built contribution</strong>
        <span>${escapeHtml(builtBenefits)}</span>
      </div>
      <div>
        <strong>Built pressure</strong>
        <span>${escapeHtml(builtPressures)}</span>
      </div>
    </div>
    <hr>
    <p><strong>Selected:</strong> ${escapeHtml(selected.name)} (${formatMoney(getBuildingCost(state, selected.id))})</p>
    <div class="tile-ledger">
      <div>
        <strong>Would add</strong>
        <span>${escapeHtml(selectedBenefits)}</span>
      </div>
      <div>
        <strong>Would stress</strong>
        <span>${escapeHtml(selectedPressures)}</span>
      </div>
    </div>
    <p class="${buildCheck.ok ? 'good' : 'bad'}">${escapeHtml(acceptLine)}</p>
    <p>${escapeHtml(notice)}</p>
  `;
}

function formatEffectList(effects = {}, mode = 'benefit') {
  const items = Object.entries(effects)
    .filter(([, value]) => value !== 0)
    .filter(([key, value]) => {
      const isPressureKey = PRESSURE_EFFECT_KEYS.has(key);
      const isPressure = isPressureKey ? value > 0 : value < 0;
      return mode === 'pressure' ? isPressure : !isPressure;
    })
    .slice(0, 5)
    .map(([key, value]) => {
      const label = EFFECT_LABELS[key] ?? labelize(key);
      const sign = value > 0 ? '+' : '';
      return `${label} ${sign}${value}`;
    });
  if (items.length) {
    return items.join(', ');
  }
  return mode === 'pressure' ? 'No obvious new pressure.' : 'No immediate contribution.';
}

function renderNewspaper() {
  const issue = state.lastIssue;
  els.newspaperHeadline.textContent = issue.headline;
  els.newspaperCopy.textContent = issue.summary;
  els.issueDate.textContent = getDateLabel(state);
  els.eventFeed.innerHTML = state.eventHistory
    .slice(0, 6)
    .map((event) => `<li><strong>${escapeHtml(event.headline)}</strong><br>${escapeHtml(event.summary)}</li>`)
    .join('');
}

function renderEnding() {
  const ending = state.ending ?? calculateEnding(state);
  const strongest = getStrongestEngines(ending).slice(0, 3);
  const pressures = getWorstPressures(ending).slice(0, 3);
  const awards = getAwards(ending, strongest, pressures);
  const breakdown = getIndependenceBreakdown(ending);
  els.endingScreen.classList.remove('hidden');
  els.endingTitle.textContent = ending.headline;
  els.endingSummary.textContent = `${ending.summary} Final score: ${ending.total}.`;
  const stats = ending.stats;
  els.endingMeta.innerHTML = [
    ['Archetype', ending.title],
    ['Charter', CHARTERS[state.charterId]?.name ?? 'Balanced Charter'],
    ['Population', state.population.toLocaleString('en-US')],
    ['Cash', formatMoney(state.money)],
    ['Debt', formatMoney(state.debt)],
    ['Projects', `${state.completedProjects?.length ?? 0}`],
    ['Milestones', `${state.completedMilestones?.length ?? 0}/${MILESTONES.length}`],
    ['Access', `${stats.roadAccess}%`],
    ['Civic Coverage', `${stats.civicCoverage}%`],
    ['Development', `${ending.score.development}`]
  ]
    .map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`)
    .join('');
  els.endingArticle.innerHTML = `
    <section>
      <p class="eyebrow">Front Page Account</p>
      <h2>${escapeHtml(ending.title)}</h2>
      <p>${escapeHtml(getEndingArticle(ending, strongest, pressures))}</p>
    </section>
    <section class="power-breakdown">
      <p class="eyebrow">What powered your independence?</p>
      <div>${breakdown.map((item) => `<span><strong>${escapeHtml(item.label)}</strong>${item.value}</span>`).join('')}</div>
    </section>
    <section>
      <p class="eyebrow">Strongest Engines</p>
      <ol>${strongest.map((item) => `<li><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.note)} (${item.value})</span></li>`).join('')}</ol>
    </section>
    <section>
      <p class="eyebrow">Worst Pressures</p>
      <ol>${pressures.map((item) => `<li><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.note)} (${item.value})</span></li>`).join('')}</ol>
    </section>
    <section>
      <p class="eyebrow">Awards</p>
      <div class="award-row">${awards.map((award) => `<span>${escapeHtml(award)}</span>`).join('')}</div>
    </section>
  `;
  els.endingScores.innerHTML = Object.entries(ending.score)
    .map(([key, value]) => `
      <div class="score-box">
        <span>${escapeHtml(labelize(key))}</span>
        <strong>${Math.round(value)}</strong>
      </div>
    `)
    .join('');
}

function buildRunSummary(ending) {
  const strongest = getStrongestEngines(ending).slice(0, 3).map((item) => item.label).join(', ');
  const pressures = getWorstPressures(ending).slice(0, 3).map((item) => item.label).join(', ');
  const lines = [
    'Engines of Independence',
    `I built ${ending.title} in Engines of Independence.`,
    `Final score: ${ending.total}`,
    `Strongest engines: ${strongest}`,
    `Worst pressures: ${pressures}`,
    `Ending headline: ${ending.headline}`,
    `Charter: ${CHARTERS[state.charterId]?.name ?? 'Balanced Charter'}`,
    `Population: ${state.population.toLocaleString('en-US')}`,
    `Cash: ${formatMoney(state.money)}`,
    `Debt: ${formatMoney(state.debt)}`,
    `Projects: ${state.completedProjects?.length ?? 0}`,
    `Milestones: ${state.completedMilestones?.length ?? 0}/${MILESTONES.length}`,
    `Money Engine: ${DOCTRINES.money.options[state.doctrines.money].label}`,
    `Electric Doctrine: ${DOCTRINES.electric.options[state.doctrines.electric].label}`,
    `Transport Doctrine: ${DOCTRINES.transport.options[state.doctrines.transport].label}`
  ];
  return lines.join('\n');
}

function getStrongestEngines(ending) {
  const score = ending.score;
  const stats = ending.stats;
  const counts = stats.counts ?? {};
  const finance = Math.round((score.monetaryTrust + score.bankStability + score.tradeConfidence) / 3);
  const civic = Math.round((score.trust + score.health + score.civicCoverage) / 3);
  const publicWorks = Math.round((score.resilience + score.access + score.civicCoverage) / 3);
  const press = Math.round(Math.min(100, (counts.newspaper ?? 0) * 26 + (counts.radioStation ?? 0) * 30 + score.innovation * 0.35 + score.trust * 0.25));
  const policy = Math.round((score.trust + score.corruption + score.inflation) / 3);
  const shadow = Math.round(100 - score.shadow);
  return [
    { label: 'Energy', value: score.power, note: 'lamps, motors, stations, and grid confidence' },
    { label: 'Freight', value: score.freight, note: 'roads, rail, depots, crops, and market reach' },
    { label: 'Finance', value: finance, note: 'money trust, banks, credit, and trade confidence' },
    { label: 'Civic Trust', value: civic, note: 'health, legitimacy, care, and public patience' },
    { label: 'Public Works', value: publicWorks, note: 'access, resilience, pipes, codes, and repairs' },
    { label: 'Press', value: press, note: 'newspapers, radio, education, and shared reality' },
    { label: 'Policy', value: policy, note: 'taxes, regulation, labor, utilities, and money doctrine' },
    { label: 'Shadow Economy', value: shadow, note: 'informal money, saloons, vice, and leakage' }
  ].sort((a, b) => b.value - a.value);
}

function getWorstPressures(ending) {
  const score = ending.score;
  const stats = ending.stats;
  return [
    { label: 'Inflation', value: 100 - score.inflation, note: 'prices outrunning trust' },
    { label: 'Corruption', value: 100 - score.corruption, note: 'private machinery inside public machinery' },
    { label: 'Shadow Economy', value: 100 - score.shadow, note: 'cash and power outside the official ledger' },
    { label: 'Pollution', value: 100 - score.pollution, note: 'smoke, water, lungs, and industrial residue' },
    { label: 'Debt Burden', value: stats.debtBurden, note: 'tomorrow funding today' },
    { label: 'Industrial Conflict', value: stats.industrialConflict * 18, note: 'homes and industry fighting over the same street' },
    { label: 'Civic Gap', value: Math.max(0, 100 - score.civicCoverage), note: 'growth without enough care' },
    { label: 'Trust Fragility', value: Math.max(0, 100 - score.trust), note: 'legitimacy thinning under pressure' }
  ].sort((a, b) => b.value - a.value);
}

function getAwards(ending, strongest, pressures) {
  const awards = [];
  if (ending.total >= 75) {
    awards.push('Republic-grade machinery');
  }
  if (strongest[0]?.label) {
    awards.push(`${strongest[0].label} carried the town`);
  }
  if (ending.score.pollution >= 70) {
    awards.push('Clean enough to brag');
  }
  if (ending.stats.debtBurden <= 20) {
    awards.push('Respectable debt discipline');
  }
  if (pressures[0]?.value >= 65) {
    awards.push(`${pressures[0].label} nearly owned the front page`);
  }
  if ((state.completedMilestones ?? []).length >= 5) {
    awards.push('Charter goals stacked high');
  }
  return awards.length ? awards.slice(0, 4) : ['Ledger survived the experiment'];
}

function getIndependenceBreakdown(ending) {
  const strongest = getStrongestEngines(ending);
  return ['Energy', 'Freight', 'Finance', 'Civic Trust', 'Public Works', 'Press', 'Policy', 'Shadow Economy']
    .map((label) => strongest.find((item) => item.label === label))
    .filter(Boolean);
}

function getEndingArticle(ending, strongest, pressures) {
  const best = strongest[0]?.label ?? 'civic improvisation';
  const second = strongest[1]?.label ?? 'public patience';
  const worst = pressures[0]?.label ?? 'ordinary friction';
  return `The final edition finds ${CHARTERS[state.charterId]?.name ?? 'the town charter'} transformed into ${ending.title}. ${best} did the heavy lifting, ${second} kept the machinery from becoming pure spectacle, and ${worst.toLowerCase()} supplied the argument no council could fully settle. The question left on the pressroom floor is simple: what powered your independence, and what did it demand in return?`;
}

function hideEnding() {
  els.endingScreen.classList.add('hidden');
}

function showToast(message, tone = '') {
  if (!message) {
    return;
  }
  const toast = document.createElement('div');
  toast.className = `toast ${tone}`.trim();
  toast.textContent = message;
  els.toastLayer.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  window.setTimeout(() => {
    toast.classList.remove('visible');
    window.setTimeout(() => toast.remove(), 220);
  }, tone === 'bad' ? 3600 : 2600);
}

function labelize(value) {
  return value.replace(/([A-Z])/g, ' $1').replace(/[-_]/g, ' ');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
