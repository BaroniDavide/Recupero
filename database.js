const fs = require('fs');
const mysql = require('mysql2');
const { isNativeError } = require('util/types');
let conf = JSON.parse(fs.readFileSync('public/conf.json'));
conf.ssl = {
    ca: fs.readFileSync(__dirname + '/ca.pem')
}
const connection = mysql.createConnection(conf);


const executeQuery = (sql) => {
   return new Promise((resolve, reject) => {      
         connection.query(sql, function (err, result) {
            if (err) {
               console.error(err);
               reject();     
            }   
            console.log('done');
            resolve(result);         
      });
   })
}

const database = {
   createTableType: async() => {
      return await executeQuery(`
         CREATE TABLE IF NOT EXISTS type (
         nomeTodo INT PRIMARY KEY AUTO_INCREMENT,
         name varchar(20)
         )
      `);
    },
    createTableBooking: async() => {
      return await executeQuery(`
         CREATE TABLE IF NOT EXISTS booking (
         nomeTodo int PRIMARY KEY AUTO_INCREMENT,
         nomeTodoType int NOT NULL,
         date DATE NOT NULL,
         hour INT NOT NULL,
         name VARCHAR(50),
         FOREIGN KEY (nomeTodoType) REFERENCES type(nomeTodo) )
      `);
    },

   insert: (book) => {
      //INSERIMENTO ELEMENTO NELLA TABELLA
      let sql = `
         INSERT INTO booking(nomeTodoType, date, hour, name)
         VALUES ('${book.nomeTodoType}', '${book.date}', '${book.hour}', '${book.name}')
           `;
      return executeQuery(sql)
    },

   select: () => {
      const sql = `SELECT nomeTodo, name, nomeTodoType, date, hour FROM booking`;
      return executeQuery(sql);
    },

   selectTips: () => {
      const sql = `SELECT nomeTodo, name FROM type`;
      return executeQuery(sql);
    },

   delete: (nomeTodo) => {
      //ELIMINAZIONE ELEMENTO DALLA TABELLA
      let sql = `
      DELETE FROM booking
      WHERE nomeTodo = $nomeTodo
      `;
      sql = sql.replace('$nomeTodo', nomeTodo)
      return executeQuery(sql);
    }, 

   update: (todo) => {
      //MODIFICARE DOPO
      let sql = `
      UPDATE todo
      SET completed=$COMPLETED
      WHERE nomeTodo=$nomeTodo
         `;
      sql = sql.replace("%nomeTodo", todo.nomeTodo);
      sql = sql.replace("%COMPLETED", todo.completed);
      return executeQuery(sql); 
   },

   cancellaTutto: async () => {
      return executeQuery("TRUNCATE TABLE booking");
   }
}

module.exports = database;