var express = require('express');
var app = express();
var bodyParser = require('body-parser');

import { TrackSchema } from './schema.js';
import { graphql } from 'graphql';


app.use(express.static('app/public'));
app.use(express.static('app'));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.sendFile('index.html',{
    root: __dirname + '/../app/public/'
  });
});

app.post("/api/graphql", function(req,res){
  graphql(TrackSchema,req.body.query)
  .then( (data) => res.send(data))
  .catch( (err) => res.send(err) )
})

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

// var mw = require("mediaWatcher");
// var tracks = require("./tracks");
//
// var KNOWN_PATHS ={
//       "7076436f-6e65-1063-8074-4ce6766160b7" : "1$268435466",   //Linkstation
// }
//
// mw.on("serverAdded",function(ev){
//   if(KNOWN_PATHS[ev.uuid]){
//     console.log("get tracks")
//     mw.getTracks(ev.uuid,KNOWN_PATHS[ev.uuid],function(err,data){
//       console.log("insert tracks",err)
//       if(!err){
//         tracks.insertTracks(data)
//         .then( () => console.log("tracks inserted"))
//         .catch( (e) => console.log(e))
//       }
//     })
//   }
// })
