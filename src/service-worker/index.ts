/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { timestamp, build, files } from "$service-worker";

const CACHED_ASSESTS = `cache-${timestamp}`;

const TO_CACHE = build.concat(files);

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHED_ASSESTS).then((cache) => cache.addAll(TO_CACHE))
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then(async (keys) => {
			for (const key of keys) {
				if (!key.includes(timestamp)) caches.delete(key);
			}
			self.clients.claim();
		})
	);
});
async function fetchAndCache(request) {
	const cache = await caches.open(`offline-${timestamp}`);

	try {
		const response = await fetch(request);
		cache.put(request, response.clone());
		return response;
	} catch (err) {
		const response = await cache.match(request);
		if (response) return response;

		throw err;
	}
}
self.addEventListener("fetch", (event) => {
	const { request } = event;

	if (!(request.url.indexOf("http") === 0)) return;
	if (
		request.method !== "GET" ||
		request.headers.has("range") ||
		(request.cache === "only-if-cached" && request.mode !== "same-origin")
	)
		return;

	const url = new URL(request.url);
	const cached = caches.match(request);

	if (url.origin === location.origin && TO_CACHE.includes(url.pathname)) {
		event.respondWith(cached);
	} else if (url.protocol === "https:" || location.hostname === "localhost") {
		const promise = fetch(request);

		promise.then((response) => {
			// cache successful responses
			if (response.ok && response.type === "basic") {
				const clone = response.clone();
				caches.open(CACHED_ASSESTS).then((cache) => {
					cache.put(request, clone);
				});
			}
		});

		event.respondWith(promise.catch(() => cached || promise));
	}
});
