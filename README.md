# Engines of Independence

Engines of Independence is a browser-playable industrial town strategy game about building a town out of engines: coal, current, freight, taxes, newspapers, banks, bonds, saloons, unions, public works, corruption, and trust.

This prototype was built for a friendly Summer AI competition as a static browser game. It is inspired by classic city-building strategy patterns, but uses its own theme, rules, UI language, simulation, and identity.

Built for **Summer into AI Week 2: Independence Engines.**

The core submission idea: infrastructure, credit, energy, freight, legitimacy, public works, information, and trust are all engines. Every engine makes independence more practical while creating pressure somewhere else in the system.

Expected public demo URL once GitHub Pages is enabled:

`https://bluntforceriot.github.io/engines-of-independence/`

Expected repository URL:

`https://github.com/BluntforceRiot/engines-of-independence`

## Run Locally

```sh
npm install
npm run dev
```

The dev server runs through Vite, usually at `http://127.0.0.1:3000/`.

## Build

```sh
npm run build
```

The static build is written to `dist/`.

## Review Packaging

```sh
npm run package:review
npm run verify:package
```

`npm run package:review` creates `engines-of-independence-v09-review.zip` with portable forward-slash entries only. `npm run verify:package` extracts that ZIP to a temporary folder and runs the exact cold-package gate: `npm ci`, `npm run typecheck`, `npm run test:sim`, `npm run build`, and `npm audit --audit-level=moderate`.

## Verification

```sh
npm run typecheck
npm run test:sim
npm run build
npm audit --audit-level=moderate
```

`npm run typecheck` syntax-checks the JavaScript modules. `npm run test:sim` runs local simulation smoke tests for charter survival, an unattended ending, a developed-town project path, Gazette history, and data table completeness.

## Controls

- Left click: place the selected engine/building on the board.
- Mouse wheel: zoom the board.
- Right mouse drag or middle mouse drag: pan the board.
- F: focus the map and temporarily hide side panels.
- Esc: restore the UI from Focus Map mode.
- Reset View: return the board camera to the default framing.
- Next Month: advance one simulation month.
- Run Year: advance up to 12 months, stopping early if the town collapses.
- Issue Bond: borrow public money for expansion.
- Close Run / Print Final Ledger: ask for confirmation, close the run, and print the final edition.

## Core Gameplay

- Start in 1880 with a small charter town, limited cash, a few roads, farms, housing blocks, Main Street, and a town hall.
- Place buildings on a Three.js grid: housing, commerce, farms, roads, rail, factories, power plants, depots, civic services, saloons, union halls, banks, public works, water pumps, parks, and shadow buildings.
- Choose doctrines for electric power, transport, and money.
- Set policies for taxes, public works, regulation, alcohol, utility ownership, labor, media, and banking.
- Advance one month at a time or run a full year at once.
- Use Starting Charters for different pressure profiles: Balanced, Industrial Boom, Reform Coalition, or Speculative Credit Town.
- Complete one-time civic projects such as fire codes, sewer bonds, bank examiners, anti-graft audits, labor compacts, regional wire service, and rural electric co-ops.
- Build year- and innovation-gated institutions including machine shops, grain elevators, telegraph offices, insurance offices, patent offices, courts, sewer works, settlement houses, radio stations, and battery houses.
- The simulation updates population, jobs, housing, power, freight, fuel dependency, food, revenue, maintenance, pollution, fire risk, health, trust, corruption, shadow economy, resilience, innovation, monetary trust, liquidity, credit, inflation, debt burden, bank stability, and outside trade confidence.
- Tile placement matters through district effects: access, civic coverage, industrial conflict, farm freight chains, power support, bank/news/telegraph clusters, and worker safety adjacency.
- The pressure board gives a compact readout of budget, power, freight, access, civic coverage, industrial conflict, banks, and inflation.
- The Pressure Ledger summarizes doctrine stance, top benefits, top pressures, and the likely consequence of the current build.
- The Town Clerk's First Ledger appears after starting a town with first-turn setup guidance.
- The Town Desk advisor gives short contextual guidance based on live bottlenecks.
- Charter Goals act as milestones with small rewards and newspaper headlines.
- The Engine Gazette reports routine developments, annual ledger summaries, and event cards.
- The run ends after 1935 or by collapse, then prints an ending archetype, score ledger, run metadata, and copyable summary.

## What Is an Engine?

An engine is any system that converts one thing into another:

- Coal converts fuel into power.
- Diesel converts fuel into freight.
- Taxes convert private wealth into public capacity.
- Public works convert taxes and debt into resilience.
- Newspapers convert events into public belief.
- Banks convert trust into credit and growth.
- Saloons convert vice into revenue, cohesion, and disorder.
- Prohibition converts moral reform into black markets and enforcement costs.
- Corruption converts public money into private advantage and civic rot.
- Money converts trust into trade, debt into infrastructure, scarcity into panic, and policy into growth or collapse.

## Monetary Engine

The game includes a currency doctrine layer. The player is choosing what the town trusts as money, not merely a currency skin.

