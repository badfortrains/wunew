var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: "./dev.sqlite3"
  }
});

knex.raw("PRAGMA synchronous = OFF")
.then( (resp) => console.log(resp) )
.catch( (err) => console.log(err) )

knex.raw("PRAGMA journal_mode = MEMORY")
.then( (resp) => console.log(resp) )
.catch( (err) => console.log(err) )

module.exports = knex;
