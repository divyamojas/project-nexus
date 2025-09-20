import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';
import { open } from 'node:fs/promises';
import { Client } from 'pg';
import getSchema from './getSchema.js';
import dotenv from 'dotenv';

dotenv.config();

const DUPLICATE_ERROR_CODES = new Set([
  '42701', // duplicate_column
  '42710', // duplicate_object
  '42711', // duplicate_object
  '42712', // duplicate_alias
  '42723', // duplicate_function
  '42P04', // duplicate_database
  '42P06', // duplicate_schema
  '42P07', // duplicate_table
]);

const MISSING_OBJECT_CODES = new Set([
  '42703', // undefined_column
  '42704', // undefined_object
  '42P01', // undefined_table
  '42P02', // undefined_parameter
  '42P03', // duplicate_cursor (rare; treat as non-fatal for DROPs)
]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCHEMA_DIR = path.resolve(__dirname, '..', 'supabase_schema');
const UPDATE_SQL_PATH = path.join(SCHEMA_DIR, 'update.sql');

function buildClientConfig() {
  const url = process.env.SUPABASE_DB_URL;
  const shouldRequireSSL =
    (process.env.SUPABASE_DB_SSL || '').toLowerCase() === 'require' ||
    (url && url.includes('sslmode=require'));

  if (url) {
    return {
      connectionString: url,
      ssl: shouldRequireSSL ? { rejectUnauthorized: false } : undefined,
    };
  }

  const {
    SUPABASE_DB_HOST,
    SUPABASE_DB_PORT,
    SUPABASE_DB_DATABASE,
    SUPABASE_DB_USER,
    SUPABASE_DB_PASSWORD,
  } = process.env;

  if (!SUPABASE_DB_HOST) {
    throw new Error('Database connection info missing. Set SUPABASE_DB_URL or host credentials.');
  }

  return {
    host: SUPABASE_DB_HOST,
    port: SUPABASE_DB_PORT ? Number(SUPABASE_DB_PORT) : 5432,
    database: SUPABASE_DB_DATABASE,
    user: SUPABASE_DB_USER,
    password: SUPABASE_DB_PASSWORD,
    ssl: shouldRequireSSL ? { rejectUnauthorized: false } : undefined,
  };
}

async function atomicWrite(filePath, data) {
  const tmpPath = `${filePath}.tmp`;
  const handle = await open(tmpPath, 'w');
  try {
    await handle.writeFile(data, 'utf8');
    await handle.sync();
  } finally {
    await handle.close();
  }
  await fs.rename(tmpPath, filePath);
}

function splitSQLStatements(sql) {
  const statements = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let inLineComment = false;
  let inBlockComment = false;
  let dollarTag = null;

  const length = sql.length;
  for (let i = 0; i < length; i += 1) {
    const char = sql[i];
    const next = i + 1 < length ? sql[i + 1] : '';

    if (inLineComment) {
      current += char;
      if (char === '\n') {
        inLineComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      current += char;
      if (char === '*' && next === '/') {
        current += next;
        i += 1;
        inBlockComment = false;
      }
      continue;
    }

    if (dollarTag) {
      if (sql.startsWith(dollarTag, i)) {
        current += dollarTag;
        i += dollarTag.length - 1;
        dollarTag = null;
      } else {
        current += char;
      }
      continue;
    }

    if (inSingle) {
      current += char;
      if (char === "'" && next === "'") {
        current += next;
        i += 1;
      } else if (char === "'") {
        inSingle = false;
      }
      continue;
    }

    if (inDouble) {
      current += char;
      if (char === '"' && next === '"') {
        current += next;
        i += 1;
      } else if (char === '"') {
        inDouble = false;
      }
      continue;
    }

    if (char === '-' && next === '-') {
      current += char + next;
      i += 1;
      inLineComment = true;
      continue;
    }

    if (char === '/' && next === '*') {
      current += char + next;
      i += 1;
      inBlockComment = true;
      continue;
    }

    if (char === '$') {
      const match = sql.slice(i).match(/^\$[A-Za-z0-9_]*\$/);
      if (match) {
        const tag = match[0];
        current += tag;
        i += tag.length - 1;
        dollarTag = tag;
        continue;
      }
    }

    if (char === "'") {
      inSingle = true;
      current += char;
      continue;
    }

    if (char === '"') {
      inDouble = true;
      current += char;
      continue;
    }

    if (char === ';') {
      const stmt = current.trim();
      if (stmt) {
        statements.push(stmt);
      }
      current = '';
      continue;
    }

    current += char;
  }

  const trailing = current.trim();
  if (trailing) {
    statements.push(trailing);
  }

  return statements;
}

function summarizeStatement(statement) {
  const lines = statement
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  return lines[0] || statement.slice(0, 80);
}

function shouldIgnoreError(error, statement) {
  if (!error || !error.code) {
    return false;
  }

  const normalized = statement.trim().toUpperCase();
  const code = error.code;

  if (DUPLICATE_ERROR_CODES.has(code)) {
    return true;
  }

  if (MISSING_OBJECT_CODES.has(code)) {
    if (normalized.startsWith('DROP')) {
      return true;
    }

    if (normalized.startsWith('ALTER TABLE') && normalized.includes('DROP COLUMN')) {
      return true;
    }

    if (normalized.startsWith('ALTER TABLE') && normalized.includes('DROP CONSTRAINT')) {
      return true;
    }

    if (normalized.startsWith('ALTER TABLE') && normalized.includes('DROP INDEX')) {
      return true;
    }
  }

  return false;
}

function logIgnoredError(error, statement) {
  const summary = summarizeStatement(statement);
  const details = error?.message?.split('\n')?.[0] ?? 'No error message';
  const code = error?.code ?? 'N/A';
  console.warn(`Skipping statement (${code}): ${summary}`);
  console.warn(`  ↳ ${details}`);
}

async function runUpdateSQL(client, sql) {
  const trimmed = sql.trim();
  if (!trimmed) {
    console.log('update.sql is empty, skipping database update.');
    return { success: true, executedCount: 0 };
  }

  const statements = splitSQLStatements(trimmed);

  console.log(`Executing ${statements.length} SQL statement(s)...`);
  for (let idx = 0; idx < statements.length; idx += 1) {
    const statement = statements[idx];
    try {
      await client.query(statement);
    } catch (error) {
      if (shouldIgnoreError(error, statement)) {
        logIgnoredError(error, statement);
        continue;
      }

      console.error('Failed statement:', statement);
      return {
        success: false,
        error,
        failedStatement: statement,
        remainingStatements: statements.slice(idx),
      };
    }
  }

  return { success: true, executedCount: statements.length };
}

async function main() {
  await fs.mkdir(SCHEMA_DIR, { recursive: true });
  const client = new Client(buildClientConfig());

  try {
    await client.connect();

    let sql = '';
    try {
      sql = await fs.readFile(UPDATE_SQL_PATH, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn('update.sql not found; nothing to apply.');
      } else {
        throw error;
      }
    }

    let effectiveSql = sql || '';
    const superAdminEmail = process.env.SUPABASE_SUPER_ADMIN_EMAIL;
    const placeholder = '{{SUPABASE_SUPER_ADMIN_EMAIL}}';

    if (effectiveSql.includes(placeholder)) {
      if (!superAdminEmail) {
        throw new Error('SUPABASE_SUPER_ADMIN_EMAIL must be set to apply update.sql');
      }
      effectiveSql = effectiveSql.replace(new RegExp(placeholder, 'g'), superAdminEmail);
    }

    const result = await runUpdateSQL(client, effectiveSql);

    if (!result.success) {
      if (result.remainingStatements && result.remainingStatements.length > 0) {
        let remainingSql = result.remainingStatements
          .map((statement) => `${statement};`)
          .join('\n\n');

        if (superAdminEmail) {
          const emailPattern = superAdminEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          remainingSql = remainingSql.replace(new RegExp(emailPattern, 'g'), placeholder);
        }

        await atomicWrite(UPDATE_SQL_PATH, `${remainingSql}\n`);
      }

      throw result.error;
    }

    // Refresh schema JSON files
    await getSchema({ silent: true });

    // Reset update.sql
    await atomicWrite(UPDATE_SQL_PATH, '');

    console.log('Database update complete. Schema snapshots refreshed.');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('updateDB failed:', error);
  process.exit(1);
});
