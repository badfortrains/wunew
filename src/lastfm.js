var Promise = require("bluebird");
var LastFmNode = require('lastfm').LastFmNode;
var config = require("./config")
var delayProcess = require("./delayProcess")
var lastfm = new LastFmNode(config.lastfm);
var db = require("./db")
var logger = require("./logger").child({
  scope: 'images.lastfm'
})

var fmInfo = function(type,options){
  options = options || {};
  return new Promise(function(resolve,reject){
    options.handlers = {
      success: (data) => resolve(data),
      error: (err) => reject(err)
    }
    logger.trace({action: 'fmInfo',options:options, type: type})
    lastfm.request(type+".getInfo",options);
  })
}

var insertImages = function(foreignKey,item,type){
  Promise.all( item.image.filter( (i) => i["#text"] != '').map( (i) => {
    var fields = {
      size: i.size,
      url: i["#text"],
      mbid: item.mbid,
      [`${type}_id`]: foreignKey,
    }

    logger.trace({action: 'insertImage',options: fields, type:type})
    return db(`${type}_images`).insert(fields)
  }))
}

var fixName = function(name){
  var parts = /(.+), (The|Das)$/.exec(name);
  if(parts){
    return parts[2] + " " + parts[1];
  }else{
    return name;
  }
}

var insertFm = function(album,item){
  try{
    //May not have tracks so could throw
    var artistMbid = album.tracks.track.filter( (t) => t.artist.mbid)[0].artist.mbid;
    if(artistMbid){
      logger.trace({action:"inser artist map",options: item});
      db("artist_map").insert({
        artist: item.artist,
        mbid: artistMbid,
      }).catch( (e) => {
          //ignore unique constraint errors
          if(e.errno != 19){
            console.log(e);
            logger.warn({action: 'insertfm',error: e})
          }
      })
    }
  }catch(e){
    //ignore
  }

  logger.trace({action:"inser album map",options: item});
  return db("album_map").insert({
    album: item.album,
    artist: item.artist,
    mbid: album.mbid,
    fmid: album.id,
    last_fm: true,
  }).then( (ids) => insertImages(ids[0],album,'album'));
}

var fmSearch = function(items,delay,max){
  var stats = {
    score100: 0
  }

  var search = function(item){
    return fmInfo("album",{
      artist: fixName(item.artist),
      album: fixName(item.album),
      autocorrect: 1,
    }).then( (res) => {
      if(res && res.album){
        stats.score100++;
        return insertFm(res.album,item)
      }
    }).catch( (err) =>  {
      //album not found
      if(err.error == 6){
        insertFm({image:[]},item);
      }else{
        logger.warn({action: "fmSeach",option: item})
      }
    })
  }

  return delayProcess(items,search,delay,max)
}

var getImages = function(limit){
  return db.select("tracks.artist","tracks.album",'fmid','album_map.last_fm')
  .groupBy("tracks.album")
  .from("tracks")
  .leftJoin('album_map',{'tracks.artist':'album_map.artist','tracks.album':'album_map.album'})
  .whereNull("fmid")
  .limit(limit)
  .then( (data) => data.filter( (d) => d.last_fm != true) )
  .then( (data) => {
    logger.info({action:"get album images",length: data.length})
    return fmSearch(data,20,20)
  })
}

var getArtistImages = function(){
  var getImage = function(item){
    return fmInfo("artist",{
      mbid: item.mbid
    }).then( (res) => {
      return insertImages(item.id,res.artist,'artist')
    })
  }

  return db.select("mbid","id").from("artist_map")
  .whereNotNull("mbid")
  .andWhere({'last_fm':false})
  .then( (data) => {
    logger.info({action:"get artist images",length: data.length})
    return delayProcess(data,getImage,20,20)
  }).then( () => {
    return db("artist_map").update({'last_fm': true}).whereNotNull("mbid")
  })
}


// fmInfo("album",{
//   artist: "The Tallest Man on Earth",
//   album: "Write About Love",
//   autocorrect: 1,
// }).then(function(d){
//   console.log(d);
//   d.album.tracks.track.forEach( (t) => console.log(t.artist.name,t.artist.mbid))
// })


module.exports = {
  search: fmSearch,
  getImages: getImages,
  getArtistImages: getArtistImages,
}
