var Promise = require("bluebird");
var LastFmNode = require('lastfm').LastFmNode;
var config = require("./config")
var delayProcess = require("./delayProcess")
var lastfm = new LastFmNode(config.lastfm);
var db = require("./db")

var fmInfo = function(type,options){
  options = options || {};
  return new Promise(function(resolve,reject){
    options.handlers = {
      success: (data) => resolve(data),
      error: (err) => reject(err)
    }
    lastfm.request(type+".getInfo",options);
  })
}

var insertImages = function(albumId,album){
  Promise.all( album.image.map( (i) => {
    return db("album_images").insert({
      size: i.size,
      url: i["#text"],
      mbid: album.mbid,
      album_id: albumId,
    })
  }))
}

var insertFm = function(album,item){
  return db("album_map").insert({
    album: item.album,
    artist: item.artist,
    mbid: album.mbid,
    fmid: album.id,
  }).then( (ids) => insertImages(ids[0],album));
}

var fmSearch = function(items,delay,max){
  var stats = {
    score100: 0
  }

  var i = 0;
  var search = function(item){
    console.log(i++)
    return fmInfo("album",{
      artist: item.artist.replace(", The",""),
      album: item.album.replace(", The","")
    }).then( (res) => {
      if(res && res.album){
        stats.score100++;
        return insertFm(res.album,item)
      }
    }).catch( (err) =>  {
      console.log("got err",err)
    })
  }

  delayProcess(items,search,50,20,function(){
    console.log(stats)
  })
}

var getImages = function(limit){
  db.select("tracks.artist","tracks.album",'fmid')
  .groupBy("tracks.album")
  .from("tracks")
  .leftJoin('album_map',{'tracks.artist':'album_map.artist','tracks.album':'album_map.album'})
  .whereNull("fmid")
  .limit(limit)
  .then(function(data){
    fmSearch(data,500,2);
  })
}



module.exports = {
  search: fmSearch,
  getImages: getImages
}
