---
name: coding-session
description: >-
 **Coding session** protocol branch: run center **`worktree-setup.sh`** from **`HOSTING_ROOT`**
 (never **`sedea_add_worktree_folder`** for creation), parse setup JSON hints, record worktrees
 and session focus in the plan sidecar via plan-state.mjs, **attach** the worktree with MCP
 **`sedea_add_worktree_folder` only** (never editor Add Folder to Workspace), then implement.
 Post-merge cleanup uses center **`worktree-cleanup.sh`** after MCP **`sedea_remove_worktree_folder`**.
 On a **spawned child lane** with layer-2 approval (or **pr-plan** spawn auto-authorize),
 **implement the anchored PR plan on this lane** in that worktree; on **prompt-only**
 entry, emit a copy/paste-safe two-phase session prompt for a separate coding chat.
 After implementation, run the **ship chain** (one cut-point modal: approve + commit +
 Before deploy **deploy-walk** inline → **auto-spawn pre-pr-review** → **auto inline create-pr** on clean **go** → inline **`pr-review`** → **agent-delegated approve + merge** when authorized → **auto post-merge cleanup** when merged → After deploy **deploy-walk** inline). Plan-anchored runs validate
 per-PR plans with plan-ws-completeness.mjs (_TBD_ in body requires completion or
 explicit override incomplete plan). Use under mission dispatch, natural language, or
 after planning when handing off implementation.
designation:
  allowed: Worktree implementation; plan §§5–8 fill; ship protocol steps
  forbidden: PRD rewrite; mission rule edits; dispatch resolution on leader lane
inputs:
  targetPlanPath:
    type: string
    description: Absolute or workspace-relative path to the PR plan to implement.
    required: false
  targetPlanSlug:
    type: string
    description: Slug for the PR plan to implement.
    required: false
  readyForImplementation:
    type: boolean
    description: Optional hint from a prior **pr-plan** menu (planning handoff only). Does not authorize worktrees.
    required: false
  developerApprovedImplementation:
    type: boolean
    description: Layer 2 output — true only after an authorizing worktree-open gate choice. Not supplied by **pr-plan**.
    required: false
  repoPath:
    type: string
    description: Absolute path to the hosting repo root for a single-repo coding session.
    required: false
  repoPaths:
    type: array
    description: Absolute paths to hosting repo roots for a multi-repo coding session.
    required: false
    default: []
  baseRef:
    type: string
    description: Remote integration ref to create the worktree from; default origin/main unless repo rules say otherwise.
    required: false
    default: origin/main
  worktreeName:
    type: string
    description: Optional explicit worktree name; otherwise derive from plan slug and Sedea rule 7 / rule 20 naming.
    required: false
  worktreePath:
    type: string
    description: >-
      Absolute existing WORKTREE_ROOT when an upstream lane already created the worktree
      (for example debug-and-fix code-promotion). When set with worktreeOwnership inherited,
      skip duplicate worktree-setup.sh and treat cleanup ownership as handed off.
    required: false
  worktreeOwnership:
    type: string
    description: >-
      When "inherited", this lane received cleanup ownership of worktreePath from an upstream
      creator (worktreeCreatedByUpstream). Authorizes post-merge auto-cleanup without this pass
      running worktree-setup.sh. Omit or other values = create-own path.
    required: false
  worktreeCreatedByUpstream:
    type: string
    description: >-
      Skill slug that created and (usually) mounted the worktree (e.g. debug-and-fix). Required
      when worktreeOwnership is inherited.
    required: false
  mountedViaMcp:
    type: boolean
    description: >-
      When true with inherited ownership, upstream already called sedea_add_worktree_folder for
      worktreePath. When false, this lane may attach once without creating a new worktree.
    required: false
  ledgerParent:
    type: string
    description: Ledger parent slug/path copied from the upstream planning agent.
    required: false
  upstreamSkill:
    type: string
    description: Optional context label (developer dispatch, snapshot, pr-plan spawn, planning skill, debug-and-fix).
    required: false
  planningHandoffMode:
    type: string
    description: >-
      When "sections-1-4-complete" (from pr-plan §5d spawn), §§5–8 may stay _TBD_;
      use auto-authorize or pr-plan spawn handoff gate, not executive-override framing.
    required: false
  planningHandoffApproved:
    type: boolean
    description: >-
      Layer 1 approval from pr-plan §5c Start coding session. When true with
      planningHandoffMode, waives worktree-open AskQuestion when §§1–4 are drafted.
    required: false
  promptOnly:
    type: boolean
    description: >-
      When true, stop after worktree attach and emit an external session prompt only (detached
      handoff). Default false for Mission Control spawn from pr-plan — same lane implements.
    required: false
    default: false
  hostingFragmentPath:
    type: string
    description: >-
      Absolute path to the approved hosting unreleased fragment file. Required when
      upstreamSkill is capture-release-note and fragmentShipAutoAdvance is true.
    required: false
  hostingFragmentRelPath:
    type: string
    description: >-
      Repo-relative path under hosting (for example docs/release-notes/unreleased/….md).
      Required with hostingFragmentPath for release-note fragment ship.
    required: false
  rdCenterFragmentPath:
    type: string
    description: Optional absolute Software Development center unreleased mirror path when capture-release-note wrote one.
    required: false
  fragmentShipAutoAdvance:
    type: boolean
    description: >-
      When true with upstreamSkill capture-release-note, run Release-note fragment ship profile
      — auto-advance commit through merge and cleanup without further developer gates.
    required: false
laneRules:
  - ".sedea/centers/sedea/rules/2_ask-question-instructions.mdc"
  - ".sedea/centers/sedea/rules/6_git-commit-push-gate.mdc"
  - ".sedea/centers/software-development/rules/20_efficient-pr-shipping.mdc"
  - ".sedea/centers/software-development/missions/plan-and-deliver/skills/coding-session/SKILL.md"
warmUpRules:
  - ".sedea/centers/software-development/missions/plan-and-deliver/skills/README.md"
  - ".sedea/centers/software-development/rules/20_efficient-pr-shipping.mdc"
---

# Coding session

