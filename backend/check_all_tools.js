import dotenv from 'dotenv';
dotenv.config();

import AppDataSource from './config/db.js';

async function check() {
  try {
    await AppDataSource.initialize();
    const res = await AppDataSource.query('SELECT * FROM herramientas');
    console.log('ALL TOOLS:');
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await AppDataSource.destroy();
  }
}

check();
