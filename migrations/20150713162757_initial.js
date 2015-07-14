
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('tracks').then(function(exists) {
      if (!exists) {
        return knex.schema.createTable('tracks', function(t) {
          t.increments('id').primary();
          t.string('title', 100).index();
          t.string('artist', 100);
          t.string('album',100).index();
          t.string('didl',300);
          t.string('oid',300);
          t.string('server',100);
          t.integer('track_number');

          knex.schema.raw("CREATE  UNIQUE INDEX unique_tracks ON tracks(artist,album,title)")
        });
      }
    }),
    knex.schema.hasTable('resources').then(function(exists) {
      if (!exists) {
        return knex.schema.createTable('resources', function(t) {
          t.increments('id').primary();
          t.string('uri', 100).index();
          t.string('protocol_info', 100);
          t.string('track_id',100).index();
        });
      }
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("tracks").
          then(function(){
            return knex.schema.dropTableIfExists("resources");
          })
};