Hand off a unit of work into a **dedicated git worktree**, with the worktree visible in the **same Sedea workbench** (multi-root workspace), not a second editor process. Worktree **setup** is **center `worktree-setup.sh` only** (from **`HOSTING_ROOT`**); workbench **attach** is **`sedea_add_worktree_folder` only** — see [Hard rules — git worktree vs workbench attach (binding)](#hard-rules--git-worktree-vs-workbench-attach-binding) and [Center worktree scripts (binding)](#center-worktree-scripts-binding). **Execution mode** after setup depends on entry path — see [Execution mode after worktree attach](#execution-mode-after-worktree-attach).

**Owns:** per-PR plan §§ **5–8** during implementation (repo rules impact, tests, deploy plan, caveats); center **`worktree-setup.sh`**, JSON hint parsing, `plan-state.mjs set-worktrees` / `set-session`, Mission Control worktree attach, bootstrap status from setup hints (`outputs.bootstrapStatus: success` before implementation — no default-path inline **`worktree-bootstrap`**), pre-worktree validation + worktree-open gate; **spawned-lane implementation** or curated **prompt-only** session prompt emission; post-merge **center `worktree-cleanup.sh`** after MCP detach; [Ship chain after implementation](../../docs/coding-session-ship-chain.md#ship-chain-after-implementation-coding-session-lane) ([Ship cut-point gate](../../docs/coding-session-ship-chain.md#ship-cut-point-gate-approve-commit-before-deploy) — one modal approve + commit + Before deploy **`deploy-walk`** inline → **auto-spawn **`pre-pr-review`** → **auto inline **`create-pr`** on clean **go** → **auto** [Post-merge workspace cleanup](#post-merge-workspace-cleanup) when merged → After deploy **`deploy-walk`** inline).

**Out of scope:** drafting per-PR §§ **1–4** ( **`pr-plan`** ); implementing hosting repo code when this run is **prompt-only** (see [Prompt-only handoff](#prompt-only-handoff)); opening PRs from the planning lane; **`plan-reconcile`** archive cadence except where this skill references it for cleanup narrative.

## Warm-up manifest (spawned)

Per [`.sedea/centers/sedea/docs/lane-manifest-contract.md`](.sedea/centers/sedea/docs/lane-manifest-contract.md) and **`../README.md`** § *Default warm-up* / *Warm-up cap exceptions*. Host merge: `effectiveWarmUp = dedupe(bootstrapRules → laneRules → skillWarmUp)`. Frontmatter matches this table; spawners may omit run-request **`laneRules`** when identical (README spawn preflight row 11). **384 KiB cap:** frontmatter omits **`plan.mdc`**, **`development-process.md`**, and rule **30** — explicit **`Read`** of those paths (and **`inputs.targetPlanPath`**) when ship/procedure steps require them. **Host skill-body exclusion:** this skill's own **`SKILL.md`** stays in **`laneRules`** for parity; the host injects **`skillPath`** separately — **`verify-skill-manifest.mjs`** excludes that path from spawn byte-budget math (lane-manifest-contract § *Spawn cap*). **No `alwaysApply` frontmatter flip.**

### `bootstrapRules` — host-resolved (Software Development center layer)

| Path | Purpose |
|------|---------|
| `.sedea/centers/software-development/rules/bootstrap.mdc` | Sole Software Development `alwaysApply: true` bootstrap (≤10 KB); host merges when `centerSlug === software-development` |

### `skillWarmUp` — frontmatter `warmUpRules`

| Path | Purpose |
|------|---------|
| `.sedea/centers/software-development/missions/plan-and-deliver/skills/README.md` | Slim spawn contracts, terminal stop |
| `.sedea/centers/software-development/rules/20_efficient-pr-shipping.mdc` | Worktree naming, ship chain, bootstrap |

**Omitted from frontmatter (384 KiB spawn cap — runtime `Read`):** `plan.mdc`, `development-process.md`, `docs/coding-session-ship-chain.md`, `docs/coding-session-checkpoint-ux.md` — load via **`inputs.targetPlanPath`** and explicit **`Read`** when ship-chain or procedure steps require them.


### On-demand docs — runtime `Read` (not in `laneRules` / `warmUpRules`)

| Path | Load when |
|------|-----------|
| `.sedea/centers/software-development/missions/plan-and-deliver/docs/spawn-ship-contracts.md` | Before terminal emit with ship-complete or parent follow-up notify fields |
| `.sedea/centers/software-development/missions/plan-and-deliver/docs/coding-session-ship-chain.md` | Ship chain step **9** entry; resume incomplete ship chain |
| `.sedea/centers/software-development/missions/plan-and-deliver/docs/coding-session-checkpoint-ux.md` | Before any `USER_CHECKPOINT`; Yield gate; developer-await turns |


**Step-bound Read (binding):** Before emitting terminal outputs with ship-complete or parent follow-up notify fields, `Read` [`docs/spawn-ship-contracts.md`](../../docs/spawn-ship-contracts.md) in full.

### `laneRules` — frontmatter `laneRules`

| Path | Purpose |
|------|---------|
| `.sedea/centers/sedea/rules/2_ask-question-instructions.mdc` | Structured choice, AskQuestion / MCP structured choice |
| `.sedea/centers/sedea/rules/6_git-commit-push-gate.mdc` | Commit/push gate before ship cut-point |
| `.sedea/centers/software-development/rules/20_efficient-pr-shipping.mdc` | Ship lane minimum (role row in README) |
| `.sedea/centers/software-development/missions/plan-and-deliver/skills/coding-session/SKILL.md` | This skill procedure |

## Agent messaging (MCP)

**MCP spawn/result/notify-receive skill.** Parent→child spawn, child terminal result, and parent plan-change notify delivery use MCP tools per **`.sedea/centers/sedea/rules/4_mission.mdc`** § *Agent-to-agent spawn protocol* and § *MCP notify protocol*.

| Action | MCP tool |
|--------|----------|
| Parent spawn (when this skill emits a child lane) | **`mission_control_spawn_agent`** |
| **This** spawned lane terminal (and terminal re-emits) | **`mission_control_send_agent_result`** |
| Parent plan-change notify (receive only — **forbidden** on this lane) | Host-delivered UserSend — see [Plan-change notification receive (child lane)](../../docs/coding-session-checkpoint-ux.md#plan-change-notification-receive-child-lane) |

**Binding:**

- Run **`../README.md`** § *MCP spawn preflight* (rows M1–M8) before every MCP spawn; **forbidden** host-resolved identity keys in MCP args (`correlationId`, `dispatchId`, `slotId`, … — see README § *Host-resolved identity*).
- Inline skills on this mission stay **inline-only** — no spawn wire change unless the protocol step explicitly spawns a child lane.
- **`coding-session`** is a **notify recipient**, not a notify caller — **forbidden** **`mission_control_notify_child_lanes`** on this lane; escalate via upstream planner or Squad Leader.

### Plan-change notification receive (child lane)

**On-demand detail:** Full intake, USER_CHECKPOINT option table, and act semantics — [`docs/coding-session-checkpoint-ux.md`](../../docs/coding-session-checkpoint-ux.md) § *Plan-change notification receive (child lane)*. **`Read`** that section on notify delivery before acting.

When Mission Control delivers **`Mission Control: plan-change-notification delivered.`**, **`Read`** each **`affectedPlanPaths`** entry in full, then open structured choice on the **same turn**. Plan-change notification delivery is a **developer-input USER_CHECKPOINT** — **not** external-wait. **Forbidden:** terminal **`mission_control_send_agent_result`** solely because notification arrived. Cross-ref: **`.sedea/centers/sedea/rules/4_mission.mdc`** § *MCP notify protocol*; **`../README.md`** § *Child delivery checkpoint (receive)*.

USER_CHECKPOINT — parent plan-change notification received; pick how to respond (full recap shape in checkpoint UX doc).

| Option id | Label |
|-----------|--------|
| `acknowledge-only` | Acknowledge — continue current implementation with updated context |
| `re-read-revise` | Re-read / revise affected plan sections on this lane |
| `plan-reconcile` | Run inline **`plan-reconcile`** when authorized (plan-anchored ship) |
| `escalate-parent` | Escalate to parent planner — change needs upstream decision |
| `stop-work` | Stop work on this lane |
| `more-details` | More details for option _ |

## Worktree create → attach → bootstrap (ownership)

Three **sequential** agent steps on the **`coding-session`** lane after the [Worktree-open gate](#worktree-open-gate), plus **center setup** (step **1** — includes fast bootstrap inside the shell).

| Step | Owner lane | Action | Tool / skill |
|------|------------|--------|--------------|
| 1 | **`coding-session`** | Setup worktree + fast bootstrap | **`.sedea/centers/sedea/scripts/worktree-setup.sh`** ([Generic flow](#generic-flow-single-repo) step 1) |
| 2 | **`coding-session`** | Record sidecar `worktrees` / `session` | `plan-state.mjs` (step 2) |
| 3 | **`coding-session`** | Mount worktree in Sedea workbench | MCP **`sedea_add_worktree_folder`** when setup hint **`nextAction: attach-required`** (step 3) |

**Bootstrap:** Default path — map **`bootstrapStatus`** / **`bootstrapMode`** from setup stdout JSON to **`outputs`**; **do not** run inline **`worktree-bootstrap`** when setup succeeded. Retry / exception only — [Worktree bootstrap (inline mandatory)](#worktree-bootstrap-inline-mandatory).

**Not a conflict:** center setup creates the directory and runs overlay bootstrap; **`sedea_add_worktree_folder`** adds that path to the Mission Control / editor workspace.

**Removal is the mirror:** post-merge detach/remove applies **only** to the **`WORKTREE_ROOT`** from steps 1–3 on **this pass** **or** the exact absolute path when [Inherited worktree ownership](#inherited-worktree-ownership-upstream-handoff-binding) applies — see § *Post-merge workspace cleanup* and rule **20** § *Worktree removal ownership (binding)*. **Do not remove worktrees you do not own.**

## Inherited worktree ownership (upstream handoff — binding)

When spawn **`inputs`** (or a clear invoker handoff) include **all** of:

| Field | Rule |
|-------|------|
| **`worktreePath`** | Absolute existing **`WORKTREE_ROOT`** on disk |
| **`worktreeOwnership: "inherited"`** | Upstream creator / mount lane passed cleanup ownership to this spawn |
| **`worktreeCreatedByUpstream`** | Non-empty skill slug (for example **`debug-and-fix`**) |
| **`worktreeName`** | Matching worktree / branch name when known |

…then **this lane owns cleanup** for that exact path even though **this** pass did **not** run **`worktree-setup.sh`**.

| Phase | Behavior |
|-------|----------|
| **Setup** | **Skip** center **`worktree-setup.sh`**. Set **`WORKTREE_ROOT`** / **`outputs.worktreePath`** from **`inputs.worktreePath`**. Set **`outputs.bootstrapStatus: success`** when the directory exists and prior bootstrap was success-class (or re-map from documented skip). |
| **Attach** | When **`mountedViaMcp: true`**, skip duplicate MCP attach if the folder is already mounted; when **`false`** or not mounted, call **`sedea_add_worktree_folder`** once for that absolute path — **do not** create a new worktree. |
| **Ship / cleanup** | Treat Path A / rule **20** “this pass” setup **and** “this pass” MCP attach preconditions as **satisfied via inheritance** for **that path only**. Post-merge **auto-apply** cleanup — **no** ownership-unclear modal for remount-only reuse. Cleanup attestation: **`--ownership-path a`**, **`--created-this-pass`**, **`--mounted-via-mcp`** when attach ran on this lane or upstream (`mountedViaMcp: true`). |

**Forbidden:** classifying **`worktreeOwnership: inherited`** + matching absolute **`WORKTREE_ROOT`** as unclear ownership because setup was not re-run on this lane; inventing a second worktree; removing any other path.

**Detection helpers:** Also treat as inherited when **`upstreamSkill === "debug-and-fix"`** and absolute **`inputs.worktreePath`** exists, even if a parent omitted the string **`inherited`** — still require the path to match the debug seed exactly; prefer parents that set the full field set (**`pr-plan` §5d**).

## Hard rules — git worktree vs workbench attach (binding)

Agents repeatedly call **`sedea_add_worktree_folder`** instead of **`git worktree add`**, or skip MCP attach after creating the worktree. On **every** **`coding-session`** lane these rules are **non-negotiable**:

| Step | Required | Forbidden |
|------|----------|-----------|
| **1 — Center setup** | **`.sedea/centers/sedea/scripts/worktree-setup.sh`** from **`HOSTING_ROOT`** with **`--hosting-root`**, **`--worktree-path`**, **`--worktree-name`**, optional **`--base-ref`** — **except** [Inherited worktree ownership](#inherited-worktree-ownership-upstream-handoff-binding) (reuse existing absolute path) | **`sedea_add_worktree_folder`** (MCP does **not** run git — it only mounts an **existing** folder), inline **`git worktree add`** on the default path, `git clone`, manual checkout/mkdir |
| **3 — Mount in Sedea workbench** | MCP **`sedea_add_worktree_folder`** with **absolute** `path` (optional `name`) when setup hint **`nextAction: attach-required`** **or** inherited handoff with **`mountedViaMcp: false`** / not yet mounted | VS Code / Cursor **Add Folder to Workspace**, hand-edited **`.code-workspace`** as the attach mechanism on Mission Control lanes, assuming step 1 made the worktree appear in the explorer |

**Fixed order (create-own path):** center setup (step **1**) → sidecar (step **2**) → MCP attach (step **3**). Never call **`sedea_add_worktree_folder`** before **`worktree-setup.sh`** exits **0** on the create-own path. Never skip step **3** because the directory exists on disk — **unless** [Inherited worktree ownership](#inherited-worktree-ownership-upstream-handoff-binding) with **`mountedViaMcp: true`** and the folder is already in the workbench.

**Squad Leader vs this lane:** **20_efficient-pr-shipping.mdc** § *Squad Leader on HOSTING_ROOT* may run center setup and call **`sedea_add_worktree_folder`** before spawning **`coding-session`**. When this skill runs [Generic flow](#generic-flow-single-repo) on a **spawned implementation lane**, **this lane** owns setup → sidecar → attach end-to-end unless the leader (or **inherited upstream** such as **`debug-and-fix`**) already completed attach and passed absolute **`WORKTREE_ROOT`** in spawn `inputs` — then skip duplicate setup / MCP only when the worktree path already exists **and** is already mounted in the workbench, and apply [Inherited worktree ownership](#inherited-worktree-ownership-upstream-handoff-binding) for cleanup.

## Center worktree scripts (binding)

**Setup and cleanup git orchestration** run through built-in **sedea** center shells from **`HOSTING_ROOT`**. **MCP attach/detach remain explicit agent steps** — shells emit JSON hints; they do **not** invoke **`sedea_add_worktree_folder`** or **`sedea_remove_worktree_folder`**.

| Script | Path | Replaces on this skill |
|--------|------|------------------------|
| **Setup** | `.sedea/centers/sedea/scripts/worktree-setup.sh` | Inline dirty-primary gate, **`git fetch`**, **`git worktree add`**, and default-path inline **`worktree-bootstrap`** |
| **Cleanup** | `.sedea/centers/sedea/scripts/worktree-cleanup.sh` | Inline post-merge **`git pull origin main`**, **`git worktree remove`**, and stale worktree name ref drop on owned paths |

Hosting overlay contract: **`.cursor/rules/dot-sedea.mdc`** § *Worktree bootstrap mode* and § *Center `worktree-setup.sh`*. Split contract: [`.sedea/centers/sedea/rules/0_hosting-repo.mdc`](.sedea/centers/sedea/rules/0_hosting-repo.mdc) § *Attach worktree to VS Code workspace* / § *Detach worktree from VS Code workspace*.

### Parse setup/cleanup JSON hints (binding)

Each script prints **one JSON line on stdout** (human progress on stderr). On **non-zero exit**, parse failure JSON when present — branch on **`exitCode`**, **`nextAction`**, and **`message`**.

| Hint field | Setup | Cleanup |
|------------|-------|---------|
| **`exitCode`** | Shell exit (**0** = success) | Same |
| **`nextAction`** | **`attach-required`** → MCP attach (step 3) | **`none`** on success; **`detach-required`** → run MCP detach before retry |
| **`worktreeRoot`**, **`worktreeName`** | Set **`WORKTREE_ROOT`** / sidecar + cleanup attestation | Same |
| **`bootstrapMode`**, **`bootstrapStatus`** | Map to **`outputs`** — **`success`**, **`skipped-noop`**, **`skipped-idempotent`** allow implementation | N/A |
| **`cleanupStatus`** | N/A | **`success`** → **`outputs.postMergeCleanupStatus: success`** |

**Forbidden on default setup path:** raw **`git worktree add`**, inline **`bootstrap-worktree-dev.sh`**, or **`full`** bootstrap escalation when center setup fails (exit **11** warm-primary → structured retry; exit **12** overlay → fix dot-sedea). **Forbidden on default cleanup path:** inline **`git worktree remove`** + hosting **`git pull`** when **`worktree-cleanup.sh`** applies for an owned path after MCP detach.

## Plan and sidecar IO (binding)

Operations plan and sidecar IO always targets **`HOSTING_ROOT`** — never **`WORKTREE_ROOT/.sedea/operations/`**.

| IO kind | Root | Rule |
|---------|------|------|
| Plan body (`Read` / `StrReplace` on `*.plan.md`) | **`HOSTING_ROOT`** | Use spawn `inputs.targetPlanPath` verbatim when supplied |
| Sidecar (`plan-state.mjs`) | **`HOSTING_ROOT`** | `cd "$HOSTING_ROOT"` before every script invocation |
| Inline **`deploy-walk`** checklist patches | **`HOSTING_ROOT`** | Same absolute path as the anchored plan |

**Worktree operations copy:** Center **`worktree-setup.sh`** may copy `.sedea/operations/` from primary into the worktree for **read-only context** at bootstrap. That copy **does not sync** after creation and is **not** operations plan authority. **Forbidden:** `Read` for write intent, `StrReplace`, `Write`, or hand edits under `WORKTREE_ROOT/.sedea/operations/`.

**Pre-write guard (binding):** Before any `.sedea/operations/` file mutation, resolve the absolute path. If the path contains a `*-worktrees/` segment or lies under a worktree checkout's `.sedea/operations/`, **stop** and rewrite to the equivalent path under **`HOSTING_ROOT`** (match slug; prefer spawn `targetPlanPath`).

Cross-refs: **20_efficient-pr-shipping.mdc** § *Hosting repo cwd for scripts* and § *Operations plan files (binding)*; **0_hosting-repo.mdc** § *Operations persistence (main hosting root only)*.

## Refresh lane display (when stale)

After **`targetPlanPath`** / PR concern is clear (before worktree attach or immediately after bootstrap succeeds):

1. Compare the visible tab **title** / **hover** to this lane's work (`targetPlanSlug`, §1 single concern).
2. When spawn labels are **generic or wrong**, call MCP **`mission_control_update_lane_display`** on **this lane only** with **`title`** = `PR{parentIndex}-{semantic title}` when **`parentIndex`** is known (§1 single concern or **`targetPlanSlug`**); otherwise `PR-{semantic title}` — and optional **`description`** / **`hoverDescription`** (max lengths in [`.sedea/centers/sedea/rules/9_display-metadata-authority.mdc`](.sedea/centers/sedea/rules/9_display-metadata-authority.mdc)). See [rule **50**](../../../../rules/50_mission-control-display-metadata-discipline.mdc) § *Lane title prefix conventions*.
3. **Skip** when spawn labels already match scope.
4. **Forbidden:** **`mission_control_update_dispatch_display`** from a child lane.

See [`.sedea/centers/software-development/rules/50_mission-control-display-metadata-discipline.mdc`](../../../../rules/50_mission-control-display-metadata-discipline.mdc) § *Child lane — refresh own slot when labels are stale*.

## Relationship to `pr-plan`

| Concern | **`pr-plan`** | **`coding-session`** (this skill) |
|---------|--------------|-----------------------------------|
| §§ **1–4** | Drafted on the planning lane | Read for prompts and review; edit only when the developer revises the plan |
| §§ **5–8** | **`_TBD_`** or optional speculative sketch | Substantive fill during implementation |
| Handoff | **`pr-plan`** §5d **`mission_control_spawn_agent`** or detached entry | Spawned child lane or developer-started detached session |

See **`pr-plan/SKILL.md`** § *Handoff to coding-session*.

### Release-note fragment spawn detection

Treat this run as a **release-note fragment spawn** when **all** hold:

- `inputs.upstreamSkill === "capture-release-note"`,
- `inputs.fragmentShipAutoAdvance === true`,
- non-empty **`inputs.hostingFragmentPath`** and **`inputs.hostingFragmentRelPath`**,
- `inputs.repoPath` is present (hosting repo root).

When true, follow [Auto-authorize release-note fragment ship](#auto-authorize-release-note-fragment-ship) when eligible — then [Release-note fragment ship profile (Checkpoint — binding)](#release-note-fragment-ship-profile-checkpoint--binding). **Forbidden:** [Pre-worktree validation](#pre-worktree-validation-plan-completeness), [Worktree-open gate](#worktree-open-gate), implementation batches, ship cut-point + Before deploy, **`pre-pr-review`** spawn, post-create-pr handoff, inline **`pr-review`** disposition, After deploy / **`plan-reconcile`** on the clean path.

### pr-plan spawn handoff detection

Treat this run as a **pr-plan spawn handoff** when **either**:

- `inputs.planningHandoffMode === "sections-1-4-complete"`, or
- `inputs.upstreamSkill === "pr-plan"` **and** `inputs.readyForImplementation === true`.

When true, follow [Spawned from `pr-plan` (expected incomplete)](#spawned-from-pr-plan-expected-incomplete). After [Pre-worktree validation](#pre-worktree-validation-plan-completeness), use [Auto-authorize implementation (pr-plan spawn)](#auto-authorize-implementation-pr-plan-spawn) when eligible — otherwise [Worktree-open gate (pr-plan spawn handoff)](#worktree-open-gate-pr-plan-spawn-handoff) — not the generic incomplete gate with “executive override” labels.

### Spawned from `pr-plan` (expected incomplete)

When [pr-plan spawn handoff detection](#pr-plan-spawn-handoff-detection) applies:

1. Do **not** say the PR plan is “not fully populated,” “incomplete planning,” “not ready,” or that **`pr-plan`** failed.
2. Say: *Planning handoff complete (§§1–4). §§5–8 fill on this lane during implementation.*
3. After **`plan-ws-completeness.mjs`** → `INCOMPLETE` (optional second stdout line `EXPECTED_SECTIONS_5_8_TBD`), treat as **expected**, not a defect — do **not** send the developer back to **`pr-plan`** unless they choose **Revise PR plan first** or **Stop — I'll complete the plan first** (detached / snapshot entry only — demoted on pr-plan spawn path).
4. When [Auto-authorize implementation (pr-plan spawn)](#auto-authorize-implementation-pr-plan-spawn) does **not** apply, the [Worktree-open gate (pr-plan spawn handoff)](#worktree-open-gate-pr-plan-spawn-handoff) uses **Continue — fill §§5–8 while implementing** as the default authorizing choice — not “executive override” wording.

## Plan-anchored context (optional inputs)

The developer starts **`coding-session`** on a detached lane, via mission dispatch, or as a **spawned child** of **`pr-plan`** (§5d).

When `targetPlanPath` / `targetPlanSlug` are known (message, `@` path, snapshot, or spawn `inputs`), use them for sidecar writes and the session prompt. When spawned from **`pr-plan`**, treat spawn `inputs` and `initiatingPrompt` as authoritative — do not re-resolve from documentation placeholders.

If `upstreamSkill` is **`pr-plan`** and `repoPath` is present in `inputs`, use it as hosting repo root. If repo targets are missing, stop and ask the developer with **AskQuestion** to choose or provide the hosting repo(s). Do not infer from focused files alone.

## Implementation consent (two layers)

Only **two** developer-consent layers apply before worktrees. Do not stack extra approval **AskQuestion** rounds for the same decision.

| Layer | Where decided | Output field | This skill |
|-------|---------------|--------------|------------|
| **1 — Planning handoff** | **`pr-plan`** §5c **Start coding session** + §5d spawn `inputs` | `readyForImplementation`, `planningHandoffApproved` | Hint only; **do not** re-ask. Does **not** authorize worktrees or advance **`.sedea/centers/software-development/missions/plan-and-deliver/plan.mdc`** §8 `phase` past `not-started`. |
| **2 — Worktree open** | [Worktree-open gate](#worktree-open-gate) **or** [Auto-authorize implementation (pr-plan spawn)](#auto-authorize-implementation-pr-plan-spawn) | `developerApprovedImplementation` | Set `true` after an authorizing gate choice **or** auto-authorize when spawn handoff + §§1–4 drafted (see below). |

**Not consent layers** (validation / setup only — no separate approval **AskQuestion**):

- **`plan-ws-completeness.mjs`** — script check; incomplete plans are handled inside the worktree-open gate (override option), not a second gate.
- **Repo selection** — **AskQuestion** only when `repoPath` / `repoPaths` are missing.

`inputs.developerApprovedImplementation` is never a substitute for layer 2 on **detached** entry; ignore upstream `true` until the developer picks an authorizing worktree-open option **or** [Auto-authorize implementation (pr-plan spawn)](#auto-authorize-implementation-pr-plan-spawn) applies on this run.


## Checkpoint turn UX (on-demand Read)

Under Checkpoint trust, gate surfaces and [Yield gate](#yield-gate-summary) follow the on-demand checkpoint UX doc — **not** duplicated here.

**Step-bound Read (binding):** Before opening any `USER_CHECKPOINT` on this lane, when [Yield gate](#yield-gate-summary) applies, or when § *Every developer-await turn* is in scope, `Read` [`docs/coding-session-checkpoint-ux.md`](../../docs/coding-session-checkpoint-ux.md) in full (no offset/limit). Apply marker syntax, three-stop model, developer-input vs external-wait, and post-merge Checkpoint chain from that doc.

### Yield gate (summary)

Under Checkpoint trust, **Yield** = StreamFinal mid-ship without same-turn Act while ship work remains open — **must** call `mission_control_present_structured_choice` before turn end. Full rules: checkpoint UX doc § *Yield gate*.

## Pre-worktree validation (plan completeness)

**Worktree validation** (see **`pr-plan`** §5b and **development-process.md** § *Planning readiness vs worktree completeness*). Independent of layer 1 **`readyForImplementation`**. **`readyForImplementation: true` does not skip this script** — run it unless validation is skipped or the user message already contains **`override incomplete plan`**.

When this run anchors Phase 2 to an operations plan **`.plan.md`** under **`.sedea/operations/`**, run validation **before** the [Worktree-open gate](#worktree-open-gate) — but **do not** use a separate completeness **AskQuestion**; record the script result and present override/stop choices in that single gate.

**Lane-change snapshots** (*back to plan*, *where are we?*, …) follow **30_planning-target-resolution.mdc** § *PR-plan completeness before coding-session*: when a snapshot lists both an incomplete per-PR plan and **coding-session**, **finishing the plan** must be ordered **first**.

**Skip** when there is **no** plan file anchor.

**Treat as override already chosen** when the user message contains **`override incomplete plan`** (ASCII, case-insensitive) — skip the script; proceed to the worktree-open gate.

Otherwise:

1. Resolve the plan’s **absolute** path. If you cannot, **stop** and ask for a path or `plan-state` linkage.
2. From **`HOSTING_ROOT`**:
 ```bash
 cd "$HOSTING_ROOT"
 .sedea/centers/sedea/scripts/run-sedea-node.sh .sedea/centers/software-development/missions/plan-and-deliver/scripts/plan-ws-completeness.mjs --file "<absolute-plan-path>"
 ```
 - Exit **0** (`OK` / `SKIP_NOT_PER_PR`) → `planCompleteness: complete` for the worktree-open gate.
 - Exit **1** (`INCOMPLETE`) → `planCompleteness: incomplete` — **do not** create worktrees yet; route to the worktree-open gate (pr-plan spawn handoff vs generic incomplete).
 - When [pr-plan spawn handoff detection](#pr-plan-spawn-handoff-detection) applies, `INCOMPLETE` is **expected** (§§5–8 still `_TBD_` by design). If stdout includes `EXPECTED_SECTIONS_5_8_TBD`, treat as the normal §5d handoff. Use [Spawned from `pr-plan` (expected incomplete)](#spawned-from-pr-plan-expected-incomplete) wording — not “plan not fully populated.”

**Multi-repo:** run the script **once** on the shared plan before the worktree-open gate or auto-authorize path.

- **Next-step resolution:** Auto-advance to [Auto-authorize release-note fragment ship](#auto-authorize-release-note-fragment-ship), [Auto-authorize implementation (pr-plan spawn)](#auto-authorize-implementation-pr-plan-spawn), or [Worktree-open gate](#worktree-open-gate) after recording `planCompleteness` — no `USER_CHECKPOINT` on this step.

## Auto-authorize release-note fragment ship

**Layer 2 waived** — no worktree-open modal when **`capture-release-note`** Step **4** **`approve-fragment`** already authorized ship (spawn passes **`fragmentShipAutoAdvance: true`**).

### Eligibility (all required)

1. [Release-note fragment spawn detection](#release-note-fragment-spawn-detection) applies.
2. `inputs.readyForImplementation === true`.
3. `inputs.repoPath` is absolute hosting root.

### When eligible — act without modal

1. Set `outputs.developerApprovedImplementation: true`.
2. State one informational line (no modal): *Release-note fragment approved on capture lane — auto-shipping to origin/main.*
3. Proceed immediately to [Generic flow](#generic-flow-single-repo) — then [Release-note fragment ship profile (Checkpoint — binding)](#release-note-fragment-ship-profile-checkpoint--binding).
4. Do **not** call **`mission_control_present_structured_choice`** for worktree-open on this path.

- **Next-step resolution:** Auto-advance to [Release-note fragment ship profile (Checkpoint — binding)](#release-note-fragment-ship-profile-checkpoint--binding) when eligible — no `USER_CHECKPOINT` on this path.

## Auto-authorize implementation (pr-plan spawn)

**Layer 2 waived** — no worktree-open **AskQuestion** or **`mission_control_present_structured_choice`** when the developer already approved **Start coding session** on the **`pr-plan`** lane and the PR plan is ready to implement.

### Eligibility (all required)

1. [pr-plan spawn handoff detection](#pr-plan-spawn-handoff-detection) applies.
2. `inputs.planningHandoffApproved === true` **or** (`inputs.readyForImplementation === true` **and** `inputs.upstreamSkill === "pr-plan"`).
3. `inputs.promptOnly` is not `true`.
4. `inputs.repoPath` or non-empty `inputs.repoPaths` is present.
5. After [Pre-worktree validation](#pre-worktree-validation-plan-completeness), **either**:
 - `planCompleteness: complete` (`plan-ws-completeness.mjs` exit **0** / `OK`), **or**
 - `planCompleteness: incomplete` **and** stdout included `EXPECTED_SECTIONS_5_8_TBD` (§§ **1–4** drafted; §§ **5–8** may stay `_TBD_`).

### When eligibility fails

| Failure | Action |
|---------|--------|
| §§ **1–4** still contain `_TBD_` (incomplete without `EXPECTED_SECTIONS_5_8_TBD`) | [Worktree-open gate](#worktree-open-gate) — generic incomplete options; do **not** auto-authorize |
| `readyForImplementation: false` or `planningHandoffApproved` not set | [Worktree-open gate (pr-plan spawn handoff)](#worktree-open-gate-pr-plan-spawn-handoff) or generic gate |
| Missing `repoPath` / `repoPaths` | **AskQuestion** once for repo only — not a second planning-approval round |
| Detached / snapshot entry (no spawn handoff) | [Worktree-open gate](#worktree-open-gate) — layer 2 required |

### When eligible — act without modal

1. Set `outputs.developerApprovedImplementation: true` and `outputs.planCompleteness` from validation.
2. State one informational line (no modal): *Planning handoff approved on **pr-plan** lane. §§1–4 ready — implementing; §§5–8 fill on this lane as code lands.* When `planCompleteness: complete`, use: *PR plan complete — implementing.*
3. Proceed immediately to [Generic flow](#generic-flow) (center setup, sidecar, attach) — then [Spawned implementation lane](#spawned-implementation-lane).
   - **Bootstrap gate (binding):** Step **1** **`worktree-setup.sh`** must exit **0** and hint **`bootstrapStatus`** must allow implementation (**`success`**, **`skipped-noop`**, or **`skipped-idempotent`**).
   - Set **`outputs.bootstrapStatus`** from the setup hint before product edits.
   - **If setup fails or bootstrap hint is not success-class:** STOP — no product edits, no §§5–8, no ship chain. Follow **Failure** under [Worktree bootstrap (mandatory)](#worktree-bootstrap-mandatory).
   - **Forbidden substitute:** extension-level `npm ci`, `tsc`, or vitest passing does **not** set `bootstrapStatus: success` when setup exited non-zero.
4. Do **not** call **`mission_control_present_structured_choice`** for worktree-open on this path.

- **Next-step resolution:** Auto-advance to [Generic flow](#generic-flow-single-repo) when eligible — no `USER_CHECKPOINT` on this path.

## Worktree-open gate

**Layer 2 — single AskQuestion** before any center **`worktree-setup.sh`**, sidecar session write, Mission Control worktree attach, or coding-agent prompt emission — **skip** when [Auto-authorize implementation (pr-plan spawn)](#auto-authorize-implementation-pr-plan-spawn) applies. After approval, [Generic flow](#generic-flow-single-repo) step **1** is **center setup only**; step **3** is **`sedea_add_worktree_folder` only** — see [Hard rules](#hard-rules--git-worktree-vs-workbench-attach-binding).

**Recap and structured choice:** Summarize completeness / plan path in **`displayMarkdown`** when calling **`mission_control_present_structured_choice`**. On spawned lanes, **call MCP structured choice** — see [Spawned lane — MCP structured choice (binding)](#spawned-lane--mcp-structured-choice-binding). Open every gate via **AskQuestion** or **`mission_control_present_structured_choice`** — prefer one message for recap + modal. See **`../README.md`** § *Recap, structured choice, act (plan-and-deliver)*, **`.sedea/centers/sedea/rules/2_ask-question-instructions.mdc`**, and **`.cursor/rules/mission-control-agent-runtime.mdc`**.

**Branch first:** when [Auto-authorize release-note fragment ship](#auto-authorize-release-note-fragment-ship) applies, **skip this entire section**. When [Auto-authorize implementation (pr-plan spawn)](#auto-authorize-implementation-pr-plan-spawn) applies, **skip this entire section**. When [pr-plan spawn handoff detection](#pr-plan-spawn-handoff-detection) applies but auto-authorize does not, use [Worktree-open gate (pr-plan spawn handoff)](#worktree-open-gate-pr-plan-spawn-handoff) below — even when `planCompleteness: complete`. Otherwise use the generic tables in this section.

### Worktree-open gate (pr-plan spawn handoff)

When [pr-plan spawn handoff detection](#pr-plan-spawn-handoff-detection) applies:

**Required recap** (include in `displayMarkdown` or recap prose before the modal):

*Planning handoff complete (§§1–4). §§5–8 fill on this lane during implementation.*

When `planCompleteness: incomplete`, add one line: *Validation reported incomplete because §§5–8 are still `_TBD_` — expected after **pr-plan** spawn.*

USER_CHECKPOINT — authorize worktree and implementation on this lane.

**Required options** (`modalTitle`: *Coding session — start implementation*; list in this order):

| Option id | Label |
|-----------|--------|
| `continue-fill-5-8` | Continue — fill §§5–8 while implementing |
| `revise-plan` | Revise PR plan first |
| `change-repo` | Change repo or worktree settings |
| `defer` | Defer implementation |
| `more-details` | More details for option _ |

- Do **not** label the primary path “executive override” or imply **`pr-plan`** failed.
- Do **not** list **Stop — I'll complete the plan first** before **Continue — fill §§5–8 while implementing** on this path (that stop option is for detached / snapshot entry in the generic incomplete gate).
- **`continue-fill-5-8`** → `outputs.developerApprovedImplementation: true` (authorizing).
- All other options → `developerApprovedImplementation: false`.
- **`defaultOptionId: continue-fill-5-8`** when §§1–4 are drafted and spawn handoff applies.

When `planCompleteness: complete` on a pr-plan spawn handoff, use the generic **complete** option set below (rare — plan fully drafted before coding).

### Generic worktree-open gate

USER_CHECKPOINT — authorize worktree and implementation on this lane.

**When `planCompleteness: complete`** (or validation skipped / override already in the user message), required options:

- **Start implementation now**
- **Revise PR plan first**
- **Change repo or worktree settings**
- **Defer implementation**
- **More details for option _**

**When `planCompleteness: incomplete`** (and **not** [pr-plan spawn handoff detection](#pr-plan-spawn-handoff-detection)), required options (do **not** offer plain **Start implementation now** without override):

- **Start with incomplete plan (executive override)**
- **Stop — I'll complete the plan first**
- **Revise PR plan first**
- **Change repo or worktree settings**
- **Defer implementation**
- **More details for option _**

**Authorizing choices** (set `outputs.developerApprovedImplementation: true`):

- **Start implementation now** — only when `planCompleteness: complete` (generic gate).
- **Continue — fill §§5–8 while implementing** (`continue-fill-5-8`) — pr-plan spawn handoff when `planCompleteness: incomplete`.
- **Start with incomplete plan (executive override)** — generic incomplete gate only (detached / snapshot entry).

All other choices → `developerApprovedImplementation: false`; end or stay `continuationStatus: active` without worktrees. A prior **`pr-plan`** menu option does not substitute for this gate.

## Execution mode after worktree attach

After [Pre-worktree validation](#pre-worktree-validation-plan-completeness), an authorizing [Worktree-open gate](#worktree-open-gate) choice, worktree creation, sidecar writes, and Mission Control attach, choose **one** mode:

| Mode | When | After attach |
|------|------|--------------|
| **Spawned implementation lane** | Mission Control **spawned child** (`mission_control_spawn_agent` for this skill) **and** `outputs.developerApprovedImplementation: true` **and** `inputs.promptOnly` is not `true` **and** the developer did not choose **Defer implementation** at the gate | Continue on **this lane** — [Spawned implementation lane](#spawned-implementation-lane) |
| **Prompt-only handoff** | Detached natural-language entry, **re-use a prior session prompt**, planning snapshot handoff without spawn, `inputs.promptOnly: true`, **Defer implementation**, or Squad Leader orchestration that only needs an external coding chat | [Prompt-only handoff](#prompt-only-handoff) — emit fenced prompt and **stop** |

**Orientation (spawned lane):** Tell the developer you are **implementing on this worktree on this lane**. Do **not** say “paste the prompt in another session” unless **prompt-only** mode applies.

## Spawned implementation lane

Normative path when **`pr-plan`** (or another spawner) opens a **coding-session** child lane and layer 2 is satisfied.

1. **Scope guard** — Edit only files under the attached worktree root(s). Resolve hosting repo root vs worktree per **20_efficient-pr-shipping.mdc**.
2. **Bootstrap prerequisite (assert first)** — If `outputs.bootstrapStatus !== 'success'` (and no documented attested `--skip-*` in `outputs.bootstrapSkipFlags`), this section is **out of scope**. Only bootstrap recovery per [Worktree bootstrap (mandatory)](#worktree-bootstrap-mandatory) is allowed until success or attested skip flags are recorded. When bootstrap is `pending` or `failed`, **stop** — do not warm up, read the plan for implementation, or edit the worktree. **Forbidden until `outputs.bootstrapStatus: success`:** worktree product edits, plan §§ **5–8** fill, tests, local `npm` / compile, `git commit`, `git push`, [Ship cut-point gate](../../docs/coding-session-ship-chain.md#ship-cut-point-gate-approve-commit-before-deploy), inline **`deploy-walk`** (Before deploy), spawn **`pre-pr-review`**, inline **`create-pr`**, and ad-hoc Before-deploy checkbox edits that substitute for [Before deploy deploy-walk handoff](#before-deploy-deploy-walk-handoff).
3. **Warm-up on this lane** — Follow [Session prompt structure](#session-prompt-structure) Phase 1 steps (workspace readiness, worktree name check, load **Project rules** from the worktree, plan file + sidecar when anchored). You may skip emitting a fenced **external** session prompt unless the developer asks for a copy.
4. **Read the anchored PR plan** — Load `targetPlanPath` (from spawn `inputs` / `initiatingPrompt`). Use §§ **1–4** for scope context; **first implementation work** is substantive fill of §§ **5–8** (replace `_TBD_` as code paths become known), then code/tests/docs per those sections.
5. **Implement** — Make hosting-repo edits (code, tests, docs) in the worktree until **implementation ready for developer review** or a blocking stop. **Do not** `git commit` or `git push` during implementation — see **20_efficient-pr-shipping.mdc** § *Review before commit* and [Ship cut-point gate](../../docs/coding-session-ship-chain.md#ship-cut-point-gate-approve-commit-before-deploy) (ship cut-point also requires `outputs.bootstrapStatus: success`). Maintain **`## Follow-ups`** on the PR plan per **development-process** § *Coding Session*.
6. **Continuation** — Keep `outputs.continuationStatus: "active"` and `outputs.shipPhase: "implementing"` while work remains. Emit **`mission_control_send_agent_result`** with `status: partial` when blocked; do **not** use `continuationStatus: terminal` to mean “prompt emitted — hand off elsewhere.”
7. **Repo rules reconciliation** — When plan-anchored, run [Repo rules reconciliation (binding)](#repo-rules-reconciliation-binding) and pass [Repo rules reconciliation gate](#repo-rules-reconciliation-gate) before step **8** or [Ship cut-point gate](../../docs/coding-session-ship-chain.md#ship-cut-point-gate-approve-commit-before-deploy). Skip when `anchorType` is free-form or plan **§5** is `_None — no repo rule updates required for this PR._` only.
8. **Pre-review verification** — Before [Ship cut-point gate](../../docs/coding-session-ship-chain.md#ship-cut-point-gate-approve-commit-before-deploy), complete pre-review verification prescribed by applicable **Project rules** paths (hosting-repo **`.cursor/rules/*.mdc`** listed in the session prompt or plan **§5**). **`Read`** each cited rule and run its before-review steps; re-run after each implementation batch. Block the review modal until every prescribed step passes (**exit 0**). Commands and repo-specific paths live in those hosting rules only — do not duplicate them in this skill.
9. **Ship chain** — When implementation is ready for developer review, step **7** reconciliation passes (or is skipped), and step **8** passes (or no Project rule prescribes verification), **`Read`** [`docs/coding-session-ship-chain.md`](../../docs/coding-session-ship-chain.md) in full, then follow [Ship chain after implementation (on-demand Read)](#ship-chain-after-implementation-on-demand-read) on **this same lane**. **Do not** skip Before deploy or open a PR before that order completes.

## Repo rules reconciliation (binding)

Plan-anchored runs must reconcile plan **§5 Repo rules impact** with the **hosting-repo** worktree diff **before** [Pre-review verification](#spawned-implementation-lane) step **8** and **before** [Ship cut-point gate](../../docs/coding-session-ship-chain.md#ship-cut-point-gate-approve-commit-before-deploy). Normative contract: **`40_maintain-rules.mdc`** § *Plan-anchored PRs* and **development-process.md** § *Align hosting-repo rules before commit and push*.

**Out of scope:** Sedea center rules under **`.sedea/centers/`** — those use **`improve center rules`**, not §5 hosting-repo bullets.

### Procedure

1. **Read plan §5** — Load **`## 5. Repo rules impact`** (or legacy **`## N. Repo rules impact`**) from `targetPlanPath`.
2. **Classify each bullet** per **`40_maintain-rules.mdc`** § *Plan-anchored PRs*:

| Class | §5 signal | Agent action |
|-------|-----------|--------------|
| **Action** | Names **`.cursor/rules/*.mdc`** with **update** / **extend** / **add** | Apply the **`.mdc` edit in `WORKTREE_ROOT`** in this PR |
| **Verify-only** | **no file edit**, **verify only**, **skip unless …** | Confirm code obeys the existing rule; no `.mdc` diff required |
| **`_None_`** | Single bullet `_None — no repo rule updates required for this PR._` | Skip reconciliation; record `outputs.repoRulesReconciliationStatus: skipped-none` |

3. **Apply action bullets** — Edit only under **`WORKTREE_ROOT/.cursor/rules/`**. Update plan **§5** when implementation reveals new rule paths or honest deferral (revise bullets so plan ↔ repo cannot drift).
4. **Record outputs** — Set `outputs.reconciledRepoRulesPaths` (array of absolute paths touched or verified) and `outputs.repoRulesReconciliationStatus`: `complete` | `skipped-none` | `pending`.
5. **Re-run after code batches** that might change §5 intent or rule applicability.

**Forbidden:** reaching [Ship cut-point gate](../../docs/coding-session-ship-chain.md#ship-cut-point-gate-approve-commit-before-deploy) or spawning **`pre-pr-review`** while action bullets lack matching **`.mdc` diffs** and §5 was not revised to document deferral.

## Prompt-only handoff

Reserved when this run is **not** a spawned implementation lane (see table above).

1. Complete Generic flow steps **1–4** (including center setup bootstrap hints — wait for **`outputs.bootstrapStatus: success`**) before emitting the external prompt.
2. Emit a **session prompt** per [Session prompt structure](#session-prompt-structure) inside a [copy/paste-safe](#copypaste-safe-prompt-output-required) fence. State that bootstrap completed (`outputs.bootstrapStatus: success`) or document failure and that the external agent must not implement until bootstrap succeeds.
3. Set `outputs.sessionPromptEmitted: true` and `outputs.implementationMode: "prompt-only"`.
4. **Stop** — do not `cd` into the worktree to implement on this lane until step 1 reports bootstrap success.
4. When the developer later continues on **this** or another lane after implementation review, this skill owns [Ship chain after implementation](../../docs/coding-session-ship-chain.md#ship-chain-after-implementation-coding-session-lane) from the appropriate step.

Detached developers may paste the prompt into a separate Mission Control session; that session then follows the same skill as an implementation lane once layer 2 is satisfied there.

## Copy/paste-safe prompt output (required)

When you emit the final session prompt for the user to paste into **a separate coding agent** session (**prompt-only** mode):

- Wrap the **entire session prompt** in a fenced markdown code block (default ` ```text … ``` `).
- If the body contains triple backticks, use a four-backtick outer fence or escape inner fences.
- Keep explanatory prose **outside** the fence.

## Generic flow (single repo)

Run only **after** [Pre-worktree validation](#pre-worktree-validation-plan-completeness) and an authorizing choice in the [Worktree-open gate](#worktree-open-gate).

1. **Center worktree setup** — from **`HOSTING_ROOT`**, run **`.sedea/centers/sedea/scripts/worktree-setup.sh`** (see [Center worktree scripts (binding)](#center-worktree-scripts-binding)):

 ```bash
 HOSTING_ROOT="<absolute-hosting-root>"   # spawn inputs.repoPath or walk-up to .sedea/centers/sedea/
 WORKTREE_ROOT="<absolute-sibling-path>"   # repo basename prefix per rule 20
 WORKTREE_NAME="<worktree-name>"           # rule 7 / rule 20
 BASE_REF="${baseRef:-origin/main}"

 "$HOSTING_ROOT/.sedea/centers/sedea/scripts/worktree-setup.sh" \
   --hosting-root "$HOSTING_ROOT" \
   --worktree-path "$WORKTREE_ROOT" \
   --worktree-name "$WORKTREE_NAME" \
   --base-ref "$BASE_REF"
 ```

 - **Forbidden (step 1):** **`sedea_add_worktree_folder`** — MCP attach is step **3** only. **Forbidden:** inline **`git worktree add`** / dirty-primary **`git status`** gate on the default path when this script exists on **`HOSTING_ROOT`**.
 - Worktree naming: **`.sedea/centers/software-development/rules/20_efficient-pr-shipping.mdc`** § *Worktree naming* (primary **hosting repo** → Sedea **`.sedea/centers/sedea/rules/7_stacked-pr-worktree-naming.mdc`**).
 - **Exit 0:** parse the stdout JSON line; set **`WORKTREE_ROOT`**, **`outputs.bootstrapMode`**, **`outputs.bootstrapStatus`** from hint (**`success`**, **`skipped-noop`**, **`skipped-idempotent`** → implementation allowed).
 - **Non-zero:** parse failure JSON when present; set **`outputs.bootstrapStatus: failed`**, **`outputs.bootstrapFailureReason`** from **`message`**; stop with structured retry — exit **10** dirty primary (developer resolves on **`HOSTING_ROOT`**); exit **11** warm-primary (**no `full` fallback** on center path); exit **12** overlay missing / mode not allowed.
 - If `baseRef` input is supplied, it must be a remote integration ref such as `origin/main`; do not accept a local-only ref for worktree creation.

2. **Record the session on the plan** (see [Sidecar state](#sidecar-state)). From **`HOSTING_ROOT`**:
 ```bash
 cd "$HOSTING_ROOT"
 .sedea/centers/sedea/scripts/run-sedea-node.sh .sedea/centers/software-development/missions/plan-and-deliver/scripts/plan-state.mjs set-worktrees \
 --slug <plan-slug> \
 --json '[{"repo":"<repo-basename>","path":"<absolute-worktree-path>"}]'
 .sedea/centers/sedea/scripts/run-sedea-node.sh .sedea/centers/software-development/missions/plan-and-deliver/scripts/plan-state.mjs set-session \
 --slug <plan-slug> \
 --focus <absolute-worktree-path>
 ```
 Skip when the session has no plan anchor.

3. **Attach the worktree in Sedea** (same workbench) — when setup JSON **`nextAction`** is **`attach-required`**, invoke MCP **`sedea_add_worktree_folder`** with JSON `{ "path": "<absolute-worktree-root>" }` (optional `"name"` for the explorer label). See **20_efficient-pr-shipping.mdc** — *Squad Leader on HOSTING_ROOT vs agent sessions in worktrees* and *Attach the worktree in Sedea*.

 - **Forbidden (step 3):** Do **not** use editor **Add Folder to Workspace**, hand-edited **`.code-workspace`** files, or “open folder” as a substitute for **`sedea_add_worktree_folder`**. Workbench attach is **`sedea_add_worktree_folder` only** (after step 1 succeeds).

 This MCP attach is mandatory before post-setup work. If the MCP call fails, stop with `partial`; report the worktree path and the attach error, and keep `continuationStatus: "active"` so the Squad Leader does not close the implementation lane.

4. **Bootstrap complete (default path)** — When step **1** hint **`bootstrapStatus`** is **`success`**, **`skipped-noop`**, or **`skipped-idempotent`**, set **`outputs.bootstrapStatus: success`** (and **`outputs.bootstrapMode`** from hint). Set **`outputs.shipPhase: worktree`** on the first MCP result call that reports setup complete. **Do not** run inline **`worktree-bootstrap`** on the default path. **Exception:** retry only per [Worktree bootstrap (inline mandatory)](#worktree-bootstrap-inline-mandatory) when setup failed or developer attests **`--skip-*`** on a follow-up turn.

5. **Branch** per [Execution mode after worktree attach](#execution-mode-after-worktree-attach):
 - **Spawned implementation lane** → continue with [Spawned implementation lane](#spawned-implementation-lane) (steps 1–7 there).
 - **Prompt-only handoff** → [Prompt-only handoff](#prompt-only-handoff).

## Worktree bootstrap (mandatory)

After Generic flow step **3** (`sedea_add_worktree_folder`) succeeds, **`outputs.bootstrapStatus: success`** must be set from center setup hints (step **1**) before **implementation**, **commit**, **Before deploy** **`deploy-walk`**, and the rest of the [ship chain](../../docs/coding-session-ship-chain.md#ship-chain-after-implementation-coding-session-lane).

**Resolve paths**

- **`HOSTING_ROOT`** — hosting repo that contains `.sedea/centers/sedea/` (see **20_efficient-pr-shipping.mdc** § *Hosting repo cwd for scripts*). Use spawn `inputs.repoPath` when it points at that root.
- **`WORKTREE_ROOT`** — absolute path from setup hint **`worktreeRoot`** / step **1** `--worktree-path`.

**Normative path:** center **`worktree-setup.sh`** in Generic flow step **1** — bootstrap runs inside the shell; map hint **`bootstrapStatus`** to **`outputs`**.

**Retry / exception path:** [Worktree bootstrap (inline mandatory)](#worktree-bootstrap-inline-mandatory) — inline **`worktree-bootstrap`** only when setup failed and the developer attests retry. **Not** the default after successful setup.

**`--skip-*` flags** — Use only when the developer attests partial setup. Record flags in chat and in `outputs.bootstrapSkipFlags`.

**Success** — Set `outputs.bootstrapStatus: success`, then continue to Generic flow step 5. Set `outputs.shipPhase: worktree` on the first MCP result call that reports setup complete (before `implementing`).

**Failure** — When bootstrap fails:

1. Capture stderr/stdout tail in `outputs.bootstrapFailureReason`.
2. Emit **`mission_control_send_agent_result`** with `status: partial`, `outputs.bootstrapStatus: failed`, `outputs.shipPhase: worktree`, `outputs.developerApprovedImplementation: true`, `outputs.continuationStatus: active`.
3. **Do not** advance into implementation or the ship chain (`git commit`, [Ship cut-point gate](../../docs/coding-session-ship-chain.md#ship-cut-point-gate-approve-commit-before-deploy), Before deploy **`deploy-walk`**, **`pre-pr-review`**, **`create-pr`**) until bootstrap succeeds.
4. Offer re-run inline per [Worktree bootstrap (inline mandatory)](#worktree-bootstrap-inline-mandatory); **`--skip-*`** only after developer attestation.
5. **Same-turn stop:** Call **`mission_control_present_structured_choice`** as the first line of the response (spawned lane MCP structured choice). **Forbidden in this turn:** any hosting-repo file edit, plan §§5–8 updates, tests run for implementation validation, ship cut-point, or commit.
6. **AskQuestion options (minimum):** Retry center setup · Retry inline worktree-bootstrap · Retry with developer-attested `--skip-*` · Defer · More details for option _.

The partial terminal in step 2 may accompany the modal but does **not** replace the structured retry choice.

**Missing script** — Stop with `partial`, `bootstrapStatus: failed`, `bootstrapFailureReason` naming the missing path, `shipPhase: worktree`.

## Worktree bootstrap (inline mandatory — retry / exception only)

**Default path:** center **`worktree-setup.sh`** (Generic flow step **1**) — **do not** run this section when setup exited **0** with success-class **`bootstrapStatus`**.

Use **only** when setup failed and the developer chooses retry with attested **`--skip-*`**, when **`worktree-setup.sh`** is unavailable on **`HOSTING_ROOT`**, or when a protocol step explicitly requires inline bootstrap instead of center setup.

1. Set `outputs.bootstrapStatus: pending`.

2. **Execute inline** — In the **same agent session**, read and follow [`.sedea/centers/software-development/missions/plan-and-deliver/skills/worktree-bootstrap/SKILL.md`](../worktree-bootstrap/SKILL.md) with **inline** context:

| Field | Value |
|-------|--------|
| `worktreePath` | Absolute **`WORKTREE_ROOT`** |
| `hostingRoot` | Absolute **`HOSTING_ROOT`** |
| `targetPlanPath` / `targetPlanSlug` | When plan-anchored |
| `worktreeName` | Worktree name when known |
| `bootstrapSkipFlags` | Array of attested `--skip-*` tokens, or omit |
| `ledgerParent` | When known |
| `upstreamSkill` | `"coding-session"` |

Follow that skill’s **Completion (inline)** — report `bootstrapStatus`, `bootstrapFailureReason`, and `bootstrapSkipFlags` in prose/`outputs` on this lane. Do **not** emit `mission_control_spawn_agent` for bootstrap on the default path.

3. **Wait** — Do **not** proceed to Generic flow step 5, warm-up, plan §§ **5–8**, product edits, tests, or `npm` until `outputs.bootstrapStatus: success`.

4. **Blocked until `outputs.bootstrapStatus: success`:** all implementation work, `git commit`, `git push`, [Ship cut-point gate](../../docs/coding-session-ship-chain.md#ship-cut-point-gate-approve-commit-before-deploy), [Before deploy deploy-walk handoff](#before-deploy-deploy-walk-handoff), spawn **`pre-pr-review`**, inline **`create-pr`**.

5. **Multi-repo** — Run inline bootstrap **sequentially** for each **`WORKTREE_ROOT`** (complete one repo’s bootstrap before starting the next). All repos must reach `outputs.bootstrapStatus: success` before any cross-repo implementation.

6. **Retry** — On failure, re-run inline bootstrap (idempotent script) after developer attestation for any **`--skip-*`** flags; do not start implementation until success.

### Bootstrap anti-patterns (binding)

| Anti-pattern | Correct action |
|--------------|----------------|
| Ran `bootstrap-worktree-dev.sh` without reading `worktree-bootstrap/SKILL.md` inline | Read skill inline; set and report `bootstrapStatus` |
| Script exit non-zero but `tsc`/vitest passed | `bootstrapStatus: failed`; stop; modal retry |
| Auto-authorize path skips bootstrap | Auto-authorize skips worktree-open modal only |
| “Bootstrap note” in ship recap without `bootstrapStatus` in outputs | Set outputs; stop at failure before implementation |
| Retry with undocumented `--skip-*` | Developer attestation first; record in `bootstrapSkipFlags` |

**Forbidden (default path):** Emit **`mission_control_spawn_agent`** for **`worktree-bootstrap/SKILL.md`**. Center **`worktree-setup.sh`** owns bootstrap on the default path; retry uses **inline** [`worktree-bootstrap/SKILL.md`](../worktree-bootstrap/SKILL.md) per [Worktree bootstrap (inline mandatory)](#worktree-bootstrap-inline-mandatory) only.

## Multi-repo flow (shared worktree name)

When the plan’s **Worktree setup** lists two or more repos, or the user asks for a cross-repo session:

1. For **each** repo, run **`.sedea/centers/sedea/scripts/worktree-setup.sh`** from that repo's **`HOSTING_ROOT`** with the **same worktree name** (unless the plan says otherwise) — never **`sedea_add_worktree_folder`** for creation (see [Hard rules](#hard-rules--git-worktree-vs-workbench-attach-binding)).
 - Validate setup exit codes before creating the next repo's worktree. If one repo's setup fails, stop before a partial multi-repo session.

2. Optionally create a **`.code-workspace`** file listing each worktree folder with absolute `path` values — use only if your team uses that layout; otherwise attach **each** worktree root with **`sedea_add_worktree_folder` only** in turn (never editor **Add Folder to Workspace**).

3. **`plan-state.mjs set-worktrees`** with one JSON entry per repo; **`set-session --focus`** to the workspace file **or** primary worktree path per your team convention (must stay consistent with **`resolve --cwd`** expectations in **planning-target-resolution**).

4. **Attach each worktree** with **`sedea_add_worktree_folder` only** (after each step-1 setup succeeds), then confirm **`outputs.bootstrapStatus: success`** from each setup hint before any implementation or prompt for that repo.

5. **Branch** per [Execution mode after worktree attach](#execution-mode-after-worktree-attach) (spawned lane implements each repo’s scope in turn, or prompt-only emits **one session prompt per repo** with per-repo scope guards).

6. **Prompt-only:** **Stop** after prompts. **Spawned lane:** continue implementation per repo scope before the [ship chain](../../docs/coding-session-ship-chain.md#ship-chain-after-implementation-coding-session-lane).


## Ship chain after implementation (on-demand Read)

Normative ship order on the spawned implementation lane — cut-point through §8 re-emit. **Do not** skip steps or jump to `create-pr` before `pre-pr-review`.

**Step-bound Read (binding):** When [Spawned implementation lane](#spawned-implementation-lane) step **9** begins, or when resuming an incomplete ship chain, `Read` [`docs/coding-session-ship-chain.md`](../../docs/coding-session-ship-chain.md) in full (no offset/limit). Follow that doc for cut-point, Before deploy, pre-PR spawn, create-pr, post-create-pr, merge, cleanup, deploy-walk, plan-reconcile, §8 `outputs`, and terminal `outputs` field catalog.

| Step | On-demand doc section |
|------|------------------------|
| 9 Ship chain entry | § *Ship chain after implementation* |
| Cut-point / commit | § *Ship cut-point gate* |
| Pre-PR / create-pr | § *Pre-PR review handoff* · § *Inline create-pr* |
| Post-create / review / merge | § *Post-create-pr handoff gate* · § *Agent-delegated PR approve and merge* · § *Post-merge ship mechanics script* |
| Post-merge / §8 sync | § *Post-merge ship mechanics script* · § *Post-merge workspace cleanup* · § *§8 host sync* |
| Terminal MCP result | § *Implementation handoff result* |

**Checkpoint gates during ship:** After loading ship-chain doc, load checkpoint UX doc at each `USER_CHECKPOINT` named in the ship-chain section you are executing.

## Stale worktree detection (detect-only)

Post-merge **worktree removal**, **`HOSTING_ROOT` `git pull origin main`**, and **local worktree name ref cleanup** run on this lane in [Post-merge workspace cleanup](#post-merge-workspace-cleanup) **after PR merge and before** [After deploy deploy-walk handoff](#after-deploy-deploy-walk-handoff). **Mechanical** merge verify, ff-only pull, and §8 field extraction use binding **`post-merge-ship-mechanics.mjs`** per [ship-chain doc § Post-merge ship mechanics script](../../docs/coding-session-ship-chain.md#post-merge-ship-mechanics-script-binding) — **forbidden** ad-hoc shell duplicate when the script applies.

| Rule | Behavior |
|------|----------|
| **Forbidden** | Proactive **AskQuestion** or chat offers to run full **`plan-reconcile`** archive + cleanup as routine post-merge wrap-up before After deploy |
| **Forbidden** | Destructive git cleanup outside [Post-merge workspace cleanup](#post-merge-workspace-cleanup) (authorized apply) or **`plan-reconcile`** §5 fallback |
| **When to detect** | After **`prState: merged`** (post-create-pr, **`check-pr-status`**, or developer return) before After deploy walk |
| **How** | From **`HOSTING_ROOT`**: `.sedea/centers/sedea/scripts/run-sedea-node.sh …/plan-state.mjs detect-stale-workspaces --slug <slug> --json` |
| **If empty** | One line: no stale worktree paths on disk — proceed to [After deploy deploy-walk handoff](#after-deploy-deploy-walk-handoff) when merge confirmed |
| **If stale** | Short recap (path, worktree name, **`mergedPr`**) then route to [Post-merge workspace cleanup](#post-merge-workspace-cleanup) — **not** remove-worktree options on this detect-only pass |
| **After deploy / archive** | [Plan-reconcile handoff (inline)](#plan-reconcile-handoff-inline) for archive when deploy verification **`done`** — §5 cleanup skips paths already cleaned |

## Sidecar state

Writes go through **`plan-state.mjs`** into **`<slug>.state.yaml`** next to **`<slug>.plan.md`** under **`.sedea/operations/.../plans/`** — never plan frontmatter for `worktrees` / `session`.

```yaml
worktrees:
 - repo: <repo-basename>
 path: <absolute-path>
session:
 focusPath: <absolute-path>
```

- Always a **list** for `worktrees`, even when length is 1.
- **`set-worktrees` replaces the list wholesale** — one active worktree set per plan for this protocol’s session model.
- Absolute paths only (no `~`).
- Skip sidecar updates when there is no plan anchor.

## Session prompt structure

**Block order:** title line → blank line → **Project rules** → **Warm-up** → `---` on its own line → **Task** (Phase 2).

### Project rules bundle (emitter must curate)

Infer touched subtrees from the anchored plan and PR scope. List **absolute** paths to **`<worktree>/.cursor/rules/*.mdc`** the worker must `Read` during warm-up.

- Paths must point at the **worktree**, not the main clone.
- **De-duplicate** and order: baseline → architecture → area-specific.
- **No vendor-specific matrix** — curate from plan headings, § 5 repo rules impact, and file paths. **Repo-specific** path patterns (extra hosting repo roots, package sub-trees, etc.) belong in **that hosting repo’s** `.cursor/rules/*.mdc` — keep this center skill **repo-agnostic**.
- **Pre-review rules** — When plan **§5** or scope calls for hosting-repo prep before developer review, include every **`.cursor/rules/*.mdc`** path that prescribes pre-review verification so the worker runs them before [Ship cut-point gate](../../docs/coding-session-ship-chain.md#ship-cut-point-gate-approve-commit-before-deploy) (commands stay in those files — see **40_maintain-rules.mdc**).

### Phase 1 — Warm-up (before the task)

Software Development **center** rules (`10_`–`40_`, all `alwaysApply: true`) load on every dispatch via Mission Control. This warm-up block is for **hosting-repo** `.cursor/rules/*.mdc` paths under **Project rules** — list explicit `Read` steps for those only.

**Four vs five steps:** If Phase 2 links a **`.plan.md`** (absolute path), use **five** steps and include **Plan file + sidecar** (step 5). Otherwise use **four** steps (omit step 5).

Phrase a hard gate, e.g. `Warm-up first — do not read the task body below --- until every step above is done and acknowledged`.

1. **Workspace readiness** — **Read** the worktree **`README`** and **`CONTRIBUTING`** when present. For **readiness or pre-task checks**, follow **only** what those files say, what the **plan** explicitly links for setup, and what **`.cursor/rules/*.mdc`** files prescribe **when they describe pre-work or environment gates** (do not invent extra checks). If nothing prescribes a check, one line **Readiness: no checks in README / CONTRIBUTING / cited rules** — continue. If a prescribed check fails, **stop** and ask the user.
2. **Verify worktree name:** `git branch --show-current` (worktree name ref) matches the expected **worktree name**.
3. **Process handback** — the **developer** continues via **AskQuestion** (per **30_planning-target-resolution** when a pick is required) or a separate mission dispatch per **development-process**. Name next moves with protocol branches (**`plan-reconcile`**, **`pre-pr-review`**, **`pr-review`**, rule **20** § *Commit and push cadence*).
4. **Load project rules:** `Read` every path under **Project rules**; acknowledge before continuing.
5. **Plan file + sidecar** *(plan-anchored only)*: Plans live under **`.sedea/operations/.../plans/`**; runtime fields (`worktrees`, `prs`, `session`, `parent`, **`status`**, **`archived`**, todos via scripts) follow the **`.sedea/operations/`** plan union and **`plan-state.mjs`** contracts per **`.sedea/centers/sedea/rules/8_operations-plan-sidecar-contract.mdc`**. Flip todo **`status`** only through **`plan-state.mjs`** subcommands (`set-todo-status`, `todo-start`, `todo-done`); flip plan lifecycle dot via **`set-plan-status`** or archive/reconcile paths — do not hand-edit `.state.yaml` except to repair a bad state. After substantive progress on a scoped todo, update status so the operations plan tree stays accurate. PR linkage after push follows **20_efficient-pr-shipping** and **`plan-state.mjs upsert-pr`**.

### Phase 2 — Task

Include:

- Which PR to implement (scope, behaviour, files).
- **Plan link:** absolute path to the `.plan.md` (e.g. `@/…/.sedea/operations/…/plans/<slug>.plan.md`). When present, the emitter must have used the **five-step** warm-up.
- **Follow-ups** — per **development-process** *Coding session* / *Feedback collection*: maintain **`## Follow-ups`** on the PR plan; append bullets for out-of-scope ideas with optional `(target: …)` hints.
- **Review cadence** — after implementation, one [Ship cut-point gate](../../docs/coding-session-ship-chain.md#ship-cut-point-gate-approve-commit-before-deploy) modal (approve + commit + Before deploy **`deploy-walk`** inline when §7 has unchecked items), then **`pre-pr-review`**, then **`create-pr`**; no commit before cut-point approval; coordinate **`pr-review`** and rule **20** § *Review before commit* / *Commit and push cadence*.
- **Multi-repo only:** scope guard line per repo.

## Verbatim override

If the user supplies custom prompt text, keep their prose **verbatim** inside Phase 2 after the `---`. Still **prepend** the curated **Project rules** block and the correct **warm-up** step count (four vs five). Merge duplicates without weakening gates.

## Example (illustrative)

When emitting a **real** prompt, substitute **concrete absolute paths** for every `<…>` placeholder (worktree root, hosting repo root, plan file, etc.). Do **not** paste unresolved placeholders into **a coding agent** session.

```text
hosting-repo — feat/01-example

### Project rules (read during warm-up, before the task body)

Use the Read tool on each path below, then acknowledge before starting the task.

- `<absolute-worktree-root>/.cursor/rules/<example>.mdc`

**Warm-up first — do not read the task body below --- until all five steps are done and acknowledged.**

1. Workspace readiness: README, CONTRIBUTING, plan-linked setup, and repo rules only where they prescribe pre-work; stop if a documented check fails.
2. Branch check: expect feat/01-example
3. Process handback: next moves via AskQuestion / mission dispatch; protocol names only.
4. Load every **Project rules** path.
5. Plan + sidecar: `.sedea/operations/…/plans/<slug>.plan.md` and `<slug>.state.yaml`; todo updates via plan-state only.

---

Implement the scoped change described in `@<absolute-targetPlanPath>` §§ 5–7 for this PR.

**Follow-ups discipline.** Append to `## Follow-ups` on that plan when you discover scope-adjacent items.

Stop after implementation; run the **ship chain** ([Ship cut-point gate](../../docs/coding-session-ship-chain.md#ship-cut-point-gate-approve-commit-before-deploy) → Before deploy **`deploy-walk`** when applicable → **`pre-pr-review`**) per **development-process** — **no commit** before cut-point approval.
```


## Implementation handoff result (summary)

Terminal `mission_control_send_agent_result` **must** populate `outputs` per the on-demand ship-chain doc § *Implementation handoff result*, § *Mission Control section 8 sync*, and § *Spawner spawn-detection outputs*. **Step-bound Read (binding):** Before emitting a terminal or re-emit, `Read` [`docs/coding-session-ship-chain.md`](../../docs/coding-session-ship-chain.md) § *Implementation handoff result* in full.

**Minimum on every spawned terminal:** `targetPlanPath`, `shipPhase`, `rowStatus`, `continuationStatus`, `developerApprovedImplementation`; plan-anchored runs also require `repoRulesReconciliationStatus` and `reconciledRepoRulesPaths`. Do not propose dispatch resolution from this skill.

## Completion (spawned)

Required `outputs` per on-demand [`docs/coding-session-ship-chain.md`](../../docs/coding-session-ship-chain.md) § *Implementation handoff result*, § *Mission Control section 8 sync*, and the bubble-up table (include **`pr-review`** inline fields when that flow ran). Re-emit an **updated** terminal result after user-requested follow-up on this lane (same `correlationId`). Do not call MCP **`mission_control_propose_dispatch_resolution`** from this skill.

### MCP result preflight (`mission_control_send_agent_result`)

| Step | Check |
|------|--------|
| R1 | Call **`mission_control_send_agent_result`** with **`status`**, **`summary`**, optional **`outputs`** / **`errors`** |
| R2 | **Forbidden args absent** — no **`correlationId`**, **`dispatchId`**, **`slotId`**, or other host-resolved keys |
| R3 | Populate **`outputs`** from ship-chain doc § *Implementation handoff result* and §8 sync fields |
| R4 | Re-emit updated MCP result after user-requested follow-up on this lane (same spawn session; host resolves **`correlationId`**) |
| R5 | **`mission_control_refocus_parent_lane`** — when **Required** per § *MCP parent refocus* below; **omit** on detached / parentless entry |

### MCP parent refocus (`mission_control_refocus_parent_lane`)

| Signal on this terminal | Refocus? |
|-------------------------|----------|
| Detached / parentless entry (no resolvable spawned parent) | **Omit** — do not call refocus |
| Notify-only turns; mid-ship re-emits while work remains on this lane | **Forbidden** |
| Open **`pre-pr-review`** / ship child; cut-point or post-create gate still open | **Forbidden** |
| True ship / abandon / blocked terminal with resolvable spawned parent (typical **`pr-plan`** §5d child) | **Required** |

Call **`mission_control_refocus_parent_lane`** (optional `{ "reason": "coding-session-complete" }` — no host-resolved identity keys) **immediately before** **`mission_control_send_agent_result`** when **Required** above. See **`../README.md`** § *Parent refocus on terminal*.

**Forbidden:** structured-choice options whose primary purpose is parent-switch — use **`mission_control_refocus_parent_lane`** instead.

**Message order on terminal turns:** optional recap → **`mission_control_present_structured_choice`** (when a gate is open) → **`mission_control_refocus_parent_lane`** (when required) → **`mission_control_send_agent_result`** (**last**).

Stop after the MCP result call. Do not emit another `mission_control_spawn_agent` or run the next protocol step in the same turn (see **`../README.md`** § *Terminal stop (normative)*).

## Completion (inline)

Report the fields below in prose to the invoker on the **same lane**. Do **not** emit `mission_control_spawn_agent`, `mission_control_send_agent_result`, or `mission_control_propose_dispatch_resolution`. Do **not** add a **MCP result** under this section (see **`.sedea/centers/sedea/rules/4_mission.mdc`** § *Inline completion* and **`.sedea/centers/sedea/skills/README.md`** § *Completion (inline)*).

**plan and deliver** normally spawns this skill on a **child lane** — default **spawned implementation lane**, not prompt-only. If run inline, use the same `outputs` semantics as **## Implementation handoff result** and **`## Completion (spawned)`** in prose only (merge **`pr-review`** inline fields when that sub-flow ran).
