const { Pool } = require('pg');
const {
  DB_DATABASE,
  DB_HOST,
  DB_PASSWORD,
  DB_PORT,
  DB_USER
} = require('../config.js');

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_DATABASE,
  password: DB_PASSWORD,
  port: DB_PORT,
});

pool.on('connect', () => {
  console.log('Connected to the database successfully!');
});

module.exports = pool;
