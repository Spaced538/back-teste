const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL + "?sslmode=require",
});


module.exports = {
    pool,
};
