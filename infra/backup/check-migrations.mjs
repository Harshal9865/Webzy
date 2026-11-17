import fs from 'node:fs';
import path from 'node:path';

/**
 * Additive-only SQL Migration Safety Guard:
 * Fails if any SQL migration file introduces destructive DROP TABLE or TRUNCATE statements,
 * protecting live Supabase customer, order, and keepsake data across deployments.
 */

const SUPABASE_DIR = path.resolve(process.cwd(), 'infra', 'supabase');
const DESTRUCTIVE_RE = /\b(?:DROP\s+TABLE|TRUNCATE\s+TABLE|TRUNCATE\s+public\.|DELETE\s+FROM\s+public\.(?:profiles|orders|sites|payments|refunds|invoices))\b/i;

function main() {
  if (!fs.existsSync(SUPABASE_DIR)) {
    console.error('Migration directory not found:', SUPABASE_DIR);
    process.exit(1);
  }

  const sqlFiles = fs
    .readdirSync(SUPABASE_DIR)
    .filter((f) => f.endsWith('.sql') && !f.startsWith('0000_'))
    .sort();

  const violations = [];

  for (const file of sqlFiles) {
    const full = path.join(SUPABASE_DIR, file);
    const lines = fs.readFileSync(full, 'utf8').split(/\r?\n/);
    lines.forEach((line, idx) => {
      const stripped = line.replace(/--.*$/, '').trim();
      if (!stripped) return;
      if (DESTRUCTIVE_RE.test(stripped)) {
        violations.push(`${file}:${idx + 1}: ${stripped}`);
      }
    });
  }

  if (violations.length > 0) {
    console.error('DESTRUCTIVE SQL DETECTED (blocked to prevent data loss):');
    violations.forEach((v) => console.error('  -', v));
    process.exit(1);
  }

  console.info(`OK: Verified ${sqlFiles.length} additive SQL migrations with zero destructive statements.`);
}

main();
