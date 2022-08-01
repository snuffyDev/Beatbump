<img align="right" src="../.repo/images/logo-header.png" width="128px" height="128px" />

# Beatbump

Beatbump is an alternative frontend for YouTube Music created using Svelte/SvelteKit, and powered by Cloudflare Workers.

**Live Site**: https://beatbump.ml/

<p align="center">
	  <a href="https://www.gnu.org/licenses/agpl-3.0.en.html">
    <img alt="License: AGPLv3" src="https://shields.io/badge/License-AGPL%20v3-blue.svg">
  </a>
  <a href="https://github.com/humanetech-community/awesome-humane-tech">
    <img alt="Awesome Humane Tech" src="https://raw.githubusercontent.com/humanetech-community/awesome-humane-tech/main/humane-tech-badge.svg?sanitize=true">
  </a>
</p>

## Features

- Automix for continued listening
- No ads
- Background play on mobile devices\*
- Search for artists, playlists, songs, and albums
  - Note that all playback is audio only (for now)
- Local playlist management
  - Stored in-browser with IndexedDB
  - Can save songs individually under 'Favorites'
  - Peer-to-Peer data synchronization (using WebRTC)
- Group Sessions
  - Achieved with WebRTC in a [mesh](https://en.wikipedia.org/wiki/Mesh_networking)
- Uses a custom wrapper around the YouTube Music API

...and so much more!

> [1] iOS updates may break this from time to time, but works as of iOS 15.6

## Privacy

All data is stored locally on your device. Data synchronization is done using PeerJS, which uses WebRTC for a
Peer-to-Peer connection between browsers.

### Extensions

Privacy is something you shouldn't have to think about. Using the browser extension LibRedirect, you can automatically
redirect YouTube Music links to Beatbump. For more information, please visit the
[LibRedirect Repo](https://github.com/libredirect/libredirect).

## Development

### Contributing

(TODO)

### Deploying Beatbump

You can find the documentation [here](https://snuffydev.github.io/Beatbump/#/) for setup information.

### Project Inspirations

- [Invidious](https://github.com/iv-org/invidious) - a privacy focused alternative YouTube front end.
