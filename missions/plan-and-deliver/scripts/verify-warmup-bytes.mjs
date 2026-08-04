#!/usr/bin/env node
/**
 * Print per-role spawn warm-up byte totals for plan-and-deliver skills (PRD D1)
 * and Sedea-native maintenance roles (PRD S5.1).
 *
 * Scope: roles under `missions/plan-and-deliver/skills/` (planning + ship
 * categories in SPAWN_ROLE_CATEGORY) plus SEDEA_NATIVE_BYTE_ROLES.
 *
 * Run from hosting repo root or software-development center repo root:
 *
 *   node missions/plan-and-deliver/scripts/verify-warmup-bytes.mjs --table
 *   node .../verify-warmup-bytes.mjs --table --hosting-root /path/to/hosting
 *   node .../verify-warmup-bytes.mjs --table --bootstrap slim
 *
 * Exit 0 after printing the table (informational — WARN rows at 320 KiB do not fail
 * unless --enforce-spawn-byte-budget is passed, which fails roles over 384 KiB).
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { resolveGovernanceContext } from './resolve-governance-root.mjs';
import {
  FRONTMATTER_RE,
  SPAWN_ROLE_CATEGORY,
  SEDEA_BOOTSTRAP_RULE,
  SEDEA_CENTER_PREFIX,
  SEDEA_NATIVE_BYTE_ROLES,
  WARM_UP_BYTE_CAP,
  WARM_UP_WARN_THRESHOLD,
  SKILL_PROSE_BYTE_CAP,
  assignedSkillBodyWarmUpPath,
  combinedWarmUpBytes,
  dedupeOrderedPaths,
  formatBytes,
  isOverSpawnCap,
  isOverWarnThreshold,
  normalizeRepoPath,
  pathsForSedeaSpawnByteBudget,
  pathsForSpawnByteBudget,
  readSkillFrontmatterPaths,
  statusForBytes,
} from './warmup-byte-budget.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CENTER_ROOT = path.resolve(__dirname, '../../..');
const SEDEA_RULES_DIR = '.sedea/centers/sedea/rules';
const SD_BOOTSTRAP_RULE = '.sedea/centers/software-development/rules/bootstrap.mdc';

const PLAN_AND_DELIVER_PREFIX = 'missions/plan-and-deliver/skills/';

function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function parseArgs(argv) {
  let table = false;
  let bootstrap = 'full';
  let hostingRoot = undefined;
  let enforceSpawnByteBudget = false;
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--table') {
      table = true;
      continue;
    }
    if (arg === '--enforce-spawn-byte-budget') {
      enforceSpawnByteBudget = true;
      continue;
    }
    if (arg === '--bootstrap') {
      bootstrap = argv[i + 1] ?? '';
      i += 1;
      continue;
    }
    if (arg === '--hosting-root') {
      hostingRoot = argv[i + 1] ?? '';
      i += 1;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      process.stdout.write(
        'Usage: verify-warmup-bytes.mjs [--table] [--bootstrap full|slim] [--hosting-root PATH] [--enforce-spawn-byte-budget]\n',
      );
      process.exit(0);
    }
    die(`unknown argument: ${arg}`);
  }
  if (bootstrap !== 'full' && bootstrap !== 'slim') {
    die(`--bootstrap must be "full" or "slim" (got "${bootstrap}")`);
  }
  return { table, bootstrap, hostingRoot, enforceSpawnByteBudget };
}

async function resolveHostingRoot(explicit, ctx) {
  if (explicit) {
    const abs = path.resolve(explicit);
    try {
      await fs.access(path.join(abs, '.sedea/centers/sedea'));
      return abs;
    } catch {
      die(`--hosting-root is not a Sedea hosting repo: ${abs}`);
    }
  }
  if (ctx.hostingRoot) return ctx.hostingRoot;
  return null;
}

async function scanSedeaAlwaysApply(hostingRoot) {
  const rulesDir = path.join(hostingRoot, SEDEA_RULES_DIR);
  const entries = await fs.readdir(rulesDir);
  const out = [];
  for (const name of entries.sort()) {
    if (!name.endsWith('.mdc')) continue;
    const abs = path.join(rulesDir, name);
    const raw = await fs.readFile(abs, 'utf8');
    const m = FRONTMATTER_RE.exec(raw);
    if (!m) continue;
    let parsed;
    try {
      parsed = parseYaml(m[1]);
    } catch {
      continue;
    }
    if (parsed?.alwaysApply === true) {
      out.push(normalizeRepoPath(`${SEDEA_RULES_DIR}/${name}`));
    }
  }
  return out;
}

async function listSpawnSkillRelPaths() {
  const skillsDir = path.join(CENTER_ROOT, 'missions/plan-and-deliver/skills');
  const entries = await fs.readdir(skillsDir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const skillName = e.name;
    if (!SPAWN_ROLE_CATEGORY[skillName]) continue;
    const rel = `${PLAN_AND_DELIVER_PREFIX}${skillName}/SKILL.md`;
    try {
      await fs.access(path.join(CENTER_ROOT, rel));
      out.push({ skillName, rel });
    } catch {
      /* skip */
    }
  }
  return out.sort((a, b) => a.skillName.localeCompare(b.skillName));
}

