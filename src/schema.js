
import {
  GraphQLEnumType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';


import {
  getTracks,
  getAlbums,
  getArtists,
  getImage
} from './tracks'



/**
 * Using our shorthand to describe type systems, the type system for our

 type Artist{
   id: String!
   name: String
   albums: [Album]
   image: Image
 }

 type Album {
   id: String!
   name: String
   tracks: [Track]
   artistName: String
   image: Image
 }

 type Track{
   id: String!
   name: String
   albumName: String
   artistName: String
   trackNumber: Int
 }

 type Image{
   size: String!
   url: String!
 }

 */
// var episodeEnum = new GraphQLEnumType({
//   name: 'Episode',
//   description: 'One of the films in the Star Wars Trilogy',
//   values: {
//     NEWHOPE: {
//       value: 4,
//       description: 'Released in 1977.',
//     },
//     EMPIRE: {
//       value: 5,
//       description: 'Released in 1980.',
//     },
//     JEDI: {
//       value: 6,
//       description: 'Released in 1983.',
//     },
//   }
// });

/**
 * Characters in the Star Wars trilogy are either humans or droids.
 *
 * This implements the following type system shorthand:
 *   interface Character {
 *     id: String!
 *     name: String
 *     friends: [Character]
 *     appearsIn: [Episode]
 *   }
 */
// var characterInterface = new GraphQLInterfaceType({
//   name: 'Character',
//   description: 'A character in the Star Wars Trilogy',
//   fields: () => ({
//     id: {
//       type: new GraphQLNonNull(GraphQLString),
//       description: 'The id of the character.',
//     },
//     name: {
//       type: GraphQLString,
//       description: 'The name of the character.',
//     },
//     friends: {
//       type: new GraphQLList(characterInterface),
//       description: 'The friends of the character, or an empty list if they ' +
//                    'have none.',
//     },
//     appearsIn: {
//       type: new GraphQLList(episodeEnum),
//       description: 'Which movies they appear in.',
//     },
//   }),
//   resolveType: (obj) => {
//     return starWarsData.Humans[obj.id] ? humanType : droidType;
//   }
// });

/**
 * We define our human type, which implements the character interface.
 *
 * This implements the following type system shorthand:
 *   type Human : Character {
 *     id: String!
 *     name: String
 *     friends: [Character]
 *     appearsIn: [Episode]
 *   }
 */

var imageType = new GraphQLObjectType({
  name: "Image",
  description: "a generic image",
  fields: () => ({
    id : {
      type: GraphQLString,
      descsription: "id of the image"
    },
    url : {
      type: GraphQLString,
    }
  })
})

var trackType = new GraphQLObjectType({
  name: "Track",
  description: "A music track",
  fields: () => ({
    id : {
      type: new GraphQLNonNull(GraphQLString),
      descsription: "id of the track"
    },
    title : {
      type: GraphQLString,
      description: 'name of track'
    },
    albumName : {
      type: GraphQLString,
      description: 'name of album the track belongs to'
    }
  })
})

var albumType = new GraphQLObjectType({
  name: "Album",
  description: "An album",
  fields: () => ({
    id : {
      type: new GraphQLNonNull(GraphQLString),
      description: 'id of the album'
    },
    album : {
      type : GraphQLString,
      description : 'Album name'
    },
    tracks : {
      type : new GraphQLList(trackType),
      resolve: getTracks
    },
    image : {
      args : {
        size: {
          type : GraphQLString,
          defaultValue: 'medium'
        }
      },
      type: imageType,
      resolve: getImage
    }
  })
})

var artistType = new GraphQLObjectType({
  name: "Artist",
  description: "A musical artist",
  fields: () => ({
    artist : {
      type: GraphQLString,
      description: 'Aritst name'
    },
    albums : {
      type: new GraphQLList(albumType),
      resolve: getAlbums
    },
    image:  {
      args : {
        size: {
          type : GraphQLString,
          defaultValue: 'medium'
        }
      },
      type: imageType,
      resolve: getImage
    }
  })
})

var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    artists : {
      type: new GraphQLList(artistType),
      args: {
        name: {
          type: GraphQLString,
        }
      },
      resolve: getArtists
    }
  })
})

// var queryType = new GraphQLObjectType({
//   name: 'Query',
//   fields: () => ({
//     hero: {
//       type: characterInterface,
//       args: {
//         episode: {
//           description: 'If omitted, returns the hero of the whole saga. If ' +
//                        'provided, returns the hero of that particular episode.',
//           type: episodeEnum
//         }
//       },
//       resolve: (root, {episode}) => {
//         if (episode === 5) {
//           // Luke is the hero of Episode V.
//           return luke;
//         }
//         // Artoo is the hero otherwise.
//         return artoo;
//       }
//     },
//     human: {
//       type: humanType,
//       args: {
//         id: {
//           description: 'id of the human',
//           type: new GraphQLNonNull(GraphQLString)
//         }
//       },
//       resolve: (root, {id}) => starWarsData.Humans[id],
//     },
//     droid: {
//       type: droidType,
//       args: {
//         id: {
//           description: 'id of the droid',
//           type: new GraphQLNonNull(GraphQLString)
//         }
//       },
//       resolve: (root, {id}) => starWarsData.Droids[id],
//     },
//   })
// });



/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */
export var TrackSchema = new GraphQLSchema({
  query: queryType
});
