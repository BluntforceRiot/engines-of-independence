# Engines of Independence Submission Notes

## Project

**Engines of Independence** is a browser-playable industrial town strategy game about building a town out of engines: coal, current, freight, taxes, banks, newspapers, unions, saloons, public works, corruption, and trust.

Short blurb: build an American town by choosing the engines underneath independence, then watch each engine create pressure somewhere else.

## Theme Connection

The artifact treats American independence as a civic machinery problem. The player does not simply place buildings; they assemble the physical, political, social, and monetary engines that make a town powerful, brittle, public, corrupt, resilient, or dependent.

It fits **Summer into AI Week 2: Independence Engines** because the game treats infrastructure, credit, energy, freight, legitimacy, public works, information, and trust as interlocked engines. Coal, banks, newspapers, public works, taxes, money doctrine, saloons, and regulation all create useful capacity while pushing cost into health, debt, inflation, corruption, unrest, legitimacy, or shadow economy.

## Public Demo

Expected demo URL once GitHub Pages is enabled:

`https://bluntforceriot.github.io/engines-of-independence/`

Expected repository URL:

`https://github.com/BluntforceRiot/engines-of-independence`

Substack proof post URL should be added to the submission form after the post is published.

## Proof Notes

- Static browser game built with Vite and Three.js.
- No backend, online leaderboard, runtime AI service, or external asset feed.
- Simulation and newspaper text are deterministic/local template systems.
- Local browser save uses `localStorage`.
- Verification scripts cover syntax and core simulation smoke checks.
- Review package verification cold-extracts the ZIP and runs `npm ci`, `npm run typecheck`, `npm run test:sim`, `npm run build`, and `npm audit --audit-level=moderate`.

## Built With AI

- ChatGPT: concept development, design direction, review prompts, submission framing, and iterative critique.
- Codex: implementation, integration, local verification, screenshots, and packaging.
- No runtime AI service is used in the deployed browser game.

## Suggested Scoring Packet

- One-sentence pitch.
- Demo URL.
- Repository URL.
- Screenshot of title, active board, policy/pressure panel, and ending screen.
- Build receipt with `npm run typecheck`, `npm run test:sim`, `npm run build`, and `npm audit --audit-level=moderate`.
- Package verification report proving the review ZIP has forward-slash paths and passes from a fresh extracted directory.
- Note that the game preserves MIT attribution for the original Three.js/Vite city-builder scaffold while replacing user-facing identity, mechanics, and theme.
