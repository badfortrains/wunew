var mw = require("mediaWatcher");
var tracks = require("./tracks");

var KNOWN_PATHS ={
      "7076436f-6e65-1063-8074-4ce6766160b7" : "1$268435466",   //Linkstation
}

mw.on("serverAdded",function(ev){
  if(KNOWN_PATHS[ev.uuid]){
    console.log("get tracks")
    mw.getTracks(ev.uuid,KNOWN_PATHS[ev.uuid],function(err,data){
      console.log("insert tracks",err)
      if(!err){
        tracks.insertTracks(data)
        .then( () => console.log("tracks inserted"))
        .catch( (e) => console.log(e))
      }
    })
  }
})
