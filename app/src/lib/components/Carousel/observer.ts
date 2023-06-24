import { browser } from "$app/environment";
import { CALLBACK_MAP } from "./ioCallbackMap";

class GlobalIntersectionObserver {
	private declare $self: IntersectionObserver;
	private callbacks = CALLBACK_MAP;
	private targets: WeakMap<
		HTMLElement,
		(typeof CALLBACK_MAP)[keyof typeof CALLBACK_MAP]
	> = new WeakMap();

	constructor() {
		if (!browser) return;
		this.$self = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				const callback = this.targets.get(entry.target as HTMLElement);
				if (!callback) continue;
				callback(this, entry);
			}
		});
	}

	observe(target: HTMLElement, callback: keyof typeof CALLBACK_MAP) {
		this.targets.set(target, this.callbacks[callback]);
		this.$self.observe(target);
	}
	unobserve(target: HTMLElement) {
		this.targets.delete(target);
		this.$self.unobserve(target);
	}
}

const Observer = new GlobalIntersectionObserver();

export type { GlobalIntersectionObserver };
/* eslint-disable no-inner-declarations */
export default function lazyContainer(
	node: HTMLElement,
	// eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
	{ items }: { items: any[] },
) {
	let children: NodeListOf<HTMLImageElement> | null =
		node.querySelectorAll<HTMLImageElement>("img[data-src]");

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	for (const img of children!) {
		Observer.observe(img, "images");
	}

	return {
		destroy() {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			for (const img of children!) {
				Observer.unobserve(img);
			}
			children = null;
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		update(_items: typeof children) {
			if (!children) return;
			children.forEach((element) => {
				Observer.unobserve(element);
			});
			children = node.querySelectorAll("img[data-src]");
			children.forEach((element) => Observer.observe(element, "images"));
		},
	};
}
