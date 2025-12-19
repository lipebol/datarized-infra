
export class Externals {

    static async initialize(handler) {
        if (handler.about.resolver in Externals) {
            return await Externals[handler.about.resolver](handler)
        }
    }

    static async spotifyAPI(handler) {

        const [graphql, query, spotify] = [
            'http://localhost:3000/api/v2/graphql',
            (type, filter, id) => {
                return {
                    method: 'POST', body: {
                        query: `query { 
                    ${type}(${filter}: \"${id}\", lookup: false) 
                    { ...on ${type} { data { id ${filter} } } 
                    ...on Errors { error message status_code } }}`
                    }
                }
            }, `https://api.spotify.com/v1/tracks/${handler.params}`
        ]

        let track = await Externals.get(
            graphql, query('spotifExTracks', handler.filter, handler.params)
        ).then(tracks => tracks.data['spotifExTracks'])

        if (!track?.data) {

            track = await Externals.get(spotify, { token: handler.authExternal })

            let data = track.status_code ?
                { error: track } : {
                    url: track.external_urls?.spotify, name: track.name, trackid: track.id,
                    duration_ms: track.duration_ms, disc_number: track.disc_number,
                    track_number: track.track_number, popularity: track.popularity,
                    explicit: track.explicit, isrc: track.external_ids?.isrc,
                    __typename: 'spotifExTrackFields'
                }


            if (!data.error && handler.fields.includes('album')) {
                let album = await Externals.get(
                    graphql, query('spotifExAlbums', 'albumid', track.album?.id)
                ).then(albums => albums.data['spotifExAlbums'])


                if (!album?.data) {
                    album = await Externals.get(
                        track.album?.href, { token: handler.authExternal }
                    )

                    if (album.status_code) {
                        data = { error: album }
                    } else {
                        data.album = {
                            albumid: album.id, name: album.name, label: album.label,
                            release_date: album.release_date, images: album.images,
                            available_markets: album.available_markets,
                            external_url: album.external_urls?.spotify,
                            total_tracks: album.total_tracks,
                            album_type: album.album_type,
                            copyrights: album.copyrights,
                            __typename: 'spotifExAlbumFields'
                        }
                    }
                } else {
                    data.album = { id: album?.data?.[0]?.id, __typename: 'spotifExAlbumId' }
                }
            }


            if (!data.error && handler.fields.includes('artists')) {
                let ids = track.artists?.map(artist => artist.id)
                let artists = await Externals.get(
                    graphql, query('spotifExArtists', 'artistid', ids.join('|'))
                ).then(artists => artists.data['spotifExArtists'])

                let newartists = artists?.error ? track.artists?.map(artist => artist.href) :
                    (() => {
                        ids = ids.filter(
                            artist => !new Set(
                                artists?.data?.map(artist => artist.artistid)
                            ).has(artist)
                        )
                        return ids.length === 0 ? null :
                            track.artists?.filter(
                                artist => new Set(ids).has(artist.id)
                            )?.map(artist => artist.href)
                    })()

                let savedartists = !artists?.data ? null : artists?.data?.map(
                    ({ id }) => ({ id, __typename: 'spotifExArtistId' })
                )

                if (newartists) {
                    newartists = await Promise.all(
                        newartists.map(
                            async (artist) => {
                                artist = await Externals.get(
                                    artist, { token: handler.authExternal }
                                )
                                return {
                                    artistid: artist.id, name: artist.name,
                                    profile: artist.external_urls?.spotify,
                                    followers: artist.followers?.total,
                                    images: artist.images, genres: artist.genres
                                        .map((genre) => { return { name: genre, about: '' } }),
                                    __typename: 'spotifExArtistFields'
                                }
                            }
                        )
                    )
                    if (newartists?.status_code) { data = { error: newartists } }
                    else if (savedartists) { data.artists = [...savedartists, ...newartists] }
                    else { data.artists = newartists }
                } else { data.artists = savedartists }
            }
            return data
        } else { return { id: track?.data?.[0]?.id, __typename: 'spotifExTrackId' } }
    }


    static async get(endpoint, { method, body, token }) {
        let args = { signal : AbortSignal.timeout(20000) }
        if (method) { args.method = method }
        if (body) {
            args.headers = { 'Content-Type': 'application/json' }
            args.body = JSON.stringify(body)
        }
        if (token) { args.headers = { 'Authorization': `Bearer ${token}` } }


        let response = await fetch(endpoint, args)

        return response.ok ? await response.json() :
            {
                ...{
                    400: { name: 'BadRequest' },
                    401: { name: 'Unauthorized' },
                    404: { name: 'NotFound' },
                    500: { name: 'InternalServerError' }
                }[response.status], status_code: response.status
            }
    }
}