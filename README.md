<img align="right" src="/.repo/images/logo-header.png" width="128px" height="128px" />

# Beatbump

Beatbump is an alternative frontend for YouTube Music created using Svelte/SvelteKit, and powered by Cloudflare Workers.

**Live Site**: https://beatbump.ml/

> Currently, Beatbump is undergoing a major rewrite/code cleanup in a separate branch. To see the latest changes, switch over to the rewrite branch.

| <img src="/.repo/images/artistpagegif.gif" width="640" height="auto"/> | <img src="/.repo/images/pwa.jpg" width="320" height="auto"/> | <img src="/.repo/images/trending.jpeg" width="640" height="auto"/> |
| ---------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------ |

<p align="center">
	  <a href="https://www.gnu.org/licenses/agpl-3.0.en.html">
    <img alt="License: AGPLv3" src="https://shields.io/badge/License-AGPL%20v3-blue.svg">
  </a>
  <a href="https://github.com/humanetech-community/awesome-humane-tech">
    <img alt="Awesome Humane Tech" src="https://raw.githubusercontent.com/humanetech-community/awesome-humane-tech/main/humane-tech-badge.svg?sanitize=true">
  </a>
</p>

## Features

- Autoplay/Automix
- No Ads
- Music playback in background on mobile
- Search for songs, playlists, and videos
  - Note: all content is audio-only.
- View Artist pages for your favorite content
- Personal Library
  - Stored locally on your device
  - Hear a song you like? Save it for later by adding it to your favorites!
  - Synchronize your library across your devices!
  - Custom Playlists
- Uses a custom wrapper around the YouTube Music API
- Multiple themes

## Privacy

All data is stored locally on your device. Data synchronization is done using PeerJS, which uses WebRTC for a peer-to-peer connection between browsers.

### Extensions

Privacy is something you shouldn't have to think about. Using the browser extension LibRedirect, you can automatically redirect YouTube Music links to Beatbump. For more information, please visit the [LibRedirect Repo](https://github.com/libredirect/libredirect).

## Development

### Contributing

At the present moment, for stability reasons, Pull Requests generally will not be accepted. This will change soon once the current code overhaul is completed, or nearly completed.

### Deploying Beatbump

You can find the documentation [here](https://snuffydev.github.io/Beatbump/#/) for setup information.

### Project Inspirations

- [Invidious](https://github.com/iv-org/invidious) - a privacy focused alternative YouTube front end.
