const mysql = require("mysql2");
const db_config = require("./config/db_config.json");

const pool = mysql.createPool({
  host: db_config.MYSQL_HOST,
  user: db_config.MYSQL_USER,
  database: db_config.MYSQL_DATABASE,
  password: db_config.MYSQL_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
});

const connection = pool.promise();

module.exports = connection;
