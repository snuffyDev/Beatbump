# Beatbump

Alternative frontend for YouTube Music created using Svelte/SvelteKit.

**Live Site**: https://beatbump.ml/

![Artist Page](/.repo/images/Artist.png)

## Features

- Autoplay/Automix
- No Ads
- Music playback in background on mobile
- Search for songs, playlists, and videos
  - Note: all content is audio-only.
- Artist pages

### In The Works

- Playlist page
- Fully implement the YTM Explore page
- Finish the Artist page

## Development

This repository is currently not accepting pull requests for now. You can download the repo and modify the code to fit your needs best.

### Local Development

Clone or download the repository, then navigate into the repo's folder.
NPM is recommended for the package manager, but you can try others.

Run the following command:

```
npm install
```

Make sure the SvelteKit packages are marked 'next' in the package.json

### Deploying

The default deployment is configured for Cloudflare Workers. For information on how to setup and configure Cloudflare Workers, visit the [official repo](https://github.com/sveltejs/kit/tree/master/packages/adapter-cloudflare-workers) for the adapter.

For other adapters, visit the official [adapters section](https://kit.svelte.dev/docs#adapters) of the SvelteKit documentation.

**NOTE:** It's highly encouraged to use serverless deployment or the Node adapter for easier deployment.

To use the static adapter, you would need to modify the endpoint routes to fit your platform's serverless functions format. It is **_not recommended_** to use the static adapter.
