const mysql = require('mysql');

const pool = mysql.createPool({
connectionLimit: 10,
host: 'localhost',
user: 'root',
password: '',
database: 'test',
port: '3306'
});


let db = {}

db.all = () => {
 
  return new Promise( (resolve, reject) => {
    pool.query("SELECT * FROM test", (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });

}

module.exports = db;