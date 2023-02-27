import { iter } from "$lib/utils/collections";

let intersectionObserver: IntersectionObserver;

const observerCallback = (entries: IntersectionObserverEntry[], ob) => {
	for (let idx = 0; idx < entries.length; idx++) {
		const entry = entries[idx];
		const target = entry.target as HTMLImageElement;
		if (entry.isIntersecting) {
			target.decode().finally(() => {
				target.src = target.dataset.src;
				target.decode().finally(() => {
					intersectionObserver.unobserve(entry.target);
				});
			});
		}
	}
};

function ensureIntersectionObserver(node: HTMLElement) {
	if (intersectionObserver) return;
	intersectionObserver = new IntersectionObserver(observerCallback, { threshold: 0, rootMargin: "95px 80px" });
	return intersectionObserver;
}

/* eslint-disable no-inner-declarations */
export default function lazyContainer(node: HTMLElement) {
	ensureIntersectionObserver(node);

	let children = node.querySelectorAll("img[data-src]");

	for (const img of children) {
		queueMicrotask(() => {
			intersectionObserver.observe(img);
		});
	}

	return {
		destroy() {
			for (const img of children) {
				intersectionObserver.unobserve(img);
			}
			children = null;
		},
	};
}
