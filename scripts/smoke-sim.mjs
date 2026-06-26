import { BUILDINGS, CHARTERS, END_YEAR, MILESTONES, PROJECTS } from '../src/scripts/data.js';
import {
  calculateEnding,
  calculateStats,
  canCompleteProject,
  completeProject,
  createNewState,
  endRun,
  placeBuilding,
  resolveNextMonth,
  setDoctrine,
  setPolicy
} from '../src/scripts/simulation.js';

const failures = [];

check('all charter starts survive 24 unattended months with finite stats', () => {
  for (const id of Object.keys(CHARTERS)) {
    let state = createNewState(id);
    for (let i = 0; i < 24 && !state.gameOver; i += 1) {
      state = resolveNextMonth(state);
    }
    assert(!state.gameOver, `${id} collapsed before two years`);
    assertFiniteStats(state, id);
  }
});

check('sleepy unattended town reaches a valid ending', () => {
  let state = createNewState('balanced');
  while (!state.gameOver) {
    state = resolveNextMonth(state);
    if (state.monthIndex > (END_YEAR - 1880 + 2) * 12) {
      throw new Error('unattended town did not end near the configured end year');
    }
  }
  const ending = state.ending ?? calculateEnding(state);
  assert(ending.title === 'Sleepy Charter Town', `expected sleepy ending, received ${ending.title}`);
  assert(Number.isFinite(ending.total), 'ending total was not finite');
});

check('manual end ledger uses honest early-close headline', () => {
  let state = createNewState('balanced');
  state = resolveNextMonth(state);
  state = endRun(state);
  assert(state.gameOver, 'manual end did not close the run');
  assert(state.ending.headline.includes('Ledger Closes Early'), `unexpected manual headline: ${state.ending.headline}`);
  assert(!state.ending.headline.includes('Fifty-Five Years'), 'manual end reused the full-era headline');
});

check('automatic collapse records a concrete end reason', () => {
  let state = createNewState('balanced');
  state.debt = 7000;
  state = resolveNextMonth(state);
  assert(state.gameOver, 'debt collapse did not end the run');
  assert(state.collapseReason === 'Debt Burden Broke the Charter', `unexpected collapse reason: ${state.collapseReason}`);
  assert(state.ending.headline.includes('Debt Burden Broke the Charter'), `collapse headline omitted reason: ${state.ending.headline}`);
  assert(!state.ending.headline.includes('Fifty-Five Years'), 'collapse reused the full-era headline');
});

check('basic developed town can build, complete a project, and continue', () => {
  let state = createNewState('balanced');
  for (const [x, y, buildingId] of [
    [9, 10, 'road'],
    [10, 10, 'road'],
    [11, 10, 'road'],
    [12, 10, 'road'],
    [12, 9, 'dcPlant'],
    [9, 8, 'bank'],
    [6, 9, 'school'],
    [6, 10, 'fireStation'],
    [12, 8, 'factory']
  ]) {
    state = mustPlace(state, x, y, buildingId);
  }

  for (let i = 0; i < 24 && !state.gameOver; i += 1) {
    state = resolveNextMonth(state);
  }

  assert(!state.gameOver, 'developed town collapsed before Fire Code');
  assert(canCompleteProject(state, 'fireCode').ok, 'Fire Code should be available after two years in a built town');
  state = completeProject(state, 'fireCode').state;
  assert(state.completedProjects.includes('fireCode'), 'Fire Code did not complete');

  for (let i = 0; i < 24 && !state.gameOver; i += 1) {
    state = resolveNextMonth(state);
  }

  assert(!state.gameOver, 'developed town collapsed after project completion');
  assert((state.completedMilestones ?? []).length > 0, 'developed town earned no milestones');
  assertFiniteStats(state, 'developed town');
});

check('policy and doctrine changes become Gazette history', () => {
  let state = createNewState('balanced');
  state = setPolicy(state, 'taxRate', 'high');
  assert(state.eventHistory[0].headline === 'Council Adjusts the Levers', 'policy change was not logged');
  state = setDoctrine(state, 'transport', 'rail');
  assert(state.eventHistory[0].headline === 'Engine Doctrine Rewritten', 'doctrine change was not logged');
});

check('data tables expose complete project and milestone copy', () => {
  for (const [id, building] of Object.entries(BUILDINGS)) {
    assert(building.name && building.category && building.description, `${id} building copy is incomplete`);
  }
  for (const [id, project] of Object.entries(PROJECTS)) {
    assert(project.name && project.description && project.headline && project.summary, `${id} project copy is incomplete`);
  }
  for (const milestone of MILESTONES) {
    assert(milestone.name && milestone.goal && milestone.rewardLabel, `${milestone.id} milestone copy is incomplete`);
  }
});

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('Simulation smoke checks passed.');

function check(name, fn) {
  try {
    fn();
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
  }
}

function mustPlace(state, x, y, buildingId) {
  const result = placeBuilding(state, x, y, buildingId);
  assert(result.ok, `failed to place ${buildingId} at ${x},${y}: ${result.message}`);
  return result.state;
}

function assertFiniteStats(state, label) {
  const stats = calculateStats(state);
  const bad = Object.entries(stats).filter(([, value]) => typeof value === 'number' && !Number.isFinite(value));
  assert(!bad.length, `${label} has non-finite stats: ${JSON.stringify(bad)}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
