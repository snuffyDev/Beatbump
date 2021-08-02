


# <img src="/.repo/images/logo-header.png" width=48 height=48 /> Beatbump

An Alternative frontend for YouTube Music created using Svelte/SvelteKit.

**Live Site**: https://beatbump.ml/

**Documentation** _(work in progress)_: https://snuffydev.github.io/Beatbump/index.html#/

|<img src="/.repo/images/artistpagegif.gif" width="480" height="auto"/> |<img src="/.repo/images/pwa.jpg" width="160" height="auto"/>|<img src="/.repo/images/trending.jpeg" width="480" height="auto"/> |
|--  |-- |-- |

## Features

- Autoplay/Automix
- No Ads
- Music playback in background on mobile
- Search for songs, playlists, and videos
  - Note: all content is audio-only.
- View Artist pages for your favorite content
- Uses a custom wrapper around the YouTube Music API

## Development

This project is in it's infancy, so for stability reasons, this repository is currently not accepting pull requests for now. You can download the repo and modify the code to fit your needs best.

Once there's documentation for how it works, along with a solid base of features, this repo will accept them.

### Getting Started

First, clone or initialize the repository on your machine. To quickly get setup, use [degit](https://github.com/Rich-Harris/degit):

```bash
npx degit snuffyDev/Beatbump Beatbump
cd Beatbump

```

Install the dependencies using npm or pnpm:

```bash
npm install
```

Make sure the SvelteKit packages are marked 'next' in the `package.json` before starting up the development server. If everything is installed, and the SvelteKit related packages are marked `"next"` then the setup is finished! Run `npm run dev` to get started!

> NOTE: The dev server served on port 5000, with the flag `--host` enabled. Remove this if you want to avoid the dev server being accessible on other devices.

### Deploying


The default deployment is configured for Cloudflare Workers. For information on how to setup and configure Cloudflare Workers, visit the [official repo](https://github.com/sveltejs/kit/tree/master/packages/adapter-cloudflare-workers) for the adapter.

To get caching for responses with Cloudflare Workers, I'm using a custom adapter. As it is most likely unstable, I'd recommend installing the official one. If you *do* want to use the custom one, [here](https://github.com/snuffyDev/adapter-cloudflare-cache) is the repository.

For deploying to Cloudflare Workers, there's two commands in `package.json` for this:
| command  | description |
|--        |-- |
| `deploy` |  Is a typical deployment to Cloudflare Workers.<br> - Run this if you don't have the `.svelte-kit` & `build` folders.|
| `deploy:clean` |  Will delete the `.svelte-kit` and the `build` folders <br>   - This deletes the old files left over from the dev server for a clean starting point next time you run `dev`


For other adapters, visit the official [adapters section](https://kit.svelte.dev/docs#adapters) of the SvelteKit documentation.

> **Note:** This app uses SvelteKit endpoints, which will not work with @sveltejs/adapter-static, it's **_not recommended_** to use it, even if you refactor it to use Serverless Functions.
