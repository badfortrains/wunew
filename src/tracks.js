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


module.exports = {
  insertTracks: insertTracks
}
