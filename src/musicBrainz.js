var NB = require('nodebrainz');
var Promise = require("bluebird");
var delayProcess = require("./delayProcess")
var db = require("./db")

// Initialize NodeBrainz
var nb = new NB({userAgent:'my-awesome-app/0.0.1 ( http://my-awesome-app.com )'});
var mbSearch = Promise.promisify(nb.search,nb);


var insert = function(rg,item){
  var artistMbid = rg['artist-credit'][0].artist.id

  console.log("%s - %s : %s mbtitle: %s",item.artist,item.album,rg.score,rg.title);
  console.log("%s ==?== %s",item.artist,rg['artist-credit'][0].artist.name)

  return db("artist_map").insert({
    artist: item.artist,
    mbid: artistMbid,
  }).catch( (e) => console.log(e) )
}

var searchAll = function(items){
  var stats = {
    score100: 0
  }
  var i =0;

  var search = function(item){
    return mbSearch("release-group",{
      artist: item.artist.replace(", The",""),
      releasegroup: item.album.replace(", The","")
    }).then( (res) => {
      console.log(i++,items.length)
      return db("album_map").where({
        artist: item.artist,
        album: item.album,
      }).update({"music_brainz": true})
      .then( () => {
        if(res && res["release-groups"] && res["release-groups"][0]){
          stats.score100++;
          insert(res["release-groups"][0],item)
        }
      })
    }).catch( (err) =>  console.log(err) )
  }

  delayProcess(items,search,1000,2,function(){
    console.log(stats)
  })
}

var searchMissing = function(){
  //get all album/artist where artist doesn't have a mbid mapping
  db.select("album_map.artist","album_map.album")
  .from("album_map").leftJoin("artist_map",{'album_map.artist':'artist_map.artist'})
  .whereNull('artist_map.mbid')
  .andWhere({'music_brainz':false})
  .then( (data) => {
    searchAll(data);
  })
}


module.exports = {
  searchAll: searchAll,
  searchMissing: searchMissing,
}
