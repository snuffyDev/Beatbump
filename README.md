# <img src="/.repo/images/logo-header.png" width=48 height=48 /> Beatbump

An Alternative frontend for YouTube Music created using Svelte/SvelteKit, and powered by Cloudflare Workers.

**Live Site**: https://beatbump.ml/

**Documentation** _(work in progress)_: https://snuffydev.github.io/Beatbump/index.html#/

| <img src="/.repo/images/artistpagegif.gif" width="640" height="auto"/> | <img src="/.repo/images/pwa.jpg" width="320" height="auto"/> | <img src="/.repo/images/trending.jpeg" width="640" height="auto"/> |
| ---------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------ |

## Features

- Autoplay/Automix
- No Ads
- Music playback in background on mobile
- Search for songs, playlists, and videos
  - Note: all content is audio-only.
- View Artist pages for your favorite content
- Personal Library
	- Hear a song you like? Save it for later by adding it to your favorites!
	- Synchronize your library across your devices!
	-***custom playlists - coming soon***
- Uses a custom wrapper around the YouTube Music API
- Multiple themes

## Privacy

All data is stored locally on your device. Data synchronization is done using PeerJS, which uses WebRTC for a peer-to-peer connection between browsers.
## Libraries used

- [PeerJS](https://www.npmjs.com/package/peerjs) - WebRTC data synchronization
## Contributing

This project is in it's infancy, so for stability reasons, this repository is currently not accepting pull requests for now. You can download the repo and modify the code to fit your needs best.

Once the documentation is finished, this repo will accept them.

## Development and Deploying

You can find the documentation [here](https://snuffydev.github.io/Beatbump/#/) for setup information.

## Inspirations

- [Invidious](https://github.com/iv-org/invidious) - a privacy focused alternative YouTube front end.
