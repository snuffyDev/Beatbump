<svelte:options immutable={true} />

<script
	lang="ts"
	context="module"
>
	function dropdown(node: HTMLElement, { items = [], type = "", metadata = {} }) {
		let x: number, y: number, bottom: number;
		let open = false;
		const a11yClick = (e: KeyboardEvent) => {
			if (e.key !== "Space") return;
			node.click();
			open = false;
		};

		function handleDocumentClick(event: MouseEvent & { target: HTMLElement & EventTarget }) {
			if (open && !node.contains(event.target) && !node.isSameNode(event.target)) {
				isOpen.set(false);
				open = false;
				PopperStore.reset();
				activeNode.set(new WeakRef({ value: null }));
			}
		}

		function handleClick(event: MouseEvent & { target: HTMLElement & EventTarget }) {
			event.stopPropagation();
			// console.log(node);
			// Button clicked is same node as the event target -> reset state!
			if (activeNode.get()?.deref() === node) {
				open = false;
				PopperStore.reset();
				activeNode.set(new WeakRef({ value: null }));

				return;
			} else {
				open = true;
				activeNode.set(new WeakRef(node));
			}
			const rect = node.getBoundingClientRect();

			x = rect.left;
			y = rect.top;
			bottom = rect.bottom;

			isOpen.set(true);

			PopperStore.set({
				items,
				srcNode: node,
				direction: "normal",
				isOpen: true,
				type,
				x,
				y,
				metadata,
				bottom,
			});
			return;
		}

		node.addEventListener("click", handleClick);

		node.addEventListener("keydown", a11yClick, { capture: true });

		document.addEventListener("click", handleDocumentClick, { capture: true });
		return {
			destroy() {
				document.removeEventListener("click", handleDocumentClick, true);

				node.removeEventListener("click", handleClick, true);
				node.removeEventListener("keydown", a11yClick, true);
			},
		};
	}
</script>

<script lang="ts">
	import type { Artist } from "$lib/types";

	import Icon from "../Icon/Icon.svelte";
	import { activeNode, isOpen } from "./popperStore";

	import { PopperStore } from "./popperStore";
	export let items = [];
	export let type = "";
	export let metadata: Partial<{ thumbnail: string; title: string; artist?: Artist[] | undefined; length?: string }> =
		{};
	export let size = "1.5em";
	export let tabindex: number = 0;
</script>

<div
	class="dd-button"
	role="button"
	aria-label="menu"
	use:dropdown={{ items, metadata, type }}
	{tabindex}
>
	<Icon
		color="#f2f2f2"
		{size}
		name="dots"
	/>
</div>

<style
	src="./index.scss"
	lang="scss"
>
</style>
