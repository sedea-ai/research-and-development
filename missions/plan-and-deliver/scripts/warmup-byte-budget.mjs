/**
 * Shared spawn warm-up byte budget helpers for verify scripts.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { mapWarmUpPath, SD_CENTER_PREFIX } from './resolve-governance-root.mjs';

export const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
export const WARM_UP_BYTE_CAP = 384 * 1024;
/** Phase S5 — CI WARN at 80% of spawn cap (informational until --enforce-spawn-byte-budget). */
export const WARM_UP_WARN_THRESHOLD = 320 * 1024;
/** PRD D2 — skill body prose soft cap before on-demand split is required in PR. */
export const SKILL_PROSE_BYTE_CAP = 40 * 1024;

export const SEDEA_CENTER_PREFIX = '.sedea/centers/sedea/';
export const SEDEA_BOOTSTRAP_RULE = `${SEDEA_CENTER_PREFIX}rules/bootstrap.mdc`;

/**
 * Sedea-native roles for verify-warmup-bytes --table (PRD S5.1).
 * laneRules: leader warm-up merge; skillRelPath: repo-relative under sedea center root.
 */
export const SEDEA_NATIVE_BYTE_ROLES = {
  'squad-leader-janitor': {
    category: 'sedea-leader',
    laneRules: [
      `${SEDEA_CENTER_PREFIX}rules/2_ask-question-instructions.mdc`,
      `${SEDEA_CENTER_PREFIX}rules/4_mission.mdc`,
      `${SEDEA_CENTER_PREFIX}missions/janitor/plan.mdc`,
    ],
  },
  'squad-leader-mission-maintenance': {
    category: 'sedea-leader',
    laneRules: [
      `${SEDEA_CENTER_PREFIX}rules/2_ask-question-instructions.mdc`,
      `${SEDEA_CENTER_PREFIX}rules/4_mission.mdc`,
      `${SEDEA_CENTER_PREFIX}missions/mission-maintenance/plan.mdc`,
      `${SEDEA_CENTER_PREFIX}docs/mission-three-lane-cadence.md`,
    ],
  },
  'squad-leader-align-existing-rules-with-sedea': {
    category: 'sedea-leader',
    laneRules: [
      `${SEDEA_CENTER_PREFIX}rules/2_ask-question-instructions.mdc`,
      `${SEDEA_CENTER_PREFIX}rules/4_mission.mdc`,
      `${SEDEA_CENTER_PREFIX}missions/align-existing-rules-with-sedea/plan.mdc`,
      `${SEDEA_CENTER_PREFIX}docs/mission-three-lane-cadence.md`,
    ],
  },
  'implementation-session-mission-maintenance': {
    category: 'sedea-ship',
    skillRelPath: 'missions/mission-maintenance/skills/implementation-session/SKILL.md',
  },
  'smart-upstream-merge': {
    category: 'sedea-ship',
    skillRelPath: 'missions/smart-center-upstream-sync/skills/smart-upstream-merge/SKILL.md',
  },
  'analyze-existing-rules-with-sedea': {
    category: 'sedea-analyze',
    skillRelPath:
      'missions/align-existing-rules-with-sedea/skills/analyze-existing-rules-with-sedea/SKILL.md',
  },
};

/** Spawn skills reported in the per-role CI table (planning + ship). */
export const SPAWN_ROLE_CATEGORY = {
  'author-prd': 'planning',
  'ad-hoc-prd': 'planning',
  'brainstorm-research': 'planning',
  'master-planner': 'planning',
  'phase-planner': 'planning',
  'pr-plan': 'planning',
  'pr-breakdown': 'planning',
  'delivery-phases': 'planning',
  'new-plan': 'planning',
  // quick-fix-plan lives under missions/quick-fix/skills/ — not scanned by --table
  'quick-fix-plan': 'planning',
  'coding-session': 'ship',
  'pre-pr-review': 'ship',
  'worktree-bootstrap': 'ship',
};

export function normalizeRepoPath(p) {
  return String(p).replace(/\\/g, '/').replace(/^\.\//, '');
}

export function dedupeOrderedPaths(paths) {
  const seen = new Set();
  const out = [];
  for (const raw of paths) {
    const p = normalizeRepoPath(String(raw));
    if (!p || seen.has(p)) continue;
    seen.add(p);
    out.push(p);
  }
  return out;
}

export function assignedSkillBodyWarmUpPath(skillName) {
  if (!skillName) return undefined;
  return normalizeRepoPath(
    `${SD_CENTER_PREFIX}missions/plan-and-deliver/skills/${skillName}/SKILL.md`,
  );
}

export function assignedSedeaSkillBodyWarmUpPath(skillRelPath) {
  if (!skillRelPath) return undefined;
  return normalizeRepoPath(`${SEDEA_CENTER_PREFIX}${skillRelPath.replace(/^\.\//, '')}`);
}

export function pathsForSpawnByteBudget(skillName, mergedPaths) {
  const assigned = assignedSkillBodyWarmUpPath(skillName);
  if (!assigned) return mergedPaths;
  return mergedPaths.filter((p) => normalizeRepoPath(p) !== assigned);
}

export function pathsForSedeaSpawnByteBudget(skillRelPath, mergedPaths) {
  const assigned = assignedSedeaSkillBodyWarmUpPath(skillRelPath);
  if (!assigned) return mergedPaths;
  return mergedPaths.filter((p) => normalizeRepoPath(p) !== assigned);
}

export async function combinedWarmUpBytes(ctx, paths) {
  let total = 0;
  let skipped = 0;
  for (const rel of dedupeOrderedPaths(paths)) {
    const abs = mapWarmUpPath(ctx, rel);
    if (!abs) {
      skipped += 1;
      continue;
    }
    const st = await fs.stat(abs);
    total += st.size;
  }
  return { bytes: total, skippedPaths: skipped };
}

export async function readSkillFrontmatterPaths(skillRelPath, centerRoot) {
  const abs = path.join(centerRoot, skillRelPath);
  const raw = await fs.readFile(abs, 'utf8');
  const m = FRONTMATTER_RE.exec(raw);
  if (!m) return { warmUpRules: [], laneRules: [], skillBodyBytes: raw.length };
  let parsed;
  try {
    parsed = parseYaml(m[1]);
  } catch {
    return { warmUpRules: [], laneRules: [], skillBodyBytes: raw.length };
  }
  const warmUpRules = Array.isArray(parsed?.warmUpRules)
    ? parsed.warmUpRules.map((p) => normalizeRepoPath(String(p)))
    : [];
  const laneRules = Array.isArray(parsed?.laneRules)
    ? parsed.laneRules.map((p) => normalizeRepoPath(String(p)))
    : [];
  return { warmUpRules, laneRules, skillBodyBytes: raw.length };
}

export function statusForBytes(bytes) {
  if (bytes > WARM_UP_BYTE_CAP) return 'OVER';
  if (bytes > WARM_UP_WARN_THRESHOLD) return 'WARN';
  return 'OK';
}

export function isOverSpawnCap(bytes) {
  return bytes > WARM_UP_BYTE_CAP;
}

export function isOverWarnThreshold(bytes) {
  return bytes > WARM_UP_WARN_THRESHOLD;
}

export function formatBytes(n) {
  return n.toLocaleString('en-US');
}
