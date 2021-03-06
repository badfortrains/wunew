
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('artist_map').then(function(exists) {
      if (!exists) {
        return knex.schema.createTable('artist_map', function(t) {
          t.increments('id').primary();
          t.string('artist', 100).unique().index();
          t.string('mbid',100).unique().index();
          t.boolean("last_fm").defaultTo(false)
          t.boolean("music_brainz").defaultTo(false)
        });
      }
    }),
    knex.schema.hasTable('album_map').then(function(exists) {
      if (!exists) {
        return knex.schema.createTable('album_map', function(t) {
          t.increments('id').primary();
          t.string('artist', 100)
          t.string('album',100)
          t.string('mbid',100).index();
          t.string('fmid',100).index();
          t.boolean("last_fm").defaultTo(false)
          t.boolean("music_brainz").defaultTo(false)

          knex.schema.raw("CREATE INDEX album_artist ON album_map(artist,album)")
        });
      }
    }),
    knex.schema.hasTable('album_images').then(function(exists) {
      if (!exists) {
        return knex.schema.createTable('album_images', function(t) {
          t.increments('id').primary();
          t.integer('album_id').references('id').inTable('album_map')
          t.string('mbid', 100).index();
          t.string('size', 100);
          t.string("url",100);
        });
      }
    }),
    knex.schema.hasTable('artist_images').then(function(exists) {
      if (!exists) {
        return knex.schema.createTable('artist_images', function(t) {
          t.increments('id').primary();
          t.integer('artist_id').references('id').inTable('artist_map')
          t.string('mbid', 100).index();
          t.string('size', 100);
          t.string("url",100);
        });
      }
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("artist_map")
          .then(function(){
            return knex.schema.dropTableIfExists("album_map");
          })
          .then(function(){
            return knex.schema.dropTableIfExists("album_images");
          })
          .then(function(){
            return knex.schema.dropTableIfExists("artist_images");
          })

};
