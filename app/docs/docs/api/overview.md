# Overview

This section is a brief overview of what the endpoints do and how they work. You must deploy your own instance in order to use the API.

All of the endpoints are accessible through a `GET` request.

#### `GET` /api/search.json

This endpoint enables searching for songs, playlists (featured & community), artists, and videos.

Responds with `contents` which contains the search results, along with a `continuation` object that is required for fetching the next page of search results.

[Learn all about it here!](/docs/api/endpoint/search)

#### `GET` /api/next.json

**_[coming soon]_**

#### `GET` /api/artist.json

**_[coming soon]_**

#### `GET` /api/player.json

**_[coming soon]_**

#### `GET` /api/playlist.json

**_[coming soon]_**
