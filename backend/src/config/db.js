const { setDefaultResultOrder } = require('dns');
setDefaultResultOrder('ipv4first');

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
    console.log('📦 Database pool connected to Supabase cleanly!');
});

pool.on('error', (err) => {
    console.error('Unexpected database pool error:', err);
});

module.exports = pool;
