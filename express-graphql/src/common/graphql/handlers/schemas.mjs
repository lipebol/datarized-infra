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
        columns: [String]
    }

    type Arrow {
        message: String!
        object: String!
        presigned: String!
    }




    type DivvyBikesFields {
        ride_id: String
        rideable_type: String
        started_at: Date
        ended_at: Date
        start_station_name: String
        start_station_id: String
        end_station_name: String
        end_station_id: String
        start_lat: String
        start_lng: String
        end_lat: String
        end_lng: String
        member_casual: String
    }
    type DivvyBikes { data: [DivvyBikesFields] }
    union DivvyBikes_ = DivvyBikes | Info | Errors




    type ISO3166 {
        id: ID!
        name: String
        code: String
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
    union spotifExArtists_ = spotifExArtists | Errors


    interface _spotifExAlbumFields_ {
        id: ID!
        albumid: String
        name: String
        album_type: String
        release_date: String
        external_url: String
        images: [_ImageField_]
        total_tracks: Int
        copyrights: [_CopyrightField_]
        label: String
    }
    type spotifExAlbumId { id: ID! }
    type spotifExAlbumFields implements _spotifExAlbumFields_ {
        id: ID!
        albumid: String
        name: String
        album_type: String
        release_date: String
        external_url: String
        images: [_ImageField_]
        total_tracks: Int
        copyrights: [_CopyrightField_]
        label: String
    }
    union spotifExAlbum = spotifExAlbumId | spotifExAlbumFields
    type spotifExAlbumAllFields implements _spotifExAlbumFields_ {
        id: ID!
        albumid: String
        name: String
        album_type: String
        release_date: String
        available_markets: [ISO3166]
        no_available_markets: [ISO3166]
        external_url: String
        images: [_ImageField_]
        total_tracks: Int
        copyrights: [_CopyrightField_]
        label: String
    }
    type spotifExAlbums { data: [spotifExAlbumAllFields] }
    union spotifExAlbums_ = spotifExAlbums | Errors

    
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
    union spotifExTracks_ = spotifExTracks | Errors
    

    type spotifExDaylistFields {
        id: ID!
        track: spotifExTrackFields
        date: String
        listen: Int
    }
    type spotifExDaylists { data: [spotifExDaylistFields] }
    union spotifExDaylists_ = spotifExDaylists | Arrow | Info | Errors





    type Query {
        DivvyBikes
        (by: String, between: String, info: Boolean, page: Int): DivvyBikes_!

        spotifExDaylists
        (date: String, lookup: Boolean, arrow: Boolean, info: Boolean, page: Int): spotifExDaylists_!

        spotifExTracks
        (trackid: String, name: String, lookup: Boolean): spotifExTracks_!

        spotifExAlbums
        (albumid: String, name: String, lookup: Boolean): spotifExAlbums_!

        spotifExArtists
        (artistid: String, name: String, lookup: Boolean): spotifExArtists_!

        SpotifyWebAPI
        (trackid: String): spotifExTrack!
    }
`)