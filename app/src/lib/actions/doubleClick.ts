import type { Action } from "svelte/action";

export const doubleClick: Action<
	HTMLDivElement,
	never,
	{ "on:cancel": never; "on:dblclick": never }
> = (node: HTMLElement) => {
	let clickCount = 0;
	let timer: ReturnType<typeof setTimeout>;

	const setClickCount = (count: number) => {
		if (timer) {
			clearTimeout(timer);
		}

		clickCount = count;
		timer = setTimeout(() => {
			clickCount = 0;
		}, 400);
	};

	const reset = () => {
		clickCount = 0;
	};

	const handleClick = () => {
		setClickCount(clickCount + 1);

		if (clickCount === 2) {
			clickCount = 0;
			node.dispatchEvent(new CustomEvent("dblclick"));
		}
	};

	node.addEventListener("click", handleClick);

	return {
		destroy() {
			node.removeEventListener("click", handleClick);
		},
		reset,
	};
};
