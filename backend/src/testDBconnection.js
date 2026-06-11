require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

console.log('🔄 Connecting to the Supabase cloud database...');

client.connect()
  .then(() => {
    console.log('✅ Success! Your computer connected to the live database perfectly.');
    return client.end();
  })
  .catch(err => {
    console.error('❌ Connection failed!');
    console.error(err.message);
  });