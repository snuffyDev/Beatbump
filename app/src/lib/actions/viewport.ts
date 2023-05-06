let intersectionObserver;

function ensureIntersectionObserver(options?: { margin: string }) {
	if (intersectionObserver) return;

	intersectionObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				const eventName = entry.isIntersecting ? "enterViewport" : "exitViewport";
				entry.target.dispatchEvent(new CustomEvent(eventName));
			});
		},
		{ rootMargin: options ? options.margin : "0px 350px", threshold: 0 },
	);
}

export default function viewport(element, options?: { margin: string }) {
	ensureIntersectionObserver(options);

	intersectionObserver.observe(element);

	return {
		destroy() {
			intersectionObserver.unobserve(element);
		},
	};
}
