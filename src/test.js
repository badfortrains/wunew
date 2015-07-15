var fmSeach = require("./lastfm");
var db = require("./db");


db.select("artist","album").groupBy("album").limit(100).from("tracks").then(function(data){
  fmSeach(data,500,2);
})
