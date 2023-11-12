<svelte:options immutable={true} />

<script
	lang="ts"
	context="module"
>
	function dropdown(
		node: HTMLElement,
		{
			items,
			metadata,
			type,
		}: {
			items: any[];
			type: string;
			metadata: Partial<{
				thumbnail: Thumbnail[];
				title: string;
				artist?: Artist[] | undefined;
				length?: string;
			}>;
		},
	) {
		let x: number, y: number, bottom: number;
		let open = false;
		const a11yClick = (e: KeyboardEvent) => {
			if (e.key !== "Space") return;
			node.click();
			open = false;
		};

		function handleDocumentClick(event: MouseEvent) {
			const target = event.target as HTMLElement;
			if (open && !node.contains(target) && !node.isSameNode(target)) {
				isOpen.set(false);
				open = false;
				PopperStore.reset();
				activeNode.set(new WeakRef({ value: null }));
			}
		}

		function handleClick(event: MouseEvent) {
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

		node.addEventListener("click", handleClick, { capture: true });

		node.addEventListener("keydown", a11yClick, { capture: true });

		document.addEventListener("click", handleDocumentClick, { capture: true });
		return {
			destroy() {
				document.removeEventListener("click", handleDocumentClick, true);

				node.removeEventListener("click", handleClick, true);
				node.removeEventListener("keydown", a11yClick, true);
			},
			update(newOptions: { items: any[]; type: string; metadata: any }) {
				items = newOptions.items;
				type = newOptions.type;
				metadata = newOptions.metadata;
			},
		};
	}
</script>

<script lang="ts">
	import type { Artist, Thumbnail } from "$lib/types";

	import Icon from "../Icon/Icon.svelte";
	import { activeNode, isOpen, PopperStore } from "./popperStore";

	export let items: any[] = [];
	export let type = "";
	export let metadata: Partial<{
		thumbnail: Thumbnail[];
		title: string;
		artist?: Artist[] | undefined;
		length?: string;
	}> = {};
	export let size = "1.5rem";
	export let tabindex = 0;
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
		strokeWidth={2}
		{size}
		name="dots"
	/>
</div>

<style
	src="./index.scss"
	lang="scss"
>
</style>
