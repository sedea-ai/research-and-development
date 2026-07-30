#!/usr/bin/env node
/**
 * Read-union and write-default parity for plan-state.mjs (ops paths PR 2).
 *
 * Run from hosting repo root (requires scripts/ npm ci for yaml via run-sedea-node):
 *
 *   HOSTING_ROOT="$(pwd)" node --test \
 *     .sedea/centers/research-and-development/missions/plan-and-deliver/scripts/plan-state.read-union.test.mjs
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const HOSTING_ROOT = process.env.HOSTING_ROOT
  ? path.resolve(process.env.HOSTING_ROOT)
  : path.resolve(SCRIPT_DIR, '../../../../../..');
const PLAN_STATE = path.join(
  HOSTING_ROOT,
  '.sedea/centers/research-and-development/missions/plan-and-deliver/scripts/plan-state.mjs',
);
const RUN_NODE = path.join(HOSTING_ROOT, '.sedea/centers/sedea/scripts/run-sedea-node.sh');

const LEGACY_UUID_SCOPE = '8f4a2c1e-6b3d-4a9f-8e1c-2d5f7a9b0c4d';

function runPlanState(args) {
  return spawnSync(RUN_NODE, [PLAN_STATE, ...args], {
    cwd: HOSTING_ROOT,
    encoding: 'utf8',
  });
}

function planPaths(scope, slug) {
  const base = path.join(HOSTING_ROOT, '.sedea/operations', scope, 'plans');
  return {
    plan: path.join(base, `${slug}.plan.md`),
    sidecar: path.join(base, `${slug}.state.yaml`),
  };
}

async function writePrPlan(planPath, name) {
  await fs.mkdir(path.dirname(planPath), { recursive: true });
  await fs.writeFile(
    planPath,
    `---\nname: ${name}\n---\n\n## 1. Single concern\n\n${name}\n`,
    'utf8',
  );
}

async function removeIfExists(filePath) {
  try {
    await fs.unlink(filePath);
  } catch {
    /* absent */
  }
}

test('plan-state constant matches sedea-dispatch-storage user scope', async () => {
  const src = await fs.readFile(PLAN_STATE, 'utf8');
  assert.match(src, /WORKSPACE_BOUND_OPERATIONS_SCOPE = 'user'/);
  assert.doesNotMatch(src, /targetScope = '8f4a2c1e/);
});

test('findPlanBySlug discovers UUID-only legacy plans when user scope exists', async () => {
  const slug = 'read_union_uuid_only_fixture';
  const { plan, sidecar } = planPaths(LEGACY_UUID_SCOPE, slug);
  await writePrPlan(plan, 'UUID-only fixture');
  await removeIfExists(sidecar);

  const result = runPlanState([
    'set-session',
    '--slug',
    slug,
    '--focus',
    path.join(HOSTING_ROOT, 'wt-fixture'),
  ]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const sidecarText = await fs.readFile(sidecar, 'utf8');
  assert.match(sidecarText, /focusPath:/);

  await removeIfExists(sidecar);
  await removeIfExists(plan);
});

test('findPlanBySlug prefers user scope when the same slug exists in user and UUID trees', async () => {
  const slug = 'read_union_user_wins_fixture';
  const userPaths = planPaths('user', slug);
  const uuidPaths = planPaths(LEGACY_UUID_SCOPE, slug);
  await writePrPlan(userPaths.plan, 'USER_SCOPE_WINNER');
  await writePrPlan(uuidPaths.plan, 'UUID_SCOPE_LOSER');
  await removeIfExists(userPaths.sidecar);
  await removeIfExists(uuidPaths.sidecar);

  const result = runPlanState([
    'set-session',
    '--slug',
    slug,
    '--focus',
    path.join(HOSTING_ROOT, 'wt-fixture'),
  ]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(await fs.stat(userPaths.sidecar).then(() => true).catch(() => false), true);
  assert.equal(await fs.stat(uuidPaths.sidecar).then(() => true).catch(() => false), false);

  await removeIfExists(userPaths.sidecar);
  await removeIfExists(userPaths.plan);
  await removeIfExists(uuidPaths.plan);
});

test('write commands ensure user/plans exists on HOSTING_ROOT', async () => {
  const slug = 'read_union_write_default_fixture';
  const userPlans = path.join(HOSTING_ROOT, '.sedea/operations/user/plans');
  const { plan, sidecar } = planPaths(LEGACY_UUID_SCOPE, slug);
  await writePrPlan(plan, 'write default fixture');
  await removeIfExists(sidecar);

  const hadUserPlans = await fs.stat(userPlans).then(() => true).catch(() => false);
  if (hadUserPlans) {
    await fs.rm(userPlans, { recursive: true, force: true });
  }

  const result = runPlanState([
    'set-worktrees',
    '--slug',
    slug,
    '--json',
    JSON.stringify([{ repo: 'app', path: path.join(HOSTING_ROOT, 'wt-fixture') }]),
  ]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(await fs.stat(userPlans).then(() => true).catch(() => false), true);

  await removeIfExists(sidecar);
  await removeIfExists(plan);
  if (!hadUserPlans) {
    await fs.rm(userPlans, { recursive: true, force: true });
  }
});
