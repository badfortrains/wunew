var NB = require('nodebrainz');
var Promise = require("bluebird");
var delayProcess = require("./delayProcess")
var db = require("./db")
var logger = require("./logger").child({
  scope: 'images.mb'
})

// Initialize NodeBrainz
var nb = new NB({userAgent:'my-awesome-app/0.0.1 ( http://my-awesome-app.com )'});
var mbSearch = Promise.promisify(nb.search,nb);


var insert = function(rg,item){
  var artistMbid = rg['artist-credit'][0].artist.id

  logger.trace({action: 'insert artist_map',item: item, rg: rg})

  return db("artist_map").insert({
    artist: item.artist,
    mbid: artistMbid,
  }).catch( (e) => {
    //ignore unique constraint errors
    if(e.errno != 19){
      logger.warn({action: 'insert artsit_map',error: e})
    }
  })
}

var searchAll = function(items){
  var search = function(item){
    return mbSearch("release-group",{
      artist: item.artist.replace(", The",""),
      releasegroup: item.album.replace(", The","")
    }).then( (res) => {
      return db("album_map").where({
        artist: item.artist,
        album: item.album,
      }).update({"music_brainz": true})
      .then( () => {
        if(res && res["release-groups"] && res["release-groups"][0]){
          insert(res["release-groups"][0],item)
        }
      })
    }).catch( (err) =>  logger.warn({action:'search', error: err, item: item}) )
  }

  return delayProcess(items,search,1000,2);
}

var searchMissing = function(){
  //get all album/artist where artist doesn't have a mbid mapping
  return db.select("album_map.artist","album_map.album")
  .from("album_map").leftJoin("artist_map",{'album_map.artist':'artist_map.artist'})
  .whereNull('artist_map.mbid')
  .andWhere({'album_map.music_brainz':false})
  .then( (data) => {
    logger.info({action:'searchMissing',length: data.length})
    return searchAll(data)
  })
}


module.exports = {
  searchAll: searchAll,
  searchMissing: searchMissing,
}
