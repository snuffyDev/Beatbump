# Deployment

Thanks to SvelteKit's use of [adapters](https://kit.svelte.dev/docs#adapters), deploying is simpler than ever.

By default Beatbump uses a custom Cloudflare Workers adapter, and is configured out of the box with Workers.

## Vercel, Netlify

Vercel and Netlify are deployable through adapters, with little to no configuration. For Vercel, check out the setup guide [here](https://github.com/sveltejs/kit/tree/master/packages/adapter-vercel). Otherwise, for Netlify, you can find the information needed [here](https://github.com/sveltejs/kit/tree/master/packages/adapter-netlify).

## Cloudflare Workers
The custom adapter is installed and used in ```svelte.config.js``` out-of-the-box.

For both adapters: The [official adapter](https://github.com/sveltejs/kit/tree/master/packages/adapter-cloudflare-workers) follow the regular Wrangler setup.

## Notice For Public Instances

Whenever you are ready to deploy Beatbump, it's important to remember that YouTube uses *region-locking* for a lot of music. If you are just hosting this for yourself, then there should be no issues in terms of content playback.

However, if you are going to host Beatbump for public use, keep in mind that certain content *may be blocked* for someone using your instance. For example if someone in Europe connects to a US-hosted instance, there's a high chance of YouTube detecting a difference in regions and the request would be blocked.

> Cloudflare Workers seems to avoid this issue, but it's not 100% guaranteed to work. If you want to totally avoid region-locking, proxying requests may be required.
