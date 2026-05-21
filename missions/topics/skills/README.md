# topics — skill execution

The **topics** mission is **inline-only** on the Squad Leader lane. See **`../plan.mdc`** § *Mission closure*.

| Skill | Invoker | Result section | Dispatch close |
|-------|---------|----------------|----------------|
| `create-topic-plan` | Topics Squad Leader §3 (`execution: inline`) | `## Completion (inline)` | Squad Leader §4 → **`MC_DISPATCH_RESOLVED_V1`** |

**`create-topic-plan`** reports `creationStatus`, `planPath`, `sidecarPath`, and related fields in prose. Dispatch resolution uses **`MC_DISPATCH_RESOLVED_V1`** on the leader lane per **`.sedea/centers/sedea/rules/4_mission.mdc`**.
