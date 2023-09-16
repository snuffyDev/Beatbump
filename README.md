<img align="right" src=".repo/images/logo-header.png" width="128px" height="128px" />

# Beatbump

A privacy-respecting alternative frontend for YouTube Music. Built with SvelteKit, official instance hosted with
Cloudflare Workers.

> NOTE: Beatbump is going through a major rewrite, so errors, bugs, and other problems may happen at random.

<div align="center">

| <img src=".repo/images/playlist.jpeg" width=""/> | <img src=".repo/images/m_artist.png" width="" height="auto"/> | <img src=".repo/images/m_queue.png" width=""/> |
| ------------------------------------------------ | ------------------------------------------------------------- | ---------------------------------------------- |

</div>
<p align="center">
	  <a href="https://www.gnu.org/licenses/agpl-3.0.en.html">
    <img alt="License: AGPLv3" src="https://shields.io/badge/License-AGPL%20v3-blue.svg">
  </a>
  <a href="https://github.com/humanetech-community/awesome-humane-tech">
    <img alt="Awesome Humane Tech" src="https://raw.githubusercontent.com/humanetech-community/awesome-humane-tech/main/humane-tech-badge.svg?sanitize=true">
  </a>
</p>

## Why Beatbump?

Beatbump is a fully-featured music listening experience, while helping to ease your privacy concerns associated with
other platforms.

Some of Beatbump's features includes:

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
  - Achieved using a WebRTC [mesh](https://en.wikipedia.org/wiki/Mesh_networking)
- Uses a custom wrapper around the YouTube Music API
- Minimizes requests made to YouTube/Google's servers
  - Thumbails are proxied through Beatbump by default
  - Audio proxying can be enabled within the user settings

...and so much more!

> [1] iOS updates may break this from time to time, but works as of iOS 15.6

## Repo Structure

| Directory                     | Description                                           |
| ----------------------------- | ----------------------------------------------------- |
| `app`                         | Beatbump web app                                      |
| `packages/hls-proxy-rewriter` | Proxy server used for Beatbump's music playback (WIP) |

## Instances

> Service Uptime Monitoring: https://stats.uptimerobot.com/9PnmRfz6Gm

| Name                             | URL                                                                       |
| -------------------------------- | ------------------------------------------------------------------------- |
| Beatbump (Official)              | https://beatbump.ml                                                       |
| ~Vern (Clearnet)                 | https://bb.vern.cc/                                                       |
| ~Vern (Onion)                    | http://bb.vernccvbvyi5qhfzyqengccj7lkove6bjot2xhh5kajhwvidqafczrad.onion/ |
| ~Vern (I2P)                      | http://vern6inmbjzqpecx4kpkq5sln3cqqrfuxfzh4au3tpxbsfbwbnta.b32.i2p/      |
| btb.frail.duckdns.org (Clearnet) | https://btb.frail.duckdns.org/                                            |

## Donations

Want to support Beatbump financially to aid with future development/hosting?

[Donate with PayPal!](https://www.paypal.com/donate/?hosted_button_id=E6YRHKS2H2KP2)

Donations of any amount are very much appreciated, so thank you if you choose to donate!

_(Other ways to donate coming soon!)_

## Docker

Beatbump is available as a Docker image: [DockerHub](https://hub.docker.com/r/snuffydev/beatbump)

The pre-built image uses the following configuration:

| Environment Variable           | Default Value         | Description                               |
| ------------------------------ | --------------------- | ----------------------------------------- |
| `PORT`                         | `3000`                | Port to listen on                         |
| `ALLOW_IFRAME`                 | `false`               | Allow the app to be embedded in an iframe |
| `PUBLIC_ALLOW_THUMBNAIL_PROXY` | `false`               | Allow the thumbnail proxy to be used      |
| `VITE_DOMAIN`                  | `beatbump.io`         | The domain of the instance                |
| `VITE_SITE_URL`                | `https://beatbump.io` | The URL of the instance                   |

### docker-compose (production)

The quickest way to host a Beatbump instance is with [Docker](https://www.docker.com/get-started). Once you have it
installed, you can run:

```
docker-compose up
```

The app will now be accessible from `https://localhost:443 / http://localhost:3000`.

### Customizing your instance

In order to customize your Beatbump instance, you must build your own container. This process is very simple and only
requires a few extra steps.

1. Clone the repository
2. Rename the `.env.EXAMPLE` file (found at the root of the repository) to `.env`
3. Make any changes to the values of the environment variables

You can now run `docker-compose up` to start your instance. The app will now be accessible on the port specified in
`.env` (`3000` by default)

## Project Inspirations

- [Invidious](https://github.com/iv-org/invidious) - a privacy focused alternative YouTube front end.

## License

Beatbump is licensed under the [AGPLv3](LICENSE).
