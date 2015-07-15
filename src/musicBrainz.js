var NB = require('nodebrainz');
var Promise = require("bluebird");
var delayProcess = require("./delayProcess")

// Initialize NodeBrainz
var nb = new NB({userAgent:'my-awesome-app/0.0.1 ( http://my-awesome-app.com )'});
var mbSearch = Promise.promisify(nb.search,nb);


var searchAll = function(items,delay,max){
  var stats = {
    score100: 0
  }

  var search = function(item){
    return mbSearch("release-group",{
      artist: item.artist.replace(", The",""),
      releasegroup: item.album.replace(", The","")
    }).then( (res) => {
      if(res && res["release-groups"] && res["release-groups"][0]){
        stats.score100++;
        console.log(res["release-groups"][0].title)
        console.log(res["release-groups"][0].score)
      }else{
        console.log(res);
      }
    }).catch( (err) =>  console.log(err) )
  }

  delayProcess(items,search,1000,2,function(){
    console.log(stats)
  })
}

module.exports = searchAll;
