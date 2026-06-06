const pool = require('./config/database');

async function testConnection() {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('Database Connected Successfully :-)');
        console.log(result.rows[0]);
    } catch (error) {
        console.error('DB Connection Error', error);
    }
}

testConnection();