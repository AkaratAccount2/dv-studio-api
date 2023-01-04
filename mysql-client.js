const mysql = require("mysql2/promise");
const logger = require("./config/winston")(__filename);
const baseconfig = require("./config/config");

async function main() {
  try {
    pool = await mysql.createPool({
      connectionLimit: 80,
      acquireTimeout: 120000,
      conneectionTimeout: 120000,
      host: baseconfig.mysql_host, // process.env.DB_HOST, //baseconfig.mysql_host, //'172.17.0.1',
      port: baseconfig.mysql_port,
      user: baseconfig.mysql_user,
      password: baseconfig.mysql_password,
      database: baseconfig.mysql_database,
      ssl: {
        // DO NOT DO THIS
        // set up your ca correctly to trust the connection
        rejectUnauthorized: false,
      },
    });
    return pool;
  } catch (error) {
    console.log("[MYSQL] create pool -> failed");
    console.error(error);
    return undefined;
  }
}

var pool = main();

var getConnection = async () => {
  let connection = await pool.getConnection();
  return connection;
  // return new Promise(resolve => {
  // });
};
module.exports = getConnection;

// const [rows] = await connection.query('SELECT * FROM users');
// console.log(rows);
// connection.end();

// var getConnection = function(callback) {
//     pool.getConnection(function(err, connection) {
//         console.log("[MYSQL] pool.connect -> getConnnection")
//         callback(err, connection);
//         // connection.query("SELECT * FROM food_sites", function(err, rows, fields) {
//         //     // Connection is automatically released when query resolves
//         //     callback(err, rows);
//         //  })
//     });
// };