async function bootstrapPathsPlanAndDeliver(hostingRoot, bootstrap) {
  if (!hostingRoot) return [];
  if (bootstrap === 'slim') {
    return dedupeOrderedPaths([SEDEA_BOOTSTRAP_RULE, SD_BOOTSTRAP_RULE]);
  }
  return scanSedeaAlwaysApply(hostingRoot);
}

async function bootstrapPathsSedeaNative(hostingRoot, bootstrap) {
  if (!hostingRoot) return [];
  if (bootstrap === 'slim') {
    return [SEDEA_BOOTSTRAP_RULE];
  }
  return scanSedeaAlwaysApply(hostingRoot);
}

function printTable(rows, ctx, bootstrap, hostingRoot) {
  process.stdout.write('\n');
  process.stdout.write(
    '| Role | Scope | Category | Spawn warm-up (bytes) | Cap | Status |\n',
  );
  process.stdout.write(
    '|------|-------|----------|----------------------:|----:|--------|\n',
  );
  for (const row of rows) {
    process.stdout.write(
      `| ${row.roleName} | ${row.scope} | ${row.category} | ${formatBytes(row.bytes)} | ${formatBytes(WARM_UP_BYTE_CAP)} | ${row.status} |\n`,
    );
  }
  process.stdout.write('\n');
  const modeNote =
    ctx.mode === 'center' && !hostingRoot
      ? 'center-repo-only mode — sedea bootstrap paths omitted; pass --hosting-root for full totals'
      : `bootstrap=${bootstrap}${hostingRoot ? '' : ' (no hosting root — sedea paths omitted)'}`;
  process.stdout.write(
    `Note: ${modeNote}. WARN at ${formatBytes(WARM_UP_WARN_THRESHOLD)} bytes (80% cap); OVER above ${formatBytes(WARM_UP_BYTE_CAP)}. Assigned skill body excluded per lane-manifest-contract § Spawn cap.\n`,
  );
}

