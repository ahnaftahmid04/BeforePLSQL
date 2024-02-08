const Pool = require('pg').Pool

const pool = new Pool({
    user: "postgres",
    password: "dUnE1183",
    host: "localhost",
    port: 5432,
    database: "social"
});

module.exports = pool;