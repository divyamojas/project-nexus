import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';
import { open } from 'node:fs/promises';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCHEMA_DIR = path.resolve(__dirname, '..', 'supabase_schema');
const SQL_FILE = path.join(SCHEMA_DIR, 'getSchemaDump.sql');

const SECTION_FILE_MAP = {
  1: 'tables.json',
  2: 'columns.json',
  3: 'constraints.json',
  4: 'indexes.json',
  5: 'triggers.json',
  6: 'views_ddl.json',
  7: 'functions_ddl.json',
  8: 'sequences_ddl.json',
  9: 'current_RLS.json',
};

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

function parseSections(sql) {
  const regex = /\/\*\s*(\d+)\)\s*[^]*?\*\/\s*([\s\S]*?);/g;
  const sections = [];
  let match;

  while ((match = regex.exec(sql)) !== null) {
    const sectionNum = Number(match[1]);
    const query = match[2].trim();

    if (!Number.isFinite(sectionNum)) {
      console.warn(`Skipping unparsable section identifier: ${match[1]}`);
      continue;
    }

    if (!SECTION_FILE_MAP[sectionNum]) {
      console.warn(`No output mapping for section ${sectionNum}; skipping.`);
      continue;
    }

    sections.push({ section: sectionNum, query });
  }

  if (sections.length === 0) {
    throw new Error('No SQL sections parsed.');
  }

  return sections;
}

async function ensureSchemaDir() {
  await fs.mkdir(SCHEMA_DIR, { recursive: true });
}

async function main() {
  await ensureSchemaDir();

  const sql = await fs.readFile(SQL_FILE, 'utf8');
  const sections = parseSections(sql);

  const client = new Client(buildClientConfig());
  const summary = [];

  try {
    await client.connect();

    const ordered = sections.sort((a, b) => a.section - b.section);
    for (const { section, query } of ordered) {
      const targetFile = SECTION_FILE_MAP[section];
      if (!targetFile) continue;

      let rows = [];
      try {
        const result = await client.query(query);
        rows = result.rows ?? [];
      } catch (err) {
        console.error(`Query failed for section ${section}:`, err);
        throw err;
      }

      const outputPath = path.join(SCHEMA_DIR, targetFile);
      await atomicWrite(outputPath, `${JSON.stringify(rows, null, 2)}\n`);
      summary.push({ section, file: targetFile, rows: rows.length });
    }
  } finally {
    await client.end();
  }

  console.log('\nSchema dump complete:');
  console.table(summary.map((row) => ({ Section: row.section, File: row.file, Rows: row.rows })));
}

main().catch((error) => {
  console.error('getSchema failed:', error);
  process.exit(1);
});
