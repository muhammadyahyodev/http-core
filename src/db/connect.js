const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'http_core',
  password: 'my2002',
  port: 5432,
});

module.exports = client;