import { iter } from "$lib/utils/collections";

/* eslint-disable no-inner-declarations */
export default function observer(node: HTMLElement) {
	const children = node.querySelectorAll("img");
	if (IntersectionObserver) {
		const observer = new IntersectionObserver(
			(entries: IntersectionObserverEntry[]) => {
				iter(entries, (entry) => {
					const target = entry.target as HTMLImageElement;
					if (entry.isIntersecting) {
						// target.dataset.loaded = "true";
						target.src = target.dataset.src;
						observer.unobserve(node);
					}
				});
			},
			{
				threshold: 0,
				rootMargin: "125px 125px",
			},
		);
		iter(children, (item) => {
			observer.observe(item);
		});
		return {
			destroy() {
				iter(children, (item) => {
					observer.unobserve(item);
				});
			},
		};
	}
}
