# Deployment

> Prior to deploying: Within the project root directory there is a file named ```.env.EXAMPLE```. There are two environment variables called ```VITE_DOMAIN``` and ```VITE_SITE_URL```. Change ```"example.xyz"``` and ```"https://example.xyz"``` to your domain, then change the file name to ```.env```. This is for the Content Security Policy.

Thanks to SvelteKit's use of [adapters](https://kit.svelte.dev/docs#adapters), deploying is simpler than ever.

By default Beatbump uses a custom Cloudflare Workers adapter, and is configured out of the box with Workers.

## Static

Not supported.
## Vercel, Netlify

Vercel and Netlify are deployable through adapters, with little to no configuration. For Vercel, check out the setup guide [here](https://github.com/sveltejs/kit/tree/master/packages/adapter-vercel). Otherwise, for Netlify, you can find the information needed [here](https://github.com/sveltejs/kit/tree/master/packages/adapter-netlify).

## Node

[See the README](https://github.com/sveltejs/kit/tree/master/packages/adapter-node) for details.
## Cloudflare Workers

To get caching for responses with Cloudflare Workers, a custom adapter is used. For guaranteed stability, use the [official](https://github.com/sveltejs/kit/tree/master/packages/adapter-cloudflare-workers) one. If you *do* want to use the custom one, [here](https://github.com/snuffyDev/adapter-cloudflare-cache) is the repository.

For both adapters: The [official adapter](https://github.com/sveltejs/kit/tree/master/packages/adapter-cloudflare-workers) follow the regular Wrangler setup.

For deploying to Cloudflare Workers, there's two commands in `package.json` for this:
| command  | description |
|--        |-- |
| `deploy` |  Is a typical deployment to Cloudflare Workers.<br> - Run this if you don't have the `.svelte-kit` & `build` folders.|
| `deploy:clean` |  Will delete the `.svelte-kit` and the `build` folders <br>   - This deletes the old files left over from the dev server for a clean starting point next time you run `dev`


## Notice For Public Instances

Whenever you are ready to deploy Beatbump, it's important to remember that YouTube uses *region-locking* for a lot of music. If you are just hosting this for yourself, then there should be no issues in terms of content playback.

However, if you are going to host Beatbump for public use, keep in mind that certain content *may be blocked* for someone using your instance. For example if someone in Europe connects to a US-hosted instance, there's a high chance of YouTube detecting a difference in regions and the request would be blocked.

> Cloudflare Workers seems to avoid this issue, but it's not 100% guaranteed to work. If you want to totally avoid region-locking, proxying requests may be required.
