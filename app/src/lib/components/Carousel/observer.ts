import { iter } from "$lib/utils/collections";

let intersectionObserver: IntersectionObserver;

function init(node: HTMLElement) {
	if (intersectionObserver) return;
	intersectionObserver = new IntersectionObserver(
		(entries: IntersectionObserverEntry[], ob) => {
			for (let idx = 0; idx < entries.length; idx++) {
				const entry = entries[idx];
				const target = entry.target as HTMLImageElement;
				if (entry.isIntersecting) {
					requestAnimationFrame(() => {
						target.decode().finally(() => {
							target.src = target.dataset.src;
							target.decode().finally(() => {
								intersectionObserver.unobserve(entry.target);
							});
						});
					});
				}
			}
		},
		{ threshold: 0, rootMargin: "95px 80px" },
	);
	return intersectionObserver;
}

/* eslint-disable no-inner-declarations */
export default function observer(node: HTMLElement) {
	init(node);
	const children = node.querySelectorAll("img[data-src]");
	iter(children, (item) => {
		intersectionObserver.observe(item);
	});

	return {
		destroy() {
			iter(children, (item) => {
				intersectionObserver.unobserve(item);
			});
		},
	};
}
