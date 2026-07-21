# plan-and-deliver — spawn contracts

This mission uses **three execution shapes** (see **`.sedea/centers/sedea/skills/README.md`** for dual-mode authoring). Parent resume for the **Squad Leader** is in **`../plan.mdc`** § **Spawn, wait, and parent resume** (planning §§3–7) and § **8** (ship oversight). Host spawn/result protocol is in **`.sedea/centers/sedea/rules/4_mission.mdc`**.

## Normative execution mode (plan-and-deliver)

**Do not infer mode from the presence of `## Completion (spawned)` alone** — many skills document both sections for dual-mode authoring. Use this table for **plan and deliver** on the **research-and-development** center.

| Skill | Normative mode on this mission | Invoker | Terminal / result |
|-------|----------------------------------|---------|-------------------|
| **`master-planner`** | **Spawned only** — new child lane; may emit **`coding-session`** spawn via inline **`pr-plan`** §5d on **this** lane (distinct from Squad Leader §§1–7 non-spawn) | Squad Leader §5 (`mission_control_spawn_agent`) | **`mission_control_send_agent_result`** on child lane |
| **`pr-plan`** | **Inline only** — same lane as invoker | **`new-plan`** step 4 (`parentAgentRole: new-plan-agent`) | **`## Completion (inline)`** — no `mission_control_send_agent_result` for **`pr-plan`** |
| **`pr-plan`** → **`coding-session`** | Spawn after §5c **Start coding session** (or **`phase-planner`** Step **5f** when inline **`pr-plan`** skipped §5c) | **`pr-plan`** lane, or **`phase-planner`** after **`prPlanHandoffSkipped`** | Child **`coding-session`** uses **`mission_control_send_agent_result`** |
| **`author-prd`** | **Spawned only** | Squad Leader §3 | Child terminal |
| **`ad-hoc-prd`** | Spawned (**`single-phase`** §3, **`debug-and-fix`** §5c — **not** plan-and-deliver §3) | **`single-phase`** / **`debug-and-fix`** Squad Leader | Child terminal |
| **`delivery-phases`**, **`pr-breakdown`**, **`new-plan`** | **Primary:** inline on **`master-planner`** / **`phase-planner`** lane on **`plan and deliver`** | Parent planning skill | Inline completion merged into parent |
| **`phase-planner`** | Spawned from inline **`new-plan`** (optional) | **`new-plan`** | Child terminal; **owns phase delivery** on its lane until **`phaseShipComplete`** or explicit defer/abandon — Master Plan lane ack-only meanwhile |
| **`phase-planner` + `autoContinue: true`** → inline **`pr-breakdown`** (single-PR K=1) | Inline on **`phase-planner`** lane after Step **5b** route approval | **`phase-planner`** | May **skip **`pr-breakdown`** Step **6** modal** when **`skipPrBreakdownApprovalModal: true`** — drafts § 5 on **phase plan**; same-turn **`approve-list`** act-after-select matches **`master-planner`** **`approve-list`** auto-expand semantics |
| **`phase-planner` + single-PR** | **`pr-breakdown`** writes § 5 **`PR breakdown`** on **this phase plan** (not the ancestor Master Plan) | **`phase-planner`** | See **`phase-planner/SKILL.md`** Step **5b-decompose** and **`pr-breakdown/SKILL.md`** § *Inline invoker lane* — does **not** replace **`master-planner`** Step **7** Master Plan **`route-6`** when no phase-planner child is active |
| **`coding-session`** | Spawned (from **`pr-plan`** §5d or **`phase-planner`** §5f) or detached entry | **`pr-plan`**, **`phase-planner`** (inline subtree), developer, dispatch | Child terminal + inline ship skills |
| **`hosting-repo-rules`** | **Spawned only** — detached parallel fork after **`coding-session`** terminal when spawn contract matches | **`master-planner`** Step **7c**, **`phase-planner`** Step **5e** (fire-and-forget — not **`pendingByParent`**) | Child **`mission_control_send_agent_result`**; parent updates product row **`rulesUpdatesStatus`** |
| **`pr-review`**, **`create-pr`**, **`deploy-walk`**, **`plan-reconcile`** | **Inline only** on active **`coding-session`** or **`hosting-repo-rules`** | **`coding-session`**, **`hosting-repo-rules`** | Prose to invoker ship lane — no separate child terminal |

**Dual-mode planning skills (binding):** On **`plan and deliver`**, **`delivery-phases`**, **`pr-breakdown`**, and **`new-plan`** run **inline** on **`master-planner`** or **`phase-planner`** (table above). Each skill may document **`## Completion (spawned)`** for **protocol-branch** dispatch or another mission that opens a dedicated child lane — that path is **secondary** and **not** the normative shape on **`plan and deliver`** Squad Leader §§3–7. **`pr-plan`** stays **inline-only** under **`new-plan`** on this mission unless a mission `plan.mdc` says otherwise (see each **`SKILL.md`** *Standalone* note).

**Common mistake:** Spawning **`master-planner`** from **`new-plan`** or running **`pr-plan`** on a standalone child lane without **`new-plan-agent`** — wrong unless the mission protocol explicitly says otherwise.

**Common mistake — Squad Leader redirect:** Concluding that because the **Squad Leader** does **not** spawn **`coding-session`** from §§1–7, **no lane** may spawn it. **Correct:** the **`master-planner`** Master Plan child lane (and **`phase-planner`**, Quick Fix Plan agent, etc.) spawns **`coding-session`** via inline **`pr-plan`** §5d on **that planning lane** after §5c **Start coding session**. The Squad Leader only **tracks** §8 host sync after child terminals — it does **not** emit the §5d spawn.

Glossary for colliding step labels: **`.sedea/centers/research-and-development/docs/development-process.md`** § *Agent glossary — step and section labels*.

## Inline execution (same lane)

When a skill runs **inline** on the invoker’s lane (not spawned via **`mission_control_spawn_agent`**):

- Report **`## Completion (inline)`** (or the mission’s inline-only result section) in **prose** to the invoker.
- Do **not** emit **`mission_control_send_agent_result`** under the inline section — MCP spawn/result tooling applies **only** under **`## Completion (spawned)`** (see **`.sedea/centers/sedea/rules/4_mission.mdc`** § *Inline completion* and **`.sedea/centers/sedea/skills/README.md`** § *Completion (inline)*).
- Do **not** emit **`mission_control_spawn_agent`** unless the protocol step explicitly switches to spawned mode.

**plan and deliver** normally spawns planning and ship skills on child lanes; inline sections exist for dual-mode authoring and same-lane ship steps. **`pr-review`**, **`create-pr`**, **`deploy-walk`**, and **`plan-reconcile`** are **inline-only** on **`coding-session`** (no **`## Completion (spawned)`** on those skills). **`pre-pr-review`** is **spawn-only** from **`coding-session`** — **forbidden** inline on the coding-session lane; **auto-spawn** = **`mission_control_spawn_agent`** + wait for child **`mission_control_send_agent_result`**, not self-execute review steps here.

**Inline `deploy-walk` on `coding-session`:** Agents must self-run agent-executable checklist steps (shell, grep/logs, file read/parse) per **`deploy-walk/SKILL.md`** § *Agent capability inventory (binding)* — manual steps require numbered **Testing steps** in § *Step 4 — Step presentation contract* and close with **`USER_CHECKPOINT`** gates (manual step await, deploy status transition, deploy closure approval) per § *Checkpoint turn UX (skill-local)* — not prose-only deploy handoff.

## R&D center edit destination gate (binding)

Applies to **all PRD and planning skills** on this center (`author-prd`, `ad-hoc-prd`, `brainstorm-research`, `master-planner`, `phase-planner`, `delivery-phases`, `pr-breakdown`, `new-plan`, `pr-plan`, and **`quick-fix-plan`**). Happy-path PRD/plan writes under **`.sedea/operations/`** do **not** open this gate.

**Trigger:** any step that would **create, edit, move, or delete** files under **`.sedea/centers/research-and-development/`** (center git content — rules, missions, skills, docs, `center.yaml`).

USER_CHECKPOINT — pick R&D center edit destination before any center write.

| Option id | Label | Action |
|-----------|-------|--------|
| `ship-app-rd` | Ship in `sedea-ai/research-and-development` — Sedea app process / ops | Continue on the **app-focused** center remote; require hosting **Own centers** listing for `research-and-development` → `git@github.com:sedea-ai/research-and-development.git` and **`CENTER_WORKTREE_ROOT`** before writes |
| `delegate-base-rd` | Delegate to base center — `sedea-centers/research-and-development` | **Stop** local center writes; developer continues on **`sedea-centers-development-hosting-repo`** for **general** R&D center operating-model changes |
| `pause` | Pause — stop until I say more | No writes |
| `more-details` | More details for option _ | Elaborate; re-ask |

