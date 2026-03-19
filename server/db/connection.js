const mysql = require('mysql2/promise');
const { Pool } = require('pg');

let db = null;
let dbType = null;

async function connect(config) {
  const { type, host, port, user, password, database } = config;

  if (type === 'mysql') {
    db = await mysql.createPool({ host, port: port || 3306, user, password, database, waitForConnections: true });
    dbType = 'mysql';
  } else if (type === 'postgres') {
    db = new Pool({ host, port: port || 5432, user, password, database });
    dbType = 'postgres';
  } else {
    throw new Error('Unsupported database type. Use "mysql" or "postgres".');
  }

  await ensureTables();
  return { success: true };
}

async function query(sql, params = []) {
  if (!db) throw new Error('No database connected.');

  if (dbType === 'mysql') {
    const [rows] = await db.execute(sql, params);
    return rows;
  } else {
    // Convert MySQL-style ? placeholders to PostgreSQL $1, $2, ...
    let i = 0;
    const pgSql = sql.replace(/\?/g, () => `$${++i}`);
    const result = await db.query(pgSql, params);
    return result.rows;
  }
}

async function ensureTables() {
  const autoInc = dbType === 'mysql' ? 'INT PRIMARY KEY AUTO_INCREMENT' : 'SERIAL PRIMARY KEY';
  const boolDefault = dbType === 'mysql' ? 'BOOLEAN DEFAULT true' : 'BOOLEAN DEFAULT true';

  await query(`
    CREATE TABLE IF NOT EXISTS participants (
      id ${autoInc},
      name VARCHAR(255) NOT NULL,
      avatar_url VARCHAR(500),
      active ${boolDefault},
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  // Migration: add avatar_url to existing tables that predate this column
  try {
    await query('ALTER TABLE participants ADD COLUMN avatar_url VARCHAR(500)');
  } catch {}

  await query(`
    CREATE TABLE IF NOT EXISTS daily_notes (
      id ${autoInc},
      participant_id INT,
      note_date DATE NOT NULL,
      note_text TEXT NOT NULL,
      status VARCHAR(12) DEFAULT 'final',
      form_data TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  // Migrations for tables that predate these columns
  try { await query("ALTER TABLE daily_notes ADD COLUMN status VARCHAR(12) DEFAULT 'final'"); } catch {}
  try { await query('ALTER TABLE daily_notes ADD COLUMN form_data TEXT'); } catch {}
}

function isConnected() {
  return db !== null;
}

module.exports = { connect, query, isConnected };
