# API Examples

### Search 'All Playlists' for 'Disco' playlists
Make a ```GET``` request to:

```/api/search.json?q=Disco&filter=EgWKAQIoAWoKEAMQBBAKEAUQCQ%3D%3D```

Endpoint Response (shortened):
```js
contents: [
    {
        "thumbnails": [
            {
                "url": "https://i.ytimg.com/...",
                "width": xxx,
                "height": xxx
            }
        ],
        "browseId": "VLPLEDCFD764EFD69518",
        "metaData": "David Jazwa • 55 songs",
        "playlistId": "PLEDCFD764EFD69518",
        "hash": "pnqdm14hjlruc61flbk86d",
        "title": "100 greatest disco hits",
        "type": "playlist"
    }
		...
]
```

### Continue Last Search

The first response should have a ```continuation``` object. Use the ```continuation``` string and the ```clickTrackingParams``` string in the next request. Make sure to keep the ```?q=``` but leave the query blank!

```/api/search.json?q=&filter=EgWKAQIoAWoKEAMQBBAKEAUQCQ==&params=CAsQybcCIhMIhNPpreqS8gIVysI_BB0DjwDm&ctoken=ErAIEgV....```