**How to choose (nature of the change):**

| Destination | When |
|-------------|------|
| **`sedea-ai/research-and-development`** (`ship-app-rd`) | Change reflects how the **Sedea app** is developed, its processes and operations |
| **`sedea-centers/research-and-development`** (`delegate-base-rd`) | Change applies to how the research-and-development center operates **in general** — not app-specific |

**Forbidden:** writing center files without this gate; treating **`sedea-centers/research-and-development`** as Own on **`sedea-ai/app`**; editing the primary hosting clone’s submodule checkout without **`CENTER_WORKTREE_ROOT`**.

Each listed skill **must** point here from its Checkpoint / pre-write guidance. Do not re-author a divergent option table in individual skills.

## Recap, structured choice, act (plan-and-deliver)

Mission Control delivery for skills that mix long plan output with structured user choice. Canonical Sedea rules: **`.sedea/centers/sedea/rules/2_ask-question-instructions.mdc`** § **Context and structured choice**. Hosting-repo runtime: **`.cursor/rules/mission-control-agent-runtime.mdc`**.

| Stage | Purpose | Notes |
|-------|---------|--------|
| **Recap** | Plan link, one-line summary, optional short recap | Prefer one message with structured choice (AskQuestion tool or `mission_control_present_structured_choice`) |
| **Structured choice** | Modal approval / gates | Recap in `displayMarkdown` with MCP call prose in the same message |
| **Next-step modal** | User leaves chat (PR/diff/CI) before next step | Open modal **before** end turn naming resume paths — rule **2** § External-wait / next-step modal; forbid prose “wait for user/developer” |
| **Developer-input gate** | Developer must pick next ship action (PR review resume, deploy step attestation) | **`mission_control_present_structured_choice`** at skill USER_CHECKPOINT — **not** external-wait; see **`coding-session/SKILL.md`** § *Developer input vs external-wait (Checkpoint)* |
| **Act** | Spawn, terminal result, implementation | After the user selects in the modal |

**Normative:** Every skill in this mission **must** close **every** assistant turn with the **AskQuestion tool** or **`mission_control_present_structured_choice`** per **`.sedea/centers/sedea/rules/2_ask-question-instructions.mdc`** § **Turn completion invariant** and § **`mission_control_present_structured_choice` MCP tool contract (binding)** — **except** under Checkpoint trust when a skill documents **happy-path auto-advance** without ending the turn, or when mid-turn tool work continues on the same assistant turn. **Forbidden:** prose-only exit, recap-only endings, prose menus, or “wait for the developer” without a modal at a **developer-input** USER_CHECKPOINT. Spawned skills that finish via **`mission_control_send_agent_result`** call **`mission_control_present_structured_choice`** first when a gate is open, then call **`mission_control_send_agent_result`** before the turn ends. Do **not** use “Turn A/B” or similar implementation labels in developer-facing chat.

**Checkpoint trust (`trustLevel: checkpoint`):** Auto-advance scripted happy-path steps without a turn-end modal; emit structured choice only at **USER_CHECKPOINT** markers, **implicit external-wait** surfaces, or **exception** paths. **Developer-input** gates remain USER_CHECKPOINT when Checkpoint auto-advance criteria fail — **not** optional and **not** external-wait when the developer must pick to continue. Happy-path auto-advance covers review feedback, create-PR follow-ups, rebase push, pre-merge confirm, and **`pr-review`** disposition (CI/Must) when clean; **post-create-pr** modal remains stop **1** after inline **`create-pr`**. See **`create-pr/SKILL.md`** § *Developer input vs external-wait (Checkpoint)* for Pre-gh vs auto-advance **`authorize-create-pr`** and PR-open handback.

**Authoring new or updated skills (binding):**

