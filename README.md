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

Make sure the SvelteKit packages are marked 'next' in the ```package.json``` before starting up the development server. If everything is installed, and the SvelteKit related packages are marked ```"next"``` then the setup is finished. The dev server will be served on port 5000.

> NOTE: the dev command has the flag ```--host``` enabled. Remove this if you want to avoid the dev server being accessible on other devices.   

### Deploying

The default deployment is configured for Cloudflare Workers. For information on how to setup and configure Cloudflare Workers, visit the [official repo](https://github.com/sveltejs/kit/tree/master/packages/adapter-cloudflare-workers) for the adapter.

For other adapters, visit the official [adapters section](https://kit.svelte.dev/docs#adapters) of the SvelteKit documentation.

> **Note:** This app uses SvelteKit endpoints, which will not work with @sveltejs/adapter-static, it's **_not recommended_** to use it, even if you refactor it to use Serverless Functions.


