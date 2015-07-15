var NB = require('nodebrainz');
var db = require("./db");
var Promise = require("bluebird");

// Initialize NodeBrainz
var nb = new NB({userAgent:'my-awesome-app/0.0.1 ( http://my-awesome-app.com )'});

var mbSearch = Promise.promisify(nb.search,nb);

var processQueue = function(items,func,delay,max,done){
  var index = 0,
      active = 0,
      lastSearch = Date.now(),
      timer;

  function queueItem(){
    if(active < max && lastSearch + delay < Date.now() && index < items.length){
      func(items[index]).finally( () => active-- )
      index++;
      active++;
      lastSearch = Date.now();
    }

    if(active == 0 && index >= items.length){
      clearInterval(timer);
      done && done();
      console.log("donezo")
    }
  }

  timer = setInterval(queueItem,delay)
}

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

  processQueue(items,search,1000,2,function(){
    console.log(stats)
  })
}


db.select("artist","album").groupBy("album").limit(100).from("tracks").then(function(data){
  searchAll(data,500,2);
})