- When a step says the developer will review work **outside** chat (GitHub PR, diff, staging), end the turn with structured choice naming resume paths — not idle *wait for the user* / *return when done* prose without structured resume options.
- Gate **`options`** must match the skill’s next branches (approve, revise, defer, commit when applicable, **More details for option _**).
- Reference **`coding-session/SKILL.md`** § *Post-create-pr handoff gate*, **`create-pr/SKILL.md`** § *Developer input vs external-wait (Checkpoint)* (and [Pre-gh authorization gate](../create-pr/SKILL.md#pre-gh-authorization-gate-binding) on exception paths), and **`pr-review/SKILL.md`** Step **4** § *Build disposition options* for ship-path examples (contextual options from triage counts — omit inert Must/Should rows).

### Planning open-item modal contract

Planning composition skills that surface review gaps before approval use the same modal shape as **`author-prd/SKILL.md`** Step **10**. This applies when a planning lane presents open items in generated PRDs, Master Plans, phase plans, PR breakdowns, plan stubs, or PR plans before the developer approves, revises, defers, or starts implementation.

**Detect open items before building the modal.** Open items include unresolved `TBD` markers, missing required plan sections, contradictions, incomplete acceptance or handoff details, blocked readiness states, and any agent-discovered decision that would otherwise be hidden in prose.

**When open items exist — one modal, multiple questions:**

- **`displayMarkdown`** renders a numbered list of the open items. Each item states the document location, the gap, why the decision matters, and the agent-proposed resolution options.
- **`askQuestion.questions`** contains **one entry per open item**. Each question has its own `id`, `prompt`, and item-scoped `options` (for example accept a proposed resolution, choose an alternate resolution, mark not applicable, defer as follow-up, gather more evidence, or request more details for that item).
- **The final question in the array** is always the terminal approval / routing question for the gate, with options such as approve, revise, defer, start implementation, or **More details for option _** as appropriate for the skill.
- **Forbidden:** combining all open-item decisions into one `questions` entry; mixing item-resolution options with terminal approve / revise options in the same question; emitting a resolve-only modal that omits the terminal approval / routing question.
- **Many open items:** batch across turns when one modal would be impractical. Each batch still includes the terminal approval / routing question last, so the developer can approve with remaining gaps explicitly documented when the skill allows it.

**When no open items remain** (or only visible follow-up notes the developer may accept as-is), use a single terminal approval / routing question with the gate's normal options and **More details for option _**.

**Act after selection.** Apply selected item resolutions only after the developer picks them in the modal, rewrite or re-check the affected artifact, then return to the same modal shape until the gate reaches its terminal branch. Do **not** treat writing the draft, rendering the recap, or silence as approval.

**Reference implementations (planning):**

| Skill | Recap + structured choice (same turn) | Act |
|-------|---------------------------------------|-----|
| **`pr-breakdown`**, **`delivery-phases`** | §5d link + one-line summary + §6 modal | §6 act-after-select (depth-first); **`pr-breakdown`** **`approve-list`** may auto-expand PR **1** inline under **`master-planner`** |
| **`pr-plan`** | §5c recap + modal (skipped when `skipPrPlanHandoffModal` auto-chain) | §5d spawn |
| **`author-prd`**, **`ad-hoc-prd`** | Step 10 / 5 recap + open-item elaboration; **one `questions` entry per open item**, then Approve/Revise as **last** question | Step 10a / 5a apply resolution for answered item; step 11 / 6 terminal on Approve |
| **`master-planner`** | §7 draft + §7 approval modal same turn; §7a status + §7b next moves | §7c |
| **`phase-planner`** | §4f echo / §5c route modal; Step **5f** after **`prPlanHandoffSkipped`** | §5b inline decompose / Step **5f** **`coding-session`** spawn |
| **`new-plan`** | stub + parent link + populator gate | populator spawn |

**Ship and ops skills:** **`coding-session`** (Checkpoint § *Checkpoint turn UX* — three-stop model (post-create-pr, **`pr-review`** disposition, After deploy manual); auto-advance happy path including review feedback (**`fix-now-session`** **same turn** — no modal; append **`proposedFollowUps`** to plan), create-PR follow-ups (**`approve-followups-create-pr`** **same turn**), rebase `--force-with-lease`, pre-merge **`delegate-merge-confirm`**; **`USER_CHECKPOINT`** at worktree-open when layer 2 required, **post-create-pr** after inline **`create-pr`**, implementation continuation (exception), repo rules reconciliation (exception), ship cut-point (exception), Non-Checkpoint/exception review-feedback and create-PR handoff only, and After deploy manual steps; center **`worktree-setup.sh`** bootstrap hints; **pre-PR ship gate** — no push/create-PR modals until **`pre-pr-review`** **`go`** except executive override; **auto** pre-PR spawn after cut-point + Before deploy; **auto** inline **create-pr** on clean **go**; inline **`pr-review`** (Checkpoint auto-disposition for CI/Must); **agent-delegated approve + merge** when authorized; **auto** post-merge cleanup when merged; inline **deploy-walk**; inline **plan-reconcile**), **`worktree-bootstrap`** (**deprecated** — exception-only inline retry; normative bootstrap is center setup on **`coding-session`**), **`pre-pr-review`** (Checkpoint § *Checkpoint turn UX* — spawn-only reviewer lane; Steps **1–8** auto-advance including Step **8** terminal + parent refocus; **no** developer-input **`USER_CHECKPOINT`** on this lane; findings hand back to **`coding-session`** [Review feedback approval gate](../coding-session/SKILL.md#review-feedback-approval-gate) — Checkpoint auto-implements). **`pr-review`** (Checkpoint § *Checkpoint turn UX* — auto-advance Steps **0–3a**, **1b**, and **5** on happy path; **`USER_CHECKPOINT`** at [Disposition gate](../pr-review/SKILL.md#step-4--report-and-disposition-gate) and [Post-fix commit/push gate](../pr-review/SKILL.md#post-fix-commitpush-gate-binding); cycle resume via **`coding-session`** [Post-create-pr handoff gate](../coding-session/SKILL.md#post-create-pr-handoff-gate) — **not** rule **2** external-wait). Step **4** disposition gate uses **contextual** `options` from triage counts (see § *Build disposition options*). Prefer **AskQuestion** or **`mission_control_present_structured_choice`** when recap and modal belong in one message. Gate detail: **`coding-session/SKILL.md`** § *Checkpoint turn UX*, § *Repo rules reconciliation gate*, § *Pre-PR ship gate (push/PR)*, § *Post-create-pr handoff gate*, and § *Implementation continuation gate*.

**Lane pick (no resolved target):** emit *Where we are now in the plan tree* snapshot, then structured choice per **30_planning-target-resolution** § *Sedea input channel* (MCP or split — not prose menus).

**Spawned child lanes:** Cloud/spawned agents lack the native AskQuestion tool. **Every turn** **must** call **`mission_control_present_structured_choice`** (MCP tool call, recap in **`displayMarkdown`**, options in **`askQuestion`**) or split per rule **2** priority **3**. Wire format: rule **2** § **`mission_control_present_structured_choice` MCP tool contract (binding)**. Gate templates: **`coding-session/SKILL.md`** § *Spawned lane — MCP structured choice (binding)*.

## Planning spawn (Squad Leader §3, §5, decomposition tree)

Squad Leader steps **§3** and **§5** spawn child lanes for **`author-prd`** and **`master-planner`**. **`master-planner`** runs **`delivery-phases`**, **`pr-breakdown`**, and **`new-plan`** **inline**. **`phase-planner`** runs **`delivery-phases`** and **`pr-breakdown`** **inline** on its child lane. Inline **`new-plan`** runs **`pr-plan`** inline and may still spawn **`phase-planner`**. **Depth-first expansion:** parent lists show all rows; **`new-plan`** runs only for ship-eligible indices (phases sequential; PRs per **`### Sequencing`** stages) — see **development-process.md** § *Depth-first plan-tree traversal* and rule **30** § *Depth-first expansion eligibility*. Skills that support both modes still document **`## Completion (spawned)`** and **`## Completion (inline)`** — use **§ Normative execution mode** above for which mode applies on this mission.

| Skill | Typical invoker | Squad Leader ledger |
|-------|-----------------|---------------------|
| `author-prd` | Squad Leader §3 | Child lane owns PRD recap + approval at step **10** USER_CHECKPOINT ( **`## Checkpoint turn UX (skill-local)`** ); **one `questions` entry per open item, Approve/Revise last** — never resolve-only without Approve/Revise; leader §4 only after `terminal` + `developerApprovedPrd: true`; no nested child lanes |
| `master-planner` | Squad Leader §5 | Seed ledger; §6 ack when `continuationOwner: master-plan-agent` |
| `phase-planner` | inline **`new-plan`** spawn | Runs **`delivery-phases`** / **`pr-breakdown`** inline on **its child lane**; owns phase subtree through ship-complete; **`master-planner`** ack-only while **`continuationOwner: phase-planner-agent`** is active |
| `delivery-phases` | **`master-planner`** or **`phase-planner` inline** | Runs **`new-plan`** inline on invoker lane |
| `pr-breakdown` | **`master-planner`** or **`phase-planner` inline** | Same as delivery-phases |
| `new-plan` | **`delivery-phases`** / **`pr-breakdown` inline** | Indexed stub + parent link; **`pr-plan`** inline; may spawn **`phase-planner`** |
| `pr-plan` | **inline `new-plan`** on planner or phase-planner lane | Layer 1 handoff; §5d spawn on invoker lane, or **`phase-planner`** Step **5f** when §5c skipped via **`skipPrPlanHandoffModal`** |

Field-level `outputs` and `continuationStatus` rules: each skill’s **`## Completion (spawned)`**.

### Implementation consent before worktrees (two layers)

| Layer | Skill | Primary output |
|-------|-------|----------------|
| 1 — Planning handoff | `pr-plan` | `readyForImplementation`, `implementationHandoffStatus` — does **not** advance §8 `phase` past `not-started` |
| 2 — Worktree open | `coding-session` | `developerApprovedImplementation` after **`plan-ws-completeness.mjs`** passes or override in the worktree-open gate |

**`pr-plan` → `coding-session`:** sequential skills on **different lanes**. **`pr-plan`** drafts §§ 1–4 and may sketch §§ 5–8; after **AskQuestion** **Start coding session**, **`pr-plan`** emits **`mission_control_spawn_agent`** for **`coding-session`** (§5d). When inline under **`phase-planner`** with **`skipPrPlanHandoffModal`**, §5c is skipped on the **`pr-plan`** turn only — **`phase-planner`** Step **5f** offers the same §5d-equivalent spawn (or §5c re-entry) on the **phase-planner** lane; **forbidden** to redirect to detached entry or **`master-planner`** §7b as the default. The **child lane** then owns worktrees, workspace attach, **implementation in the worktree** (default), §§ 5–8 fill, and ship execution — not prompt-only handoff unless **`promptOnly: true`** or **Defer implementation**. Detached **`coding-session`** entry may use prompt-only or implement on that detached lane after layer 2. See **`pr-plan/SKILL.md`** § *Handoff to coding-session*, **`phase-planner/SKILL.md`** Step **5f**, and **`coding-session/SKILL.md`** § *Execution mode after worktree attach*.

### Worktree removal ownership (binding)

**Do not remove worktrees you do not own.** Applies to every ship skill on **`coding-session`**, **`hosting-repo-rules`**, and **`plan-reconcile`** §5.

| Source | Contract |
|--------|----------|
| [`.sedea/centers/sedea/rules/0_hosting-repo.mdc`](.sedea/centers/sedea/rules/0_hosting-repo.mdc) § *Worktree ownership* | Four preconditions before detach/remove |
| [`.sedea/centers/research-and-development/rules/20_efficient-pr-shipping.mdc`](.sedea/centers/research-and-development/rules/20_efficient-pr-shipping.mdc) § *Worktree removal ownership (binding)* | R&D ship lanes |
| **`coding-session/SKILL.md`** § *Post-merge workspace cleanup* | Primary post-merge owner |
| **`plan-reconcile/SKILL.md`** §5 | Idempotent fallback only |

**Forbidden:** **`git worktree remove`**, **`git worktree prune`**, **`sedea_remove_worktree_folder`** on paths **this pass** did not create and mount; repo-wide cleanup from **`git worktree list`**; **`git worktree remove`** on **`HOSTING_ROOT`**. **`git worktree list` is read-only** when ownership is unclear — stop and use structured choice.

## Ship spawn (detached / coding-session chain)

These skills run on **detached** or **nested** lanes (often **not** the Squad Leader). They use **domain-specific section titles** for long procedures; each dual-mode file has **`## Completion (spawned)`** (MCP result) and **`## Completion (inline)`** (prose only, no MCP result). Detailed `outputs` lists live in the section named in the **Outputs section** column.

| Skill | Typical spawner | Outputs section | §8 ship phase hints |
|-------|-----------------|-----------------|---------------------|
| `coding-session` | Developer / mission dispatch; **`pr-plan`** §5d or **`phase-planner`** §5f spawn (default **spawned-lane** implement) | `## Implementation handoff result` (+ **`## Completion (inline)`** if same-lane) | Layer 2: `developerApprovedImplementation` after worktree-open gate (auto-waived on pr-plan/phase-planner handoff when eligible); Checkpoint **`USER_CHECKPOINT`** ship gates per **`coding-session/SKILL.md`** § *Checkpoint turn UX*; `shipPhase: implementing` when spawned child codes on lane (not prompt-only stop); **`worktree`** / bootstrap via this lane's terminal — not a separate child |
| `hosting-repo-rules` | **`master-planner`** / **`phase-planner`** fire-and-forget after **`coding-session`** terminal (`repoRulesReconciliationStatus: pending` or uncovered §5 `.mdc` bullets) | `## Completion (spawned)` | `shipPhase: implementing` → `done`; `prShipComplete` on rules PR merge; parent product row **`rulesUpdatesStatus`** — not a separate **`shipRows`** entry |
| `worktree-bootstrap` | **Deprecated** — do not spawn by default; normative bootstrap is center **`worktree-setup.sh`** on **`coding-session`**. Exception-only **inline** retry when setup failed (see **`coding-session/SKILL.md`** § *Worktree bootstrap (inline mandatory)*) | `## Spawned result contract` (legacy in-flight dispatches only) | `worktree`; `bootstrapStatus` |
| `pre-pr-review` | `coding-session`, **`hosting-repo-rules`** | Step 8 — Report and result | `pre-pr-review`; `recommendation: go` |

**Not §8 host-sync children:** inline **`pr-review`**, **`create-pr`**, **`deploy-walk`**, **`plan-reconcile`**, and deprecated inline **`worktree-bootstrap`** retry — milestones **must** ship §8 fields on the next **`coding-session`** terminal re-emit (see § *§8 terminal contract* below).

The Squad Leader **§8** ship ledger updates via Mission Control **host sync** when ship child lanes emit terminals with required **`outputs`**. See **`../plan.mdc`** §8 *Mission Control host sync* and **development-process.md** § *Leader-lane §8 host sync*.

### Worktree-bootstrap skill drain gate

**`worktree-bootstrap`** is **deprecated** — normative bootstrap is center **`.sedea/centers/sedea/scripts/worktree-setup.sh`** on **`coding-session`**. Skill files remain **read-only** until all drain criteria pass; **do not delete** the skill directory in the deprecation PR.

| # | Gate (all required before skill file deletion) |
|---|-----------------------------------------------|
| **D1** | Phase 2 consumer wiring merged — **`coding-session`** and **`promote-center-submodule-pin`** call center setup + MCP attach/detach on the default path |
| **D2** | This deprecation PR merged — spawn table redirect, **`coding-session`** spawn-by-default removal, deprecate banner on **`worktree-bootstrap/SKILL.md`** |
| **D3** | Phase 4 docs sweep merged — **`development-process.md`**, rule **20**, and related prose no longer treat **`worktree-bootstrap`** as normative |
| **D4** | **Zero** open Mission Control dispatches with active **`worktree-bootstrap`** child lanes (in-flight sessions drained) |
| **D5** | **`verify-lane-warmup-parity.mjs --bootstrap full`** still passes with **`worktree-bootstrap`** role retained until **D4**; remove role from parity manifests only after **D1–D4** |

**Until drain:** Spawners **must not** emit **`mission_control_spawn_agent`** for **`worktree-bootstrap`** except documented break-glass; **`coding-session`** uses center setup hints and **inline** retry only. **`worktree-bootstrap`** is **not** a §8 host-sync child — bootstrap / `worktree` phase updates report via **`coding-session`** terminal re-emit only.

### §8 terminal contract (ship skills)

When a ship skill finishes a milestone on a **detached** lane, the terminal **`mission_control_send_agent_result`** **must** include **`targetPlanPath`**, **`shipPhase`**, and **`rowStatus`** (host may infer phase when documented). **Do not** nudge manual recap on the leader dispatch. Field hints: § *Mission Control section 8 sync* in each ship `SKILL.md`.

## Inline-only (no spawn)

| Skill | Invoker | Result section | §8 ship ledger |
|-------|---------|------------------|----------------|
| `pr-review` | Active **`coding-session`** or **`hosting-repo-rules`** agent on its lane | `## Inline result for coding-session` (coding) or invoker prose (rules) | Invoker re-emit with `shipPhase: pr-review` — host sync when §8 fields present |
| `create-pr` | Active **`coding-session`** or **`hosting-repo-rules`** agent on its lane | `## Completion (inline)` | `pr-open` via invoker terminal re-emit — no separate child terminal |
| `deploy-walk` | Active **`coding-session`** agent on its lane (Before deploy after commit, After deploy after merge, or deploy phrases) | `## Completion (inline)` | `deploy-walk` via **`coding-session`** terminal re-emit — no separate child terminal |
| `plan-reconcile` | Active **`coding-session`** agent on its lane (after deploy, stale worktree pick, or *plan reconcile* phrase) | `## Completion (inline)` | `reconcile` / `done` via **`coding-session`** terminal re-emit — no separate child terminal |

**`pr-review`**, **`create-pr`**, **`deploy-walk`**, and **`plan-reconcile`** return through the **active ship invoker** (**`coding-session`** or **`hosting-repo-rules`**). §8 updates on the leader dispatch via invoker terminal re-emit and host sync when documented (**`../plan.mdc`** §8).

### Parallel **`hosting-repo-rules`** fork (fire-and-forget)

When **`coding-session`** terminal outputs satisfy the spawn contract in **`hosting-repo-rules/SKILL.md`** § *Spawn trigger*, parent **`master-planner`** / **`phase-planner`**:

| Behavior | Rule |
|----------|------|
| Spawn | **`mission_control_spawn_agent`** for **`hosting-repo-rules`** with handoff fields (`sourceCodingSessionCorrelationId`, `pendingRepoRulesPaths`, `repoRulesReconciliationStatus`) |
| Wait | **Do not** wait on rules PR merge before next PR row / phase expand |
| Ledger | Set product row **`rulesUpdatesStatus`** (`spawned` → `complete` \| `failed`); optional `hostingRepoRulesCorrelationId`, `rulesPrUrl` |
| Forbidden | Separate **`shipRows`** sub-row; adding rules child to **`pendingByParent`** |
| Scope escape | Center/mission gaps → **Alignment Drift Brief** (rule **5**) — not **`hosting-repo-rules`** |
| Mutual exclusion | Inline **`coding-session`** reconcile remains authoritative when satisfiable on product lane; parallel lane handles **`pending`** / deferred §5 after product terminal |

**Inline `pr-review` ship-chain note (binding):** After fix push when Steps **1–4** ran in-session, **`pr-review`** Step **5 (GitHub reconciliation)** is **not optional** — same assistant turn as push per rule **20** § *Commit and push cadence* step 3 and **`pr-review/SKILL.md`** § *Step 5 turn invariant*. Set **`outputs.githubReconciliationStatus: complete`** before **`mergeDelegationReady: true`**. Distinguish **`reconcile-github-only`** (Step 5 only) from **`rerun-pr-review`** (full triage) at **`coding-session`** post-create-pr and pre-merge gates.

## Upstream ship-complete notification (spawn chain)

Depth-first expansion ( **`development-process.md`** § *Depth-first plan-tree traversal*) requires parents to know when a child PR or phase is **ship-complete** before offering **`expand-eligible`** / **`expand-next-eligible`**. Two channels apply:

| Channel | When | Parent action |
|---------|------|---------------|
| **Spawn `mission_control_send_agent_result`** | **`coding-session`** child terminal after inline **`plan-reconcile`** with merge + main pull + archive | Parent merges **`prShipComplete`**; unlock next PR per **`### Sequencing`** |
| **Host sync on leader** | Detached **`coding-session`** terminal with §8 **`outputs`** | Squad Leader §8 row updates automatically — no manual recap |

### Required terminal fields — **`coding-session`** (reconcile complete)

When **`outputs.shipPhase`** is **`done`** and **`outputs.rowStatus`** is **`closed`** after inline **`plan-reconcile`**, also set:

| Field | Value |
|-------|--------|
| **`prShipComplete`** | `true` |
| **`parentPlanPath`**, **`parentPlanSlug`**, **`parentIndex`** | From spawn **`inputs`** when present ( **`pr-plan`** §5d ) |
| **`mainPullStatus`** | From **`plan-reconcile`** inline completion (`success` \| `skipped` \| `failed`) |
| **`archivedSlugs`** | Target slug when archived |

### Parent merge rules (normative)

Each parent **must** handle **`Mission Control: agent-result-response delivered.`** for its spawned children:

| Parent | Child | On **`prShipComplete`** | On **`phaseShipComplete`** | On **`parentPlanningFollowUpNotification: "sent"`** |
|--------|-------|-------------------------|----------------------------|-----------------------------------------------------|
| **`pr-plan`** | **`coding-session`** | Merge child ship fields; **re-emit updated** `mission_control_send_agent_result` (standalone) or **`## Completion (inline)`** (under **`new-plan`**) | — | Bubble **`parentPlanningFollowUps`**; **re-emit updated** |
| **`new-plan`** (inline) | **`coding-session`** via inline **`pr-plan`** | Merge §5b; propagate **`prShipComplete`** + index to **`pr-breakdown`** / **`phase-planner`** invoker | — | Propagate **`parentPlanningFollowUps`** in **`## Completion (inline)`** |
| **`pr-breakdown`** | inline **`new-plan`** / **`pr-plan`** chain | Mark **`childRows[N].status: ship-complete`**; compute **`expandEligibleIndices`**; **re-emit updated** terminal or offer **`expand-eligible`** on next turn | — | Append to parent plan **`## Follow-ups`**; track **`pendingParentFollowUps[]`** — no expand |
| **`phase-planner`** | **`coding-session`** (nested) or inline **`pr-breakdown`** rows | Track per-PR ship on phase subtree | When **all** PRs under phase are ship-complete → **`phaseShipComplete: true`** → notify **`new-plan`** / **`master-planner`** parent | Append to phase/master parent **`## Follow-ups`**; no expand |
| **`delivery-phases`** | **`phase-planner`** | — | Mark phase row **`ship-complete`**; offer **`expand-next-eligible`** for next phase index | Echo bubbled follow-ups to master plan when present |
| **`master-planner`** | **`pr-breakdown`** / **`delivery-phases`** inline + nested child results | Merge ledger; add **`expand-eligible`** / **`expand-next-eligible`** to Step **7b** when indices unlock | Same for next phase | Append to master plan **`## Follow-ups`**; ledger **`pendingParentFollowUps[]`** |

**Re-emit rule:** After merging a child ship-complete result, the parent re-sends `mission_control_send_agent_result` with updated `outputs` (same spawn `correlationId` resolved by the host) before stopping — so *its* parent receives fresh `outputs`. Silence on the child lane is **not** ship-complete.

## Upstream parent follow-up notification (spawn chain)

Depth-first delivery plans phases and PRs as work starts. During PR development, **`coding-session`** may discover scope-adjacent items that belong in **future** phase or PR planning — not in the current PR scope. Those items live on the PR plan **`## Follow-ups`** during the session; **`plan-reconcile`** drains them at archive. **Before ship-complete**, parents (**`master-planner`**, **`phase-planner`**, and intermediate **`pr-plan`** / **`new-plan`** bubble chain) need a **notification** so they can schedule future rows without waiting for archive.

| Channel | When | Parent action |
|---------|------|---------------|
| **Spawn `mission_control_send_agent_result` re-emit** | **`coding-session`** terminal when **`parentPlanningFollowUpNotification: "sent"`** | Parent appends to **parent plan** **`## Follow-ups`**; tracks **`pendingParentFollowUps[]`** on ledger — **does not** expand next PR/phase or run decomposition |
| **Host sync on leader** | Unchanged — §8 ship ledger only | Squad Leader §8 — not parent follow-up routing |

**Role boundary (binding):** **`coding-session`** **emits** structured follow-up items; it **must not** run **`delivery-phases`**, **`pr-breakdown`**, **`new-plan` expand**, edit master/phase **`### PR list`**, or perform planner / phase-planner / Squad Leader duties. Parents **schedule** future work on later turns — follow-ups inform planning; **`expand-eligible`** / **`expand-next-eligible`** still require **`prShipComplete`** / **`phaseShipComplete`** per § *Upstream ship-complete notification* above.

### Required terminal fields — **`coding-session`** (parent follow-up notify)

When **`outputs.parentPlanningFollowUpNotification`** is **`"sent"`**, also set:

| Field | Value |
|-------|--------|
| **`parentPlanningFollowUps`** | Non-empty array of `{ "text", "sourcePlanPath", "suggestedTarget?", "discoveredAt" }` — items for **parent** scheduling |
| **`parentPlanningFollowUpNotification`** | `"sent"` (first emit) or echo prior `"sent"` on re-emit until parent acknowledges upstream |
| **`parentPlanPath`**, **`parentPlanSlug`**, **`parentIndex`** | From spawn **`inputs`** when present — **required** when notification is **`"sent"`** |

When no parent-scheduling follow-ups this session, set **`parentPlanningFollowUpNotification: "none"`** and omit **`parentPlanningFollowUps`** or use `[]`.

**Trigger gates (coding-session):** emit after developer approves PR-plan **`## Follow-ups`** append when the bullet has **`(target: …)`** outside current PR scope **or** the developer explicitly marks *schedule on parent*; re-emit on ship milestones (`pr-open`, `pr-review`, terminal re-emit) when **`parentPlanningFollowUps`** is non-empty and notification not yet **`"sent"`**. PR-only follow-ups with no parent target may stay on the PR plan until **`plan-reconcile`** without upstream notification.

### Parent merge rules (normative)

Each parent **must** handle **`agent-result-response delivered`** with **`parentPlanningFollowUpNotification: "sent"`**:

| Parent | Child | Action |
|--------|-------|--------|
| **`pr-plan`** | **`coding-session`** | Merge **`parentPlanningFollowUps`**; bubble in **`outputs`**; **re-emit updated** terminal (standalone) or **`## Completion (inline)`** (under **`new-plan`**) |
| **`new-plan`** (inline) | via inline **`pr-plan`** | Propagate follow-up fields to invoker **`## Completion (inline)`** or re-emit |
| **`pr-breakdown`** / **`phase-planner`** | inline chain / nested **`coding-session`** | Append items to **parent plan** **`## Follow-ups`** (canonical sink); update **`pendingParentFollowUps[]`**; **do not** auto-expand next index |
| **`master-planner`** | bubbled from **`pr-breakdown`** / **`phase-planner`** | Same append to master or phase parent plan; keep **`continuationStatus: active`**; Step **7b** expand options unchanged until ship-complete |

**Re-emit rule:** Same as ship-complete — bubble **`parentPlanningFollowUps`** upward; parent **re-emits updated** terminal before stopping when standalone spawned.

## Required terminal notification (all spawned children)

Every **spawned** child ends with **one parent notification** on its lane via MCP **`mission_control_send_agent_result`**:

| Field | Rule |
|-------|------|
| **`status`**, **`summary`** | Required |
| **`outputs`**, **`errors`** | Optional per skill **`## Completion (spawned)`** |
| **`correlationId`** | **Forbidden** in MCP args — host resolves from child lane spawn context |

Re-emit an **updated** MCP result after user-requested follow-up on that lane (same spawn session).

Populate **`outputs`** from the skill's **`## Completion (spawned)`** and any referenced domain section above.

**MCP result protocol:** see rule **4** § *MCP result protocol* — tool descriptor on workspace server; forbidden identity keys in § *Host-resolved identity* above.

## Definitive `bootstrapRules` (R&D layer — plan and deliver)

When Mission Control dispatches **`centerSlug === research-and-development`**, the host merges this path into **`effectiveWarmUp`** after the Sedea bootstrap layer (PRD §5.4; host resolver ships in phase 6 PR 3):

| Path | Purpose |
|------|---------|
| `.sedea/centers/research-and-development/rules/bootstrap.mdc` | Sole R&D `alwaysApply: true` bootstrap (≤10 KB) — mirrors **`.sedea/centers/sedea/rules/bootstrap.mdc`** pattern |

Spawned skill **`SKILL.md`** § *Warm-up manifest* tables document this row under **`bootstrapRules`**. **`laneRules`** and **`skillWarmUp`** tables in the same section are unchanged by bootstrap authoring alone — numbered R&D rules stay **`alwaysApply: true`** until the flip PR lands.

## Definitive `laneRules` (plan and deliver)

Normative minimum **`laneRules`** paths per lane role — merged into **`effectiveWarmUp`** after Sedea and R&D **`bootstrapRules`** per [`.sedea/centers/sedea/docs/lane-manifest-contract.md`](.sedea/centers/sedea/docs/lane-manifest-contract.md). Host-owned storage; invokers supply on **`mission_control_spawn_agent`** when skill frontmatter alone does not carry role minimums (see **`.sedea/centers/sedea/rules/4_mission.mdc`** § *Lane warm-up manifest*).

| Lane role | Definitive `laneRules` (in addition to bootstrap) |
|-----------|---------------------------------------------------|
| **Squad Leader** | `.sedea/centers/sedea/rules/2_ask-question-instructions.mdc`, `.sedea/centers/sedea/rules/4_mission.mdc`, `.sedea/centers/research-and-development/missions/plan-and-deliver/plan.mdc`, `.sedea/centers/research-and-development/docs/development-process.md` |
| **`author-prd` child** | `.sedea/centers/sedea/rules/2_ask-question-instructions.mdc`, `.sedea/centers/research-and-development/missions/plan-and-deliver/skills/author-prd/SKILL.md`, `.sedea/centers/research-and-development/missions/plan-and-deliver/plan.mdc` (§§1–3) |
| **`brainstorm-research` child** | `.sedea/centers/sedea/rules/2_ask-question-instructions.mdc`, `.sedea/centers/research-and-development/missions/plan-and-deliver/skills/brainstorm-research/SKILL.md`, `.sedea/centers/research-and-development/rules/31_dispatch-scope.mdc`, `.sedea/centers/research-and-development/missions/plan-and-deliver/skills/README.md` |
| **`ad-hoc-prd` child** | `.sedea/centers/sedea/rules/2_ask-question-instructions.mdc`, `.sedea/centers/research-and-development/missions/plan-and-deliver/skills/ad-hoc-prd/SKILL.md`, `.sedea/centers/research-and-development/rules/31_dispatch-scope.mdc`, `.sedea/centers/research-and-development/missions/plan-and-deliver/skills/README.md` |
| **`master-planner` child** | `.sedea/centers/sedea/rules/2_ask-question-instructions.mdc`, `.sedea/centers/research-and-development/rules/30_planning-target-resolution.mdc`, `.sedea/centers/research-and-development/missions/plan-and-deliver/skills/master-planner/SKILL.md`, `.sedea/centers/research-and-development/missions/plan-and-deliver/skills/README.md` |
| **`quick-fix-plan` child** | `.sedea/centers/sedea/rules/2_ask-question-instructions.mdc`, `.sedea/centers/research-and-development/rules/30_planning-target-resolution.mdc`, `.sedea/centers/research-and-development/missions/quick-fix/skills/quick-fix-plan/SKILL.md`, `.sedea/centers/research-and-development/missions/plan-and-deliver/skills/README.md` |
| **`coding-session` child** | `.sedea/centers/sedea/rules/2_ask-question-instructions.mdc`, `.sedea/centers/sedea/rules/6_git-commit-push-gate.mdc`, `.sedea/centers/research-and-development/rules/20_efficient-pr-shipping.mdc`, `.sedea/centers/research-and-development/missions/plan-and-deliver/skills/coding-session/SKILL.md` |
| **`phase-planner` child** | `.sedea/centers/sedea/rules/2_ask-question-instructions.mdc`, `.sedea/centers/research-and-development/rules/30_planning-target-resolution.mdc`, `.sedea/centers/research-and-development/missions/plan-and-deliver/skills/phase-planner/SKILL.md`, `.sedea/centers/research-and-development/missions/plan-and-deliver/skills/README.md` |
| **`pre-pr-review` child** | `.sedea/centers/sedea/rules/2_ask-question-instructions.mdc`, `.sedea/centers/research-and-development/rules/20_efficient-pr-shipping.mdc`, `.sedea/centers/research-and-development/missions/plan-and-deliver/skills/pre-pr-review/SKILL.md`, `.sedea/centers/research-and-development/missions/plan-and-deliver/skills/README.md` |
| **`worktree-bootstrap` child** (deprecated — drain gate **D4**) | `.sedea/centers/sedea/rules/2_ask-question-instructions.mdc`, `.sedea/centers/research-and-development/rules/20_efficient-pr-shipping.mdc`, `.sedea/centers/research-and-development/missions/plan-and-deliver/skills/worktree-bootstrap/SKILL.md`, `.sedea/centers/research-and-development/missions/plan-and-deliver/skills/README.md` |

**Squad Leader:** Mission protocol or host config supplies the leader row — not only child spawn requests (see **`plan.mdc`** § *Squad Leader laneRules*). **Spawned children:** Include **`laneRules`** on the run-request when they differ from the skill frontmatter default, or rely on skill frontmatter when it matches this table exactly. **`ad-hoc-prd` spawn `warmUpRules` (binding):** merge skill frontmatter **`warmUpRules`** but **replace** any `plan-and-deliver/plan.mdc` entry with the **invoking mission `plan.mdc`** — **`single-phase/plan.mdc`** (§§1–3) or **`debug-and-fix/plan.mdc`** (post-fix step **5c**) — so the child loads the correct protocol, not full plan-and-deliver. **`ad-hoc-prd` → `master-planner` handoff (binding):** this skill does **not** spawn **`master-planner`**; **`single-phase`** Squad Leader auto-chains §4 seed → §5 **`master-planner`** after terminal PRD approval — see **`ad-hoc-prd/SKILL.md`** § *Downstream `master-planner` (invoker-owned)*. **`quick-fix-plan` spawn `warmUpRules` (binding):** use **`quick-fix/plan.mdc`**, not `plan-and-deliver/plan.mdc`.

**Parity (§5.3 gate):** **`effectiveWarmUp`** must cover at minimum today's `(alwaysApply scan ∪ skill warmUpRules)` per role — enforced by **`verify-lane-warmup-parity.mjs`**:

```bash
node .sedea/centers/research-and-development/missions/plan-and-deliver/scripts/verify-lane-warmup-parity.mjs --bootstrap full
node .sedea/centers/research-and-development/missions/plan-and-deliver/scripts/verify-lane-warmup-parity.mjs --bootstrap slim
```

**Roles covered (9 plan-and-deliver + 3 cross-mission):** **`squad-leader`**, **`author-prd`**, **`brainstorm-research`**, **`master-planner`**, **`coding-session`**, **`phase-planner`**, **`pre-pr-review`**, **`worktree-bootstrap`** (deprecated — retained for parity until [drain gate](#worktree-bootstrap-skill-drain-gate) **D4**), plus cross-mission spawn targets **`ad-hoc-prd`**, **`brainstorm-research`**, and **`quick-fix-plan`** (invoker mission `plan.mdc` in **`warmUpRules`**). Each role's manifest uses skill frontmatter **`laneRules`** + **`warmUpRules`** merged per [`.sedea/centers/sedea/docs/lane-manifest-contract.md`](.sedea/centers/sedea/docs/lane-manifest-contract.md). Sign-off record: same doc § *Parity sign-off record*.

**`--bootstrap full`** — today's host scan (must pass on manifest table changes). **`--bootstrap slim`** — §5.3 merge gate before **`alwaysApply` frontmatter flip** (expected fail until phase 5 bootstrap + flip).

## Universal spawn preflight (all plan-and-deliver spawners)

Run the checklist **before every child spawn** on any lane (Squad Leader §§3/§5, **master-planner** Step 7, **pr-plan** §5d, ship-chain spawns). Host behavior is in **`.sedea/centers/sedea/rules/4_mission.mdc`** § *Agent-to-agent spawn protocol* (MCP-only, host-resolved identity); this section is the **plan-and-deliver** operator checklist.

### MCP spawn/result (MCP-only)

| Situation | Use |
|-----------|-----|
| All plan-and-deliver spawned skills | **`mission_control_spawn_agent`**; child uses **`mission_control_send_agent_result`** at terminal |

**Do not** emit duplicate spawn or terminal notifications for the same child when MCP already succeeded (host dedupes; agents must not double-emit intentionally).

### Host-resolved identity (MCP — binding)

When using MCP tools, agents supply **skill contract fields only**. **Never** pass these keys in MCP tool arguments (host rejects):

`correlationId`, `dispatchId`, `slotId`, `laneKey`, `agentId`, `parentAgentId`, `childAgentId`

| Role | Identity rule |
|------|----------------|
| **Parent spawn (MCP)** | Host mints **`correlationId`**; injects into child bootstrap and registry |
| **Child terminal (MCP)** | Host reads **`correlationId`** from child lane spawn context — omit from **`mission_control_send_agent_result`** args |

Full table: rule **4** § *Host-resolved identity*.

### MCP spawn preflight (`mission_control_spawn_agent`)

| Step | Check |
|------|--------|
| M1 | Read target **`SKILL.md`** — confirm it documents MCP as primary (or MCP with MCP first) before switching off MCP-only |
| M2 | Every **`required: true`** input in skill frontmatter appears in MCP **`inputs`** with a valid value (see MCP spawn preflight) |
| M3 | Required MCP args present: **`skillPath`**, **`slug`**, **`name`**, **`description`**, **`inputs`** — camelCase keys match skill frontmatter |
| M4 | **Forbidden args absent** — no host-resolved identity keys (§ *Host-resolved identity* above) |
| M5 | Optional only when needed: **`warmUpRules`**, **`initiatingPrompt`** (≤ 32 KiB) |
| M6 | **`skillPath`** resolves under the correct center (R&D skills under **`.sedea/centers/research-and-development/`**) |
| M7 | On tool validation failure: stop, fix the failing row, retry spawn — new successful spawn mints a **new** host **`correlationId`** |
| M8 | **`name`** / **`description`** — **lane title prefix** + semantic title per [rule **50**](../../../../rules/50_mission-control-display-metadata-discipline.mdc) § *Lane title prefix conventions* and § *Lane title prefix (spawn `name`)* below; refresh stale child tab via **`mission_control_update_lane_display`** |

Child terminal: use § *MCP result preflight* in the spawned skill’s **`## Completion (spawned)`** — call **`mission_control_send_agent_result`** at terminal (host resolves **`correlationId`**; omit host-resolved identity keys from MCP args).

### MCP notify preflight (`mission_control_notify_child_lanes`)

Parent planner skills (**`master-planner`**, **`phase-planner`**, **`pr-breakdown`**) call **`mission_control_notify_child_lanes`** after **material** plan edits that affect named **non-terminal** open children. Normative protocol: **`.sedea/centers/sedea/rules/4_mission.mdc`** § *MCP notify protocol*. Per-skill **emit-when** tables live in each skill § *Plan-change notify — emit-when*.

**Parent offer after execution (binding):** Once a plan under a planner lane has **entered execution** (open non-terminal **`coding-session`**, or **`implementationHandoffStatus: spawned-coding-session`**), that planner’s continuation / wait modals **must** offer a developer **`plan-change`** option (*Plan Change — revise plan and notify open children*) before relying on ad-hoc revise alone. Emit notify only after the material edit from that path (or an explicit same-message revise that names scope). **Receive** USER_CHECKPOINTs on children are **not** a substitute for this parent **offer**. Skills: **`master-planner`** Step **7b**, **`phase-planner`** Step **5d**, **`quick-fix-plan`** while aggregating an open **`coding-session`**.

| Step | Check |
|------|--------|
| N1 | Caller authority — this skill may notify descendant slugs only (rule **4** § *MCP notify protocol* caller table); **`coding-session`** and leaf skills **forbidden** |
| N2 | Required args present: **`summary`**, **`changeType`**, **`affectedPlanPaths`** (non-empty), **`targetSlugs`** (exactly one slug) |
| N3 | **Forbidden args absent** — no host-resolved identity keys (§ *Host-resolved identity* above), no **`notifyAllDescendants`** |
| N4 | **`targetSlugs`** contains exactly **one** dispatch-unique **non-terminal** child slug per MCP call (v1) |
| N5 | **`affectedPlanPaths`** lists every operations plan path that grounds the change |
| N6 | Multiple children → **separate MCP calls** — one slug per call; **forbidden** empty or speculative **`targetSlugs`** |
| N7 | Enumerate only **non-terminal** children whose ongoing work is affected — omit terminal lanes before calling |
| N8 | New work → **`mission_control_spawn_agent`** — never use notify **`changeType`** as a spawn workaround |

**Spawn vs notify (binding):**

| Mechanism | When | Tool |
|-----------|------|------|
| **Spawn** | New child lane / new skill session / first-time row expansion | **`mission_control_spawn_agent`** |
| **Notify** | Material plan edit affects **existing** named non-terminal child; handoff + re-read context only | **`mission_control_notify_child_lanes`** |

Notify does **not** replace child terminal **`mission_control_send_agent_result`** merge on parent lanes (see **`phase-planner`** Step **5e**, **`pr-breakdown`** Step **6b**). Feature flag **`sedea.features.plan-change-notification`** must be on for host delivery (default off until dogfood PR 4).

**Child delivery checkpoint (receive) — binding:** Eligible **child** lanes that receive notify UserSend must implement § *Plan-change notification receive (child lane)* in their skill docs. v1 required skills:

| Skill | Receive section |
|-------|-----------------|
| **`coding-session`** | § *Plan-change notification receive (child lane)* — ship-lane recipient during PR implementation |
| **`phase-planner`** | § *Plan-change notification receive (child lane)* — mid phase delivery |
| **`master-planner`** | § *Plan-change notification receive (child lane)* — Master Plan child during decomposition |
| **`pr-plan`** | § *Plan-change notification receive (child lane)* — standalone spawned populator during §5c/§5e (inline invoker lanes use invoker receive sections) |

**Receive contract (all listed skills):** mandatory **`Read`** of each **`affectedPlanPaths`** entry; USER_CHECKPOINT with acknowledge / re-read-revise / plan-reconcile / escalate / stop-work options; **forbidden** terminal **`mission_control_send_agent_result`** solely due to notify; notify is **developer-input USER_CHECKPOINT**, not external-wait. Extend the table for other spawned plan-and-deliver children when dogfood surfaces gaps. Normative summary: **`.sedea/centers/sedea/rules/4_mission.mdc`** § *MCP notify protocol* § *Child agent duty*.

### Lane title prefix (spawn `name`)

Before MCP row **M8**, set spawn **`name`** (and child lane **`title`** on refresh) to **`{prefix}-{semantic title}`** per [`.sedea/centers/research-and-development/rules/50_mission-control-display-metadata-discipline.mdc`](../../../../rules/50_mission-control-display-metadata-discipline.mdc) § *Lane title prefix conventions*:

| Target skill | Prefix | `[N]` |
|--------------|--------|-------|
| **`author-prd`**, **`ad-hoc-prd`** | `PRD` | — |
| **`master-planner`** | `MP` | — |
| **`phase-planner`** | `PH{N}` | `parentIndex` (Delivery phases row) |
| **`coding-session`** | `PR{N}` | `parentIndex` (**`### PR list`** row) — **`pr-plan`** §5d and equivalent spawns |
| **`pre-pr-review`** | `Pre-PR Review` | — |

Truncate semantic title only when the full string exceeds rule **9** max **`title`** length (64).

### Terminal stop (normative for every spawned skill)

**This section is the canonical stop rule** for all **`## Completion (spawned)`** blocks in this mission, even when an individual `SKILL.md` ends that section after the host-protocol paragraph without repeating the sentence below.

After emitting **`mission_control_send_agent_result`**, **stop on that lane** for the current skill turn:

1. Do **not** emit another **`mission_control_spawn_agent`** unless a later user message on the same lane explicitly continues the skill (then call **`mission_control_send_agent_result`** again with updated **`outputs`** for the same spawn session).
2. Do **not** call MCP **`mission_control_propose_dispatch_resolution`** — only the **plan and deliver** Squad Leader closes the dispatch.
3. Do **not** run the next protocol step in the same turn after **`mission_control_send_agent_result`** (including “wait for child” announcements — the stop applies **after** the MCP result is sent).

**Canonical closing sentence** (optional in skill prose; meaning is required either way):

> Stop after the MCP result is sent.

**Per-skill procedure stops** (e.g. “Stop after the step 5 handoff block”, “Stop after spawning, announce wait, and close with structured choice”) apply **before** **`mission_control_send_agent_result`** — they gate mid-skill work, not replace this rule or **Turn completion invariant**. When both appear, order is: complete the gated step → **`mission_control_present_structured_choice`** when a gate is open → **`mission_control_refocus_parent_lane`** (when skill-eligible) → **`mission_control_send_agent_result`** (when spawned) → **stop**.

### Parent refocus on terminal (`mission_control_refocus_parent_lane`)

Spawned child lanes call **`mission_control_refocus_parent_lane`** on **true skill terminal** (not mid-flight **`continuationStatus: active`** re-emits) so the developer lands on the **immediate parent** lane before the MCP result. Ordering (when eligible): structured choice (if a gate is open) → **`mission_control_refocus_parent_lane`** → **`mission_control_send_agent_result`** → stop. See **`.sedea/centers/sedea/skills/README.md`** § *Optional parent refocus (`mission_control_refocus_parent_lane`)*.

| Skill | Refocus before MCP result? |
|-------|----------------------------|
| **`brainstorm-research`** | **Required** on Approve / Abandon terminal |
| **`pre-pr-review`** | **Required** (Step 8 **`go`** / **`no-go`**) |
| **`debug-and-fix`** (mission skill) | **Required** on all step-7/8 terminal outcomes |
| **`phase-planner`** | **Forbidden** while **`continuationStatus: active`**, **`phaseShipComplete: false`**, open **`### PR list`** rows, or §5f handoff pending; **Required** when **`phaseShipComplete: true`**, explicit defer/abandon, or unrecoverable failure with no retry |
| **`master-planner`** | **Forbidden** while **`continuationStatus: active`** or §7 **`caveatsApprovalStatus: pending`**; **Required** on true **`continuationStatus: terminal`** |
| **`author-prd`**, **`ad-hoc-prd`** | **Forbidden** while approval pending (**`continuationStatus: active`**); **Required** on Approve / Abandon terminal |
| **`delivery-phases`**, **`pr-breakdown`**, **`new-plan`**, **`pr-plan`** | **Forbidden** while **`continuationStatus: active`**, open children, or pending gates; **Required** on true **`continuationStatus: terminal`** when this skill runs **spawned** (standalone). Inline under a planner lane: no refocus (inline completion) |
| **`coding-session`** | **Required** on true ship / abandon / blocked terminal **when** a resolvable spawned parent exists; **omit** on detached / parentless entry (host would no-op) |
| **`hosting-repo-rules`** | **Forbidden** — fire-and-forget parallel fork; parent does not await focus handback |
| **`quick-fix-plan`** (quick-fix mission) | **Forbidden** while **`continuationStatus: active`** or open **`coding-session`**; **Required** on true skill terminal |

**Common mistake:** Emitting refocus on the first **`status: success`** terminal after §§1–4 + inline **`pr-breakdown`** while **`continuationStatus: active`** — milestone complete ≠ skill terminal eligible for refocus. See **`phase-planner/SKILL.md`** § *MCP parent refocus*.

**Forbidden globally on notify-only turns:** **`mission_control_refocus_parent_lane`** solely because a child notification arrived — merge notify, then continue ownership on this lane until a true terminal.

| Skill | Explicit “Stop after the MCP result is sent” in `## Completion (spawned)`? | Notes |
|-------|------------------------------------------------------------------------|--------|
| `author-prd` | Yes | Also forbids downstream planning spawns |
| `pr-plan` | Yes | May spawn **`coding-session`** in §5d before terminal (standalone) or inline under **`new-plan`**; one spawn per turn |
| `master-planner` | Yes | Procedure stop before terminal when `continuationStatus: active`; Step 7 runs **`delivery-phases`** / **`pr-breakdown`** inline on **later** user messages only; **`continuationStatus: terminal`** blocked while **`caveatsApprovalStatus: pending`** (§7 approve gate — see **`planner/SKILL.md`** *Draft §7 Caveats*) |
| `delivery-phases`, `pr-breakdown`, `new-plan` | Yes | `delivery-phases` / `pr-breakdown`: inline **`new-plan`** under planner; `new-plan`: inline under decomposition; see each skill § *Completion (spawned)* |
| Ship chain (`coding-session`, `pre-pr-review`) | Yes | Inline ship skills (`create-pr`, `deploy-walk`, `plan-reconcile`, `pr-review`) — see **`## Completion (inline)`** |
| `phase-planner` | Yes | Runs **`delivery-phases`** / **`pr-breakdown`** inline; may spawn nested **`phase-planner`** or **`coding-session`**; **MCP** spawn/result |

When authoring or reviewing a skill, duplicating the canonical sentence under **`## Completion (spawned)`** is encouraged but **not** required if this README is in **`warmUpRules`** or the spawn request passes it.

## Default warm-up

Every **spawned** plan-and-deliver skill lists the paths below in frontmatter **`warmUpRules`** (Mission Control merges with optional run-request **`warmUpRules`**). **`skills/README.md`** (this file) is **required** on all of them so § *Terminal stop (normative)* loads even when an individual `SKILL.md` omits the closing sentence.

**All spawned skills** (planning + ship):

- `.sedea/centers/research-and-development/missions/plan-and-deliver/plan.mdc` — Squad Leader §§1–7 ledger, spawn/wait; ship skills also use §8 via dev-process / bubble-up
- `.sedea/centers/research-and-development/missions/plan-and-deliver/skills/README.md` — spawn contracts, inline vs spawned shapes, **terminal stop (normative)**
- `.sedea/centers/research-and-development/docs/development-process.md`

**Planning skills** also include:

- `.sedea/centers/research-and-development/rules/30_planning-target-resolution.mdc`

**Ship skills** also include:

- `.sedea/centers/research-and-development/rules/20_efficient-pr-shipping.mdc`
- `.sedea/centers/research-and-development/rules/30_planning-target-resolution.mdc` — **`pre-pr-review`** spawn only; **`coding-session`** omits rule **30** from frontmatter (384 KiB warm-up cap); use `inputs.targetPlanPath` and explicit `Read` of rule **30** when resolving ambiguous `.sedea` paths

**Warm-up cap exceptions (384 KiB host budget):**

Each spawned ship skill documents its manifest in **`SKILL.md`** § *Warm-up manifest (spawned)* or § *Warm-up manifest (inline)*. Frontmatter must match the documented table — **`verify-skill-manifest.mjs`** enforces table ↔ frontmatter parity, spawn preflight row **11** for definitive **`laneRules`** roles, and plan-change notify emit/receive governance lint (see § *Adding or removing a skill*).

| Skill | Frontmatter omits (vs table above) | Runtime reads remain |
|-------|-----------------------------------|----------------------|
| **`pre-pr-review`** | `plan.mdc`, `development-process.md` | Step 3 reads **`development-process.md`**; Step 4 loads **`inputs.targetPlanPath`** (PR plan, not Squad Leader **`plan.mdc`**) |
| **`coding-session`** | rule **30** only | Explicit **`Read`** of rule **30** when resolving ambiguous `.sedea` paths |
| **`deploy-walk`**, **`plan-reconcile`** | All frontmatter warm-up keys (inline-only) | Inherit **`coding-session`** **`effectiveWarmUp`** — see each skill § *Warm-up manifest (inline)* |

Do **not** re-add omitted paths to **`pre-pr-review`** frontmatter without re-checking combined warm-up size — spawn rejects with **`warm-up-too-large`** when frontmatter + merged run-request rules exceed the host cap (see **`.sedea/centers/sedea/rules/4_mission.mdc`** § *Run-request line*).

**`pr-review`** and **`create-pr`** are inline-only — **no** frontmatter **`warmUpRules`**; they run **only** on the active **`coding-session`** lane (which includes this README and rule **20**). Do not dispatch **`pr-review`** or **`create-pr`** as standalone skill sessions.

**`pre-pr-review`** is **spawn-only** — **forbidden** inline on **`coding-session`**; do not dispatch **`pre-pr-review`** as a standalone session without **`coding-session`** spawn handover (see **`pre-pr-review/SKILL.md`** § *Standalone dispatch*).

### SKILL.md frontmatter (Mission Control spawn)

Mission Control **`skillResolver`** parses YAML frontmatter with strict unique keys. **`inputs`** must use **2-space** nesting (input name → field keys), not single-space flat keys — flat `inputs` breaks spawn with `skill-not-found` / duplicate key errors.

**Canonical shape** — copy from **`missions/plan-and-deliver/skills/author-prd/SKILL.md`**:

```yaml
inputs:
  inputName:
    type: string
    description: ...
    required: true
warmUpRules:
  - ".sedea/centers/..."
```

**Repair / verify:** from hosting repo root (with **`scripts/node_modules`** installed):

```bash
node .sedea/centers/research-and-development/missions/plan-and-deliver/scripts/fix-skill-frontmatter.mjs --write
node .sedea/centers/research-and-development/missions/plan-and-deliver/scripts/verify-skill-manifest.mjs
```

### Adding or removing a skill

When you add, rename, or remove a protocol branch under `missions/plan-and-deliver/skills/<name>/SKILL.md` (or under the **`prd`** mission), update the same change set:

1. **`center.yaml`** — add or remove the repo-relative path under that mission's **`skillEntries`** (and **`development-process.md`** § *Protocol branches* when the branch is user-facing).
2. **Verify** from the hosting repo root:

 ```bash
 node .sedea/centers/research-and-development/missions/plan-and-deliver/scripts/verify-skill-manifest.mjs
 ```

3. **plan-and-deliver only** — if the skill is **spawned**, ensure **`warmUpRules`** includes `missions/plan-and-deliver/plan.mdc`, this README, and the usual rules per § *Default warm-up* above; add **`## Completion (spawned)`** + host protocol line when applicable.

### Scripts (`plan-state.mjs`, `pr-review.mjs`)

- **Location:** `missions/plan-and-deliver/scripts/` for **`plan-state.mjs`** and **`plan-ws-completeness.mjs`**; canonical **`pr-review.mjs`** at **`.sedea/centers/sedea/scripts/pr-review.mjs`** (paths in skills and rule **20** are workspace-root relative from the hosting repo that contains **`.sedea/`** — see that repo’s **`.cursor/rules/`** for hosting-repo specifics).
- **Runtime:** **Node** (bundled with Sedea / VS Code) — see [`.sedea/centers/research-and-development/rules/31_dispatch-scope.mdc`](../../../rules/31_dispatch-scope.mdc) § *Hosting repo cwd (scripts)* and the hosting repo **`.cursor/rules/`**.
- **Vendor trees:** do not treat `scripts/**/node_modules/` or other installed dependencies as protocol documentation (center governance ends at `SKILL.md`, rules, and mission plans).
- **`verify-skill-manifest.mjs`** — compares **`center.yaml`** `skillEntries` to on-disk `SKILL.md` files; validates frontmatter YAML; lints **`warmUpRules`** / **`laneRules`** table ↔ frontmatter parity on spawned plan-and-deliver skills; enforces spawn preflight row **11** definitive **`laneRules`** for **`author-prd`**, **`master-planner`**, and **`coding-session`**; lints **`mission_control_spawn_agent`** spawn examples on master-planner skills (R&D + Sedea maintenance copies) so string-typed **`inputs.parent`** never uses JSON **`null`** — wire encoding must be **`"parent":"null"`**; lints **plan-change notify governance** — parent emit (**`master-planner`**, **`phase-planner`**, **`pr-breakdown`**) N1–N8 preflight rows + child receive (**`coding-session`**, **`phase-planner`**, **`master-planner`**) USER_CHECKPOINT contract + README N1–N8 / v1 receive table (exit 0 = match + parity + spawn wire lint + notify lint).
