
exports.up = function(knex) {
  return knex.schema.createTable('contacts', table => {
      table.bigIncrements('id');
      table.string('name');
      table.string('address');
      table.string('department');
      table.text('message');
      table.timestamp('createdAt').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('contacts', table => {
      
  })
};