Money doctrines:

- Hard Money: stable prices and outside trade confidence, but tight credit and slower public expansion.
- Silver/Bimetal: boosts farmers, frontier growth, and debtor relief, but raises inflation and faction conflict.
- Public Paper Money: supports public works and emergency spending, but risks inflation and monetary trust.
- Bank Credit Expansion: boosts housing, factories, commerce, and speculation, but raises panic and bust risk.
- Municipal Bonds: enables large infrastructure before the town can fully afford it, with debt service and default risk.
- Company Scrip: boosts company-town industry while damaging labor trust and legitimacy.
- Emergency Local Scrip: unlocks during crisis and keeps local trade alive while outside confidence falls.

Banking policy can be cautious, balanced, or speculative. These choices affect credit, liquidity, inflation, bank stability, monetary trust, outside trade confidence, debt burden, events, growth, and final ending archetypes.

## Events And Newspaper

Events are deterministic/local template systems, not online AI calls. The newspaper creates procedural headlines and summaries from event cards and town stats.

Examples include AC panic, substation failure, coal smoke complaints, gasoline fires, diesel winter rescues, prohibition backfire, newspaper scandals, union strikes, bank panics, greenback fights, company scrip scandals, speculation busts, machine-shop breakthroughs, grain market rallies, courthouse crackdowns, telegraph rumor checks, insurance rating fights, settlement-house truces, radio market moods, and civic-project dividends.

## District Effects And Projects

Buildings are not just flat stat cards. Local placement creates additional pressure:

- Roads, rail, and stations improve access, freight, revenue, and growth.
- Homes near parks, schools, clinics, settlement houses, and civic buildings gain health and trust.
- Homes too close to factories, coal plants, fuel depots, or heavy industry suffer health, fire, pollution, and trust penalties.
- Main Street clusters with banks, telegraph offices, newspapers, town halls, and courts improve revenue and market confidence.
- Factories near rail, machine shops, power lines, and substations perform better.
- Farms benefit from roads, rail stations, grain elevators, and diesel depots.
- Power plants gain resilience from substations, lines, battery houses, pumps, and fire stations.

Civic projects are one-time strategic investments. They usually cost money, sometimes add debt, and permanently modify town-wide pressure. They are meant to feel like public machinery: boring on the surface, decisive in the long run.

## Current Status

Public demo candidate v0.9 is playable end-to-end:

- Three.js procedural board and buildings.
- Building placement.
- Monthly turn simulation plus Run Year control.
- Starting charters with different risk profiles.
- Policy and doctrine panels.
- Monetary/currency engine.
- Civic project layer.
- District adjacency effects.
- Year and innovation unlocks.
- Pressure board feedback.
- Town Desk advisor.
- Charter goal milestones.
- Event/newspaper feed.
- Local browser save.
- Bond funding.
- Endgame score, town archetype, metadata, and copyable run summary.
- Confirmation flow for closing the ledger and printing the final edition.
- Final edition front-page summary with strongest engines, worst pressures, awards, and "What powered your independence?" breakdown.
- GitHub Pages workflow that runs `npm ci`, typecheck, simulation smoke tests, and build before uploading `dist/`.

Known limitations:

- Buildings use procedural placeholder geometry, not final art.
- Balance is intentionally readable rather than realistic.
- There is no backend, online leaderboard, multiplayer, or runtime AI service.
- Tile adjacency is now meaningful but still intentionally readable, not a full traffic/water/power network simulation.
- Mobile layouts are not a primary target yet.
- The JavaScript bundle currently triggers a Vite chunk-size warning because Three.js is bundled into one static demo build.

## Public Demo Notes

- The game is intended to run as a static browser game through GitHub Pages; players should be able to play in the browser without downloading the repo once the demo URL is deployed.
- High-level art remains procedural placeholder geometry. There are no copyrighted commercial game assets.
- Local saves stay in the player's browser only.
- The public demo workflow is `.github/workflows/deploy.yml`. In GitHub, enable Pages with **Source: GitHub Actions**, then push to `main` or run the workflow manually.
- Built for Summer into AI Week 2: Independence Engines.

## AI Usage Note

- ChatGPT was used for concept development, design direction, review prompts, and public-readiness feedback.
- Codex was used for implementation, integration, local verification, and packaging.
- The simulation, newspaper headlines, and event copy are local deterministic/template systems, not calls to an online AI service.

## Credits And Attribution

This project uses Three.js and Vite.

The starting scaffold was the MIT-licensed `dgreenheck/simcity-threejs-clone` Three.js/Vite project. Engines of Independence preserves the MIT license attribution and replaces the user-facing title, theme, UI, rules, and simulation with an original competition prototype.

This project is not affiliated with SimCity, Maxis, Electronic Arts, or their owners.

## Competition Description

Build a town as a machine of civilization. Every engine solves one problem and creates another: coal powers mills and poisons lungs, public works build resilience and debt, newspapers create belief and panic, money creates trade and collapse, and prohibition invents its own shadows.
