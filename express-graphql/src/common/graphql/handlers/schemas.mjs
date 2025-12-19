import { buildSchema } from 'graphql'

export const schemas = buildSchema(`
    scalar Date

    type Errors {
        error: String!
        message: String!
        status_code: Int!
    }

    type Info {
        total: Int
        pages: Int
    }

    type _ImageField_ {
        url: String
        width: Int
        height: Int
    }

    type _CopyrightField_ {
        text: String
        type: String
    }



    type spotifExGenreFields {
        id: ID!
        name: String
        about: String
    }


    type spotifExArtistId { id: ID! }
    type spotifExArtistFields {
        id: ID!
        artistid: String
        name: String
        profile: String
        followers: Int
        images: [_ImageField_] 
        genres: [spotifExGenreFields]
    }
    union spotifExArtist = spotifExArtistId | spotifExArtistFields
    type spotifExArtists { data: [spotifExArtistFields] }
    union spotifExArtists_ = spotifExArtists | Info | Errors



    type spotifExAlbumId { id: ID! }
    type spotifExAlbumFields {
        id: ID!
        albumid: String
        name: String
        album_type: String
        release_date: String
        available_markets: [String]
        no_available_markets: [String]
        external_url: String
        images: [_ImageField_]
        total_tracks: Int
        copyrights: [_CopyrightField_]
        label: String
    }
    union spotifExAlbum = spotifExAlbumId | spotifExAlbumFields
    type spotifExAlbums { data: [spotifExAlbumFields] }
    union spotifExAlbums_ = spotifExAlbums | Info | Errors


    
    type spotifExTrackId { id: ID! }
    type spotifExTrackFields {
        id: ID!
        trackid: String
        name: String
        album: spotifExAlbum
        artists: [spotifExArtist]
        url: String
        duration_ms: String
        popularity: Int
        explicit: Boolean
        track_number: Int
        disc_number: Int
        isrc: String
    }
    union spotifExTrack = spotifExTrackId | spotifExTrackFields | Errors
    type spotifExTracks { data: [spotifExTrackFields] }
    union spotifExTracks_ = spotifExTracks | Info | Errors
    


    type spotifExDaylistFields {
        id: ID!
        track: spotifExTrackFields
        date: String
        listen: Int
    }
    type spotifExDaylists { data: [spotifExDaylistFields] }
    union spotifExDaylists_ = spotifExDaylists | Info | Errors

    
    
    type Query {
        spotifyAPI(trackid: String): spotifExTrack!


        spotifExArtists(
            artistid: String, name: String, page: Int, 
            info: Boolean, lookup: Boolean
        ): spotifExArtists_!


        spotifExAlbums(
            albumid: String, name: String, page: Int, 
            info: Boolean, lookup: Boolean
        ): spotifExAlbums_!


        spotifExTracks(
            trackid: String, name: String, page: Int, 
            info: Boolean, lookup: Boolean
        ): spotifExTracks_!

        
        spotifExDaylists(
            date: String, page: Int, info: Boolean, lookup: Boolean
        ): spotifExDaylists_!
    }
`)