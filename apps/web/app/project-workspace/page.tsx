// W-26 routing flip (operator-directed, 2026-09-04): /project-workspace
// renders the cockpit immediately instead of the marketing shelf. The
// shelf moved to /project-workspace/projects (see that route). Render-
// swap, not a rebuild — same component the /project-workspace/cockpit
// route already uses.
export { default } from './cockpit/page'
