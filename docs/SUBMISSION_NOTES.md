# Engines of Independence Submission Notes

## Project

**Engines of Independence** is a browser-playable industrial town strategy game about building a town out of engines: coal, current, freight, taxes, banks, newspapers, unions, saloons, public works, corruption, and trust.

## Theme Connection

The artifact treats American independence as a civic machinery problem. The player does not simply place buildings; they assemble the physical, political, social, and monetary engines that make a town powerful, brittle, public, corrupt, resilient, or dependent.

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

## Suggested Scoring Packet

- One-sentence pitch.
- Demo URL.
- Repository URL.
- Screenshot of title, active board, policy/pressure panel, and ending screen.
- Build receipt with `npm run typecheck`, `npm run test:sim`, `npm run build`, and `npm audit --audit-level=moderate`.
- Note that the game preserves MIT attribution for the original Three.js/Vite city-builder scaffold while replacing user-facing identity, mechanics, and theme.
