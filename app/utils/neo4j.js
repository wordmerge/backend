const Neo4j = require('neo4j'),
      
      username = process.env.DB_NEO4J_USER,
      password = process.env.DB_NEO4J_PASS,
      host = process.env.DB_NEO4J_HOST,
      port = process.env.DB_NEO4J_PORT,
      
      GraphDB = new Neo4j.GraphDatabase(
        `http://${username}:${password}@${host}:${port}`
      );


/**
* Runs a provided query/param combination against 
*   Neo4JS. For more information, please consult - 
*   https://github.com/thingdom/node-neo4j/tree/v2
* @param {Object} {query:string, params:dict}
* @returns {Promise}
*   neo4j result on SUCCESS, Error otherwise
*/
function query({query, params={}}) {
  return new Promise((resolve, reject) => {
    if (!query) {
      reject(new Error("Query required"));
      return;
    }
    
    GraphDB.cypher({query, params}, (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve(results);
    });
  });
}

exports.query = query;
