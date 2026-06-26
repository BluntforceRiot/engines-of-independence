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

const els = {
  renderTarget: document.querySelector('#render-target'),
  hudStats: document.querySelector('#hud-stats'),
  buildMenu: document.querySelector('#build-menu'),
  policyControls: document.querySelector('#policy-controls'),
  doctrineControls: document.querySelector('#doctrine-controls'),
  projectControls: document.querySelector('#project-controls'),
  forecastPanel: document.querySelector('#forecast-panel'),
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
  startGameButton: document.querySelector('#start-game-button'),
  loadGameButton: document.querySelector('#load-game-button'),
  endingScreen: document.querySelector('#ending-screen'),
  endingTitle: document.querySelector('#ending-title'),
  endingSummary: document.querySelector('#ending-summary'),
  endingMeta: document.querySelector('#ending-meta'),
  endingScores: document.querySelector('#ending-scores'),
  copySummaryButton: document.querySelector('#copy-summary-button'),
  inspectButton: document.querySelector('#inspect-button'),
  restartButton: document.querySelector('#restart-button')
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
renderAll();

function bindUi() {
  els.startGameButton.addEventListener('click', () => {
    state = createNewState(els.charterSelect.value);
    notice = 'The charter is signed. Put down roads, housing, jobs, and an engine.';
    els.titleScreen.classList.add('hidden');
    saveState(state);
    renderAll();
  });

  els.loadGameButton.addEventListener('click', () => {
    const loaded = loadState();
    state = loaded ?? createNewState(els.charterSelect.value);
    notice = loaded ? 'Local save restored.' : 'No local save found; a new town has been chartered.';
    els.titleScreen.classList.add('hidden');
    renderAll();
  });

  els.newGameButton.addEventListener('click', () => {
    if (!window.confirm('Start a new town and overwrite the local save?')) {
      return;
    }
    state = createNewState(state.charterId ?? els.charterSelect.value);
    notice = 'New charter filed. The machinery is clean, for now.';
    saveState(state);
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
    saveState(state);
    renderAll();
  });

  els.bondButton.addEventListener('click', () => {
    state = issueBond(state);
    notice = 'Bond funding issued. Public capacity rises; future patience falls.';
    saveState(state);
    renderAll();
  });

  els.endNowButton.addEventListener('click', () => {
    state = endRun(state);
    notice = 'The ledger has been closed early.';
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
      setTimeout(() => {
        els.copySummaryButton.textContent = 'Copy Run Summary';
      }, 1400);
    } catch {
      notice = summary;
      renderSelectedTile();
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
    board.renderState(state);
  }
  renderAll();
}

function renderAll() {
  renderBuildMenu();
  renderPolicyControls();
  renderDoctrineControls();
  renderProjectControls();
  renderForecast();
  renderAdvisorPanel();
  renderCharterGoals();
  renderHud();
  renderSelectedTile();
  renderNewspaper();
  board.renderState(state);
  if (state.gameOver) {
    renderEnding();
  }
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
        saveState(state);
      }
      renderAll();
    });
  });
}

function renderForecast() {
  const stats = calculateStats(state);
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
    <p class="eyebrow">Pressure Board</p>
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
    <p>${escapeHtml(getForecastLine(stats))}</p>
  `;
}

function getForecastLine(stats) {
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
  els.selectedTile.innerHTML = `
    <p class="eyebrow">Plot ${hoveredTile.x + 1}, ${hoveredTile.y + 1}</p>
    <h2>${building ? escapeHtml(building.name) : cell?.terrain === 'water' ? 'River' : 'Open Plot'}</h2>
    <p>${building ? escapeHtml(building.description) : escapeHtml(cell?.terrain === 'water' ? 'Water can power hydro and pumps.' : 'Ready for machinery, politics, and regret.')}</p>
    <hr>
    <p><strong>Selected:</strong> ${escapeHtml(selected.name)} (${formatMoney(getBuildingCost(state, selected.id))})</p>
    <p>${escapeHtml(buildCheck.ok ? 'Click this plot to build.' : buildCheck.reason || notice)}</p>
    <p>${escapeHtml(notice)}</p>
  `;
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
  els.endingScreen.classList.remove('hidden');
  els.endingTitle.textContent = ending.headline;
  els.endingSummary.textContent = `${ending.summary} Final score: ${ending.total}.`;
  const stats = ending.stats;
  els.endingMeta.innerHTML = [
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
  const lines = [
    'Engines of Independence',
    ending.headline,
    `Score: ${ending.total}`,
    `Ending: ${ending.title}`,
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

function hideEnding() {
  els.endingScreen.classList.add('hidden');
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
