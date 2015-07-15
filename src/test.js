var fm = require("./lastfm");
var db = require("./db");

var fs = require("fs")

//fm.getImages(99999);

db.select("artist","album","url")
.from("album_map")
.join("album_images",{'album_map.id':'album_images.album_id'})
.where({'size':'medium'})
.then(function(data){
  var html = "<html><body><ul>"

  data.forEach( (album) => {
    html += "<li><img src='"+album.url+"'></img>"+album.artist + " " + album.album + "</li>";
  })

  html += "</ul></body></html>"


  fs.writeFile("test.html",html,function(){
    console.log('done')
  })
})
