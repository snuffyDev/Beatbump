# Rust Proxy Server

This audio proxy server is still an early work-in-progress, use with caution!

> Note: Since this proxy is potentially unstable, a binary is not provided for the time being.
>
> In order to use this you must compile it locally!

## Config

By default, the proxy listens to `0.0.0.0:10000`.

You can change either the address or the port by running the proxy with the following Environment Variables:

| Env Var      | Description                               |
| ------------ | ----------------------------------------- |
| `PROXY_ADDR` | Address to listen to (default: `0.0.0.0`) |
| `PROXY_PORT` | Port to listen to (default: `10000`)      |

## Features

- Works with `/videoplayback` URLs
- Rewrites and proxys HLS streams
- Small binary size (3.65MB on Windows)
- Uses very little resources

## Future Tasks

- Stream the HTTP Responses
- Write tests
- Better error handling
- Remove blacklisted headers