async function readSedeaSkillFrontmatter(skillRelPath, sedeaCenterRoot) {
  const abs = path.join(sedeaCenterRoot, skillRelPath);
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

async function scanPlanAndDeliverRoles(ctx, bootstrapList) {
  const skills = await listSpawnSkillRelPaths();
  const rows = [];
  let proseWarnCount = 0;

  for (const { skillName, rel } of skills) {
    const { warmUpRules, laneRules, skillBodyBytes } = await readSkillFrontmatterPaths(
      rel,
      CENTER_ROOT,
    );
    const merged = dedupeOrderedPaths([...bootstrapList, ...laneRules, ...warmUpRules]);
    const budgetPaths = pathsForSpawnByteBudget(skillName, merged);
    const { bytes } = await combinedWarmUpBytes(ctx, budgetPaths);
    rows.push({
      roleName: skillName,
      scope: 'plan-and-deliver',
      category: SPAWN_ROLE_CATEGORY[skillName] ?? 'other',
      bytes,
      status: statusForBytes(bytes),
    });

    if (skillBodyBytes > SKILL_PROSE_BYTE_CAP) {
      proseWarnCount += 1;
      process.stderr.write(
        `WARN: ${rel}: skill body is ${skillBodyBytes} bytes (>${SKILL_PROSE_BYTE_CAP}) — justify on-demand split in PR per rule 45_skill-authoring-hygiene.mdc\n`,
      );
    }
  }

  return { rows, proseWarnCount };
}

async function scanSedeaNativeRoles(ctx, bootstrapList, hostingRoot) {
  if (!hostingRoot) return { rows: [], proseWarnCount: 0 };

  const sedeaCenterRoot = path.join(hostingRoot, SEDEA_CENTER_PREFIX.slice(0, -1));
  const rows = [];
  let proseWarnCount = 0;

  for (const [roleName, manifest] of Object.entries(SEDEA_NATIVE_BYTE_ROLES)) {
    const laneRules = (manifest.laneRules ?? []).map(normalizeRepoPath);
    let warmUpRules = [];
    let skillRelPath = manifest.skillRelPath;
    let skillBodyBytes = 0;

    if (skillRelPath) {
      const fm = await readSedeaSkillFrontmatter(skillRelPath, sedeaCenterRoot);
      warmUpRules = fm.warmUpRules;
      skillBodyBytes = fm.skillBodyBytes;
      warmUpRules = warmUpRules.map((p) =>
        p.startsWith(SEDEA_CENTER_PREFIX) ? p : normalizeRepoPath(`${SEDEA_CENTER_PREFIX}${p}`),
      );
    }

    const merged = dedupeOrderedPaths([...bootstrapList, ...laneRules, ...warmUpRules]);
    const budgetPaths = skillRelPath
      ? pathsForSedeaSpawnByteBudget(skillRelPath, merged)
      : merged;
    const { bytes } = await combinedWarmUpBytes(ctx, budgetPaths);
    rows.push({
      roleName,
      scope: 'sedea-native',
      category: manifest.category ?? 'sedea',
      bytes,
      status: statusForBytes(bytes),
    });

    if (skillRelPath && skillBodyBytes > SKILL_PROSE_BYTE_CAP) {
      proseWarnCount += 1;
      const rel = normalizeRepoPath(`${SEDEA_CENTER_PREFIX}${skillRelPath}`);
      process.stderr.write(
        `WARN: ${rel}: skill body is ${skillBodyBytes} bytes (>${SKILL_PROSE_BYTE_CAP}) — justify on-demand split in PR per rule 45_skill-authoring-hygiene.mdc\n`,
      );
    }
  }

  return { rows, proseWarnCount };
}

async function main() {
  const { table, bootstrap, hostingRoot: hostingRootArg, enforceSpawnByteBudget } =
    parseArgs(process.argv);
  const ctx = await resolveGovernanceContext({ scriptDir: __dirname });
  const hostingRoot = await resolveHostingRoot(hostingRootArg, ctx);
  const pdBootstrap = await bootstrapPathsPlanAndDeliver(hostingRoot, bootstrap);
  const sedeaBootstrap = await bootstrapPathsSedeaNative(hostingRoot, bootstrap);

  const pdScan = await scanPlanAndDeliverRoles(ctx, pdBootstrap);
  const sedeaScan = await scanSedeaNativeRoles(ctx, sedeaBootstrap, hostingRoot);
  const rows = [...pdScan.rows, ...sedeaScan.rows];

  let warn320Count = 0;
  let overCapCount = 0;
  for (const row of rows) {
    if (isOverWarnThreshold(row.bytes)) warn320Count += 1;
    if (isOverSpawnCap(row.bytes)) overCapCount += 1;
  }

  if (table) {
    printTable(rows, ctx, bootstrap, hostingRoot);
  }

  const planning = rows.filter((r) => r.category === 'planning');
  const ship = rows.filter((r) => r.category === 'ship');
  const sedeaNative = rows.filter((r) => r.scope === 'sedea-native');
  const proseWarnCount = pdScan.proseWarnCount + sedeaScan.proseWarnCount;

  process.stdout.write(
    `OK: spawn warm-up byte table — ${rows.length} role(s) ` +
      `(plan-and-deliver ${pdScan.rows.length}: planning ${planning.length}, ship ${ship.length}; ` +
      `sedea-native ${sedeaNative.length}); ` +
      `${warn320Count} over ${formatBytes(WARM_UP_WARN_THRESHOLD)} bytes (WARN); ` +
      `${overCapCount} over ${formatBytes(WARM_UP_BYTE_CAP)} bytes (OVER)` +
      (enforceSpawnByteBudget ? ' (--enforce-spawn-byte-budget)' : '') +
      `; skill prose WARN ${proseWarnCount}\n`,
  );

  if (enforceSpawnByteBudget && overCapCount > 0) {
    die(`${overCapCount} role(s) exceed spawn cap ${WARM_UP_BYTE_CAP}`, 1);
  }
}

main().catch((err) => die(String(err)));
