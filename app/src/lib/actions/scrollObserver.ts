import type { Action } from "svelte/action";
// Svelte action that detects if the element is scrolled based on the visibility of a target child element using IntersectionObserver
export const scrollObserver: Action<
	HTMLElement,
	IntersectionObserverInit & { target: string },
	{
		"on:scrolled": (
			event: CustomEvent<{
				isIntersecting: boolean;
				intersectionRatio?: number;
			}>,
		) => void;
	}
> = (
	node: HTMLElement,
	options: IntersectionObserverInit & { target: string },
) => {
	const observer = new IntersectionObserver(([entry]) => {
		node.dispatchEvent(
			new CustomEvent("scrolled", {
				detail: {
					isIntersecting: entry.isIntersecting,
					intersectionRatio: entry.intersectionRatio,
				},
			}),
		);
	}, options);

	observer.observe(
		options.target === "self"
			? node
			: node.querySelector<HTMLElement>(options.target)!,
	);

	return {
		destroy() {
			observer.disconnect();
		},
	};
};
