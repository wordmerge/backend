const Postgres = require('pg'),
      
      db = process.env.DB_POSTGRES_DB,
      username = process.env.DB_POSTGRES_USER,
      password = process.env.DB_POSTGRES_PASS,
      host = process.env.DB_POSTGRES_HOST,
      port = process.env.DB_HOSTGRES_PORT,
      
      PostgresPool = new Postgres.Pool({
        database: db,
        user: username,
        password: password,
        host: host,
        port: port,
        max: 10,
        idleTimeoutMillis: 20000
      });


/**
* Runs a provided query/param combination against 
*   PostgresSQL. For more information on accepted queries 
*   and outputs, please consult - 
*   https://github.com/brianc/node-postgres/wiki/
* @param {Object} {query:string, params:[]?}
* @returns {Promise} 
*   node-postgres' result on SUCCESS, error otherwise
*/
function query({query, params=[]}) {
  return new Promise((resolve, reject) => {
    // param:query type check
    if (!query) {
      reject(new Error("Query required"));
    }
    else if (typeof query !== "string") {
      reject(new Error("Query is a string"));
    }
    
    // param:params type check 
    if (params && params.constructor !== Array) {
      reject(new Error("Params is a list"))
    }
    
    PostgresPool.connect((err, client, done) => {
      if (err) {
        reject(err);
        return;
      }
      
      client.query(query, params, (err, result) => {
        done();
        
        if (err) {
          reject(err);
          return;
        }
        
        resolve(result);
      });
    });
    
    PostgresPool.on('error', (err) => {
      console.error('Postgres Pool Error: ', err.message, err.stack);
    });
  });
}

exports.query = query;
