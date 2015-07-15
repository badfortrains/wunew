var Promise = require("bluebird");
var LastFmNode = require('lastfm').LastFmNode;
var config = require("./config")
var delayProcess = require("./delayProcess")
var lastfm = new LastFmNode(config.lastfm);

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

var fmSearch = function(items,delay,max){
  var stats = {
    score100: 0
  }

  var search = function(item){
    return fmInfo("album",{
      artist: item.artist.replace(", The",""),
      album: item.album.replace(", The","")
    }).then( (res) => {
      if(res && res.album){
        console.log(res.album.name);
        stats.score100++;
      }
    }).catch( (err) =>  {
      console.log("got err",err)
    })
  }

  delayProcess(items,search,200,5,function(){
    console.log(stats)
  })
}

module.exports = fmSearch;
