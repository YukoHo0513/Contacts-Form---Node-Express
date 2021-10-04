// Update with your config settings.

module.exports = {

  development: {
    client: 'pg',
    connection: {
      database: 'contact_db'
    },
    migrations: {
      tableName: "migrations",
      directory: "db/migrations"
    }
  }

};
