# Warm-up byte budget — dogfood attestation checklist (PRD D3)

Final dogfood gate **before** enabling global **`--enforce-spawn-byte-budget`** in center governance CI (PR 2 / D4). Complete **one full Mission Control spawn per row** after the pinned center submodule includes Phase D PR 1 (per-role byte table + this doc).

## Prerequisites

- Phase D PR 1 merged to **`software-development`** center **`main`** and hosting pin promoted.
- `./scripts/verify-center-governance.sh` from **`HOSTING_ROOT`** prints the per-role byte table stage and exits **0**.
- Center CI **`.github/workflows/center-governance.yml`** runs **`verify-warmup-bytes.mjs --table`** (WARN-only — global enforce still deferred).

## Attestation table (binding)

Record date, dispatch id, lane slug, and **`mission_control_send_agent_result`** summary in the PR 2 description or linked ops note when requesting global enforce.

| Role / skill | Category | Dogfood spawn skill | Minimum path exercised | Attested |
|--------------|----------|---------------------|--------------------------|----------|
| `author-prd` | planning | author-prd | PRD draft gate + terminal result | [ ] |
| `master-planner` | planning | master-planner | Decomposition handoff or terminal | [ ] |
| `phase-planner` | planning | phase-planner | Phase plan + optional pr-plan spawn | [ ] |
| `pr-plan` | planning | pr-plan (inline) | §5c Start coding session handoff | [ ] |
| `coding-session` | ship | coding-session | Worktree + ship cut-point or partial terminal with §8 fields | [ ] |
| `pre-pr-review` | ship | pre-pr-review | Spawn-only child terminal **`go`/`no-go`** | [ ] |

**Optional planning roles** (attest when changed in the release tranche): `pr-breakdown`, `delivery-phases`, `new-plan`, `brainstorm-research`, `ad-hoc-prd`, `quick-fix-plan`.

## Per-spawn verification (each row)

1. **Warm-up load** — Spawned lane warm-up stays under **384 KiB** on frontmatter paths (check CI table row **OK** or documented WARN with remediation plan).
2. **On-demand Read** — Skill step-bound **`Read`** hooks for omitted docs actually run (spot-check transcript or agent recap naming the doc path).
3. **Checkpoint UX** — Under Checkpoint trust, **`USER_CHECKPOINT`** only at gates; happy-path auto-advance between gates.
4. **Terminal outputs** — Spawned children emit **`mission_control_send_agent_result`** with required **`outputs`** per skill **`## Completion (spawned)`**.

## CI visibility (PRD D1)

From center repo or hosting root:

```bash
npm ci --prefix missions/plan-and-deliver/scripts
node missions/plan-and-deliver/scripts/verify-warmup-bytes.mjs --table
# With full sedea bootstrap totals from hosting checkout:
node missions/plan-and-deliver/scripts/verify-warmup-bytes.mjs --table --hosting-root "$HOSTING_ROOT"
```

Expect markdown table rows for **planning** and **ship** roles; **`WARN`** spawn-cap rows are acceptable until PR 2 enforce **only if** attestation notes remediation or cap-exception docs.

## Stop condition (PRD §7 item 7)

If dogfood shows agents **skipped** runtime **`Read`** of on-demand docs, **halt PR 2** until the affected skill strengthens step-bound **`Read`** hooks and re-dogfoods.

## Related

- Authoring hygiene (>40 KiB skill prose): `rules/45_skill-authoring-hygiene.mdc`
- Parent program: warm-up byte budget reduction ad-hoc PRD (operations dispatch **Warm-up byte budget reduction**)
