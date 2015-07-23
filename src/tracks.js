var db = require("./db");

function convertTrack(track) {
  return {
    title: track.Title,
    artist: track.Artist,
    album: track.Album,
    oid: track.oID,
    didl: track.Didl,
    track_number: track.trackNumber,
  }
}

function convertResources(resources,track_id) {
  return resources.map( (r) => {
    return {
      uri: r.Uri,
      protocol_info: r.ProtocolInfo,
      track_id: id,
    }
  })
}

function insertTracks(data,uuid) {
  return Promise.all(
    data.map( (track) =>
      db('tracks').insert(convertTrack(track))
      .then( (ids) => {
          if(track.resources){
            return db('resources').insert(convertResources(track.resources,ids[0]))
          }
      })
    )
  )
}

//check if we need albums
//check if we need tracks
//check if we need artist images
//check if we need album images

function find(list,check){
  for(var i=0;i<list.length;i++){
    if(check(list[i])){
      return list[i];
    }
  }
}

function getSection(root,name){
  return root.selectionSet.selections.filter( (s) => s.name.value == name)[0]
}

function setupAlbum(albumSection,albumImageType,selectFields,query){
  var defaultAlbumSize = find(albumImageType.args, a => a.name == "size").defaultValue,
      albumImageSection,
      argument,
      tracksSection,
      albumSize;

  if(albumSection){
    selectFields.push('tracks.album')
    albumImageSection = getSection(albumSection,"image");
    tracksSection = getSection(albumSection,"tracks");
  }

  if(albumImageSection){
    selectFields.push('album_images.url as album_url');
    argument = find(albumImageSection.arguments, s => s.name.value == "size");
    albumSize = argument ? argument.value.value : defaultAlbumSize;
    query = query.leftJoin('album_map',{
      'tracks.artist':'album_map.artist',
      'tracks.album':'album_map.album'
      })
      .leftJoin('album_images',{
        'album_map.id':'album_images.album_id',
        'album_images.size':albumSize
      })
  }

  if(tracksSection){
    selectFields.push('tracks.track_number','tracks.title','tracks.id');
  }else{
    query = query.groupBy("tracks.album");
  }
}


//resolveField(exeContext, parentType, sourceValue, fieldASTs);
function getArtists(root,exeContext,parentType,sourceValue,fieldASTs) {
  var albumSection = getSection(sourceValue,"albums"),
      imageSection = getSection(sourceValue,"image"),
      imageType = fieldASTs.ofType._fields.image,
      albumImageType = fieldASTs.ofType._fields.albums.type.ofType._fields.image,
      defaultArtistSize = find(imageType.args, a => a.name == "size").defaultValue,
      selectFields = ['tracks.artist'],
      artistSize,
      tracksSection,
      argument,
      query = db.from("tracks");

  if(exeContext.name){
    query = query.where({'tracks.artist':exeContext.name})
  }

  if(albumSection){
    setupAlbum(albumSection,albumImageType,selectFields,query);
    tracksSection = getSection(albumSection,"tracks");
  }else{
    query = query.groupBy("tracks.artist")
  }

  if(imageSection){
    selectFields.push('artist_images.url as artist_url');
    argument = find(imageSection.arguments, s => s.name.value == "size");
    artistSize = argument ? argument.value.value : defaultArtistSize;
    query = query.leftJoin('artist_map',{
        'tracks.artist':'artist_map.artist'
      })
      .leftJoin('artist_images',{
        'artist_map.id':'artist_images.artist_id',
        'artist_images.size': artistSize
      })
  }

  return query.select(selectFields)
  .orderBy("tracks.artist")
  .orderBy("tracks.album")
  .orderBy("tracks.track_number")
  .then( (data) => {
    var results = [];
    var currentAlbum = {};
    var currentArtist = {};

    data.forEach( (t) => {
      if(currentArtist.artist != t.artist){
        currentAlbum = {};
        currentArtist = {
            artist: t.artist,
            albums: [],
            image: {
              url: t.artist_url
            }

        }
        results.push(currentArtist)
      }
      if(currentAlbum.album != t.album  && albumSection){
        currentAlbum = {
          album: t.album,
          image: {
            url: t.album_url
          },
          tracks: []
        }
        currentArtist.albums.push(currentAlbum);
      }
      if(tracksSection){
        currentAlbum.tracks.push(t);
      }

    })

    return Promise.resolve(results)
  })
}

function getAlbums(root){
  return root.albums;
}

function getTracks(root){
  return root.tracks;
}

function getImage(root){
  if(root.image.url){
    return {
      url: root.image.url
    }
  }else{
    return null;
  }
}

module.exports = {
  insertTracks: insertTracks,
  getTracks: getTracks,
  getAlbums: getAlbums,
  getArtists: getArtists,
  getImage: getImage
}
