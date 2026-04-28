const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'fgk59efg4f',
  port: 5432,
});
client.connect().then(async () => {
  const res = await client.query("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position");
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}).catch(console.error);
