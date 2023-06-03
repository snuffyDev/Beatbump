let intersectionObserver: IntersectionObserver;

const observerCallback = (entries: IntersectionObserverEntry[], ob) => {
	for (let idx = 0; idx < entries.length; idx++) {
		const entry = entries[idx];
		const target = entry.target as HTMLImageElement;
		if (entry.isIntersecting) {
			target.decode().finally(() => {
				target.src = target.dataset.src;
				queueMicrotask(() => {
					target.decode().finally(() => {
						intersectionObserver.unobserve(entry.target);
					});
				});
			});
		}
	}
};

function ensureIntersectionObserver(node: HTMLElement) {
	if (intersectionObserver) return;
	intersectionObserver = new IntersectionObserver(observerCallback, {
		threshold: 0,
		rootMargin: "95px 80px",
	});
	return intersectionObserver;
}

/* eslint-disable no-inner-declarations */
export default function lazyContainer(
	node: HTMLElement,
	{ items }: { items: any[] },
) {
	ensureIntersectionObserver(node);

	let children = node.querySelectorAll("img[data-src]");

	for (const img of children) {
		intersectionObserver.observe(img);
	}

	return {
		destroy() {
			for (const img of children) {
				intersectionObserver.unobserve(img);
			}
			children = null;
		},
		update(items: typeof children) {
			children.forEach((element) => {
				intersectionObserver.unobserve(element);
			});
			children = node.querySelectorAll("img[data-src]");
			children.forEach((element) => intersectionObserver.observe(element));
		},
	};
}
