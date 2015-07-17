var fm = require("./lastfm");
var mb = require("./musicBrainz");
var db = require("./db");

var fs = require("fs")

fm.getImages(999999)
.then(mb.searchMissing)
.then(fm.getArtistImages)
.then( () => console.log("done getting images"))

//mb.searchMissing();

//fm.getImages(99999);

//fm.getArtistImages();

// db.select("artist","album","url")
// .from("album_map")
// .join("album_images",{'album_map.id':'album_images.album_id'})
// .where({'size':'medium'})
// .then(function(data){
//   var html = "<html><body><ul>"
//
//   data.forEach( (album) => {
//     html += "<li><img src='"+album.url+"'></img>"+album.artist + " " + album.album + "</li>";
//   })
//
//   html += "</ul></body></html>"
//
//
//   fs.writeFile("test.html",html,function(){
//     console.log('done')
//   })
// })


// SELECT tracks.artist,t.url from
// tracks left join
// (select url,artist from artist_images join artist_map on artist_images.artist_id=artist_map.id where size='small') as t
// on tracks.artist = t.artist
// group by tracks.artist;


// db.select("tracks.artist","t.url")
// .from('tracks')
// .leftJoin(function(){
//   this.select('url','artist')
//   .from('artist_images')
//   .join('artist_map',{'artist_images.artist_id':'artist_map.id'})
//   .where({'size':'small'})
//   .as('t');
// },{'t.artist':'tracks.artist'})
// .groupBy('tracks.artist')
// .then(function(data){
//   var html = "<html><body><ul>"
//
//   data.forEach( (artist) => {
//     html += "<li><img src='"+artist.url+"'></img>"+artist.artist + " </li>";
//   })
//
//   html += "</ul></body></html>"
//
//
//   fs.writeFile("test.html",html,function(){
//     console.log('done')
//   })
// })
