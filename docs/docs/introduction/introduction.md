# Introduction

Beatbump is an alternative frontend for YouTube Music that's powered by [SvelteKit](https://kit.svelte.dev/) and [Cloudflare Workers](https://workers.cloudflare.com/).


## What can it do?

Beatbump is capable of...

- Autoplay/Automix
- No Ads
- Music playback in background on mobile
- Search for songs, artists, playlists, and videos
  - Note: all content is audio-only.

... just to name a few things

## How does it work?

For some background, both YouTube and YouTube Music use Google's private Innertube API for almost all of their functionality. This API is both powerful and incredibly useful.

> NOTE: this project does *not* use the public YouTube Data API. The YouTube Data API and Innertube are *very* different.

Built from the ground up, Beatbump uses SvelteKit's [endpoints](https://kit.svelte.dev/docs#routing-endpoints) in order to retrieve, transform, and serve data directly from YouTube Music.
