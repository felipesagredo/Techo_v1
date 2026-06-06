import dotenv from 'dotenv';
dotenv.config();

import pool from './config/db.js';

async function check() {
  try {
    const res = await pool.query('SELECT * FROM herramientas');
    console.log('ALL TOOLS:');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await pool.end();
  }
}

check();
