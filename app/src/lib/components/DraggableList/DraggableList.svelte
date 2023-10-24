<script
	lang="ts"
	generics="T extends Song | IListItemRenderer"
>
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
	import type { Song } from "$lib/types";

	// eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
	import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";

	import ListItem from "$components/ListItem/ListItem.svelte";
	import { SessionListService } from "$stores/list/sessionList";
	import { createEventDispatcher } from "svelte";

	// eslint-disable-next-line no-undef
	export let items: T[] = [];
	export let style = "";

	const dispatch = createEventDispatcher<{
		click: void;
		dragstart: { event: DragEvent; index: number };
		dragend: { event: DragEvent; index: number };
		drag: { event: DragEvent; index: number };
		dragover: { event: DragEvent; index: number };
	}>();

	let touchTimer: ReturnType<typeof setTimeout> | undefined;
	let dragTimer: ReturnType<typeof setTimeout> | undefined;
	let isDragging = false;
	let currentDragId: number | null = null;
	let dragOverId: number | null = null;
	let dragY = 0;

	const finishDrag = () => {
		currentDragId = null;
		dragOverId = null;
		isDragging = false;
	};

	function handleDragStart(event: DragEvent, startId: number) {
		const target = event.target;
		event.dataTransfer?.setDragImage(new Image(), 0, 0);
		dragTimer = setTimeout(() => {
			currentDragId = startId;
			dragY = event.clientY;
			dispatch("dragstart", { event, index: currentDragId });
			isDragging = true;
		}, 250);

		if (
			!target ||
			!("parentElement" in target) ||
			!(target.parentElement instanceof HTMLElement)
		)
			return;
	}

	function handleDragEnd(event: DragEvent) {
		if (dragTimer) {
			dispatch("click");
			clearTimeout(dragTimer);
			dragTimer = undefined;
		}
		if (dragOverId !== null && currentDragId !== null) {
			[items[currentDragId], items[dragOverId]] = [
				items[dragOverId],
				items[currentDragId],
			];
			currentDragId = dragOverId;

			[
				$SessionListService.mix[currentDragId],
				$SessionListService.mix[dragOverId],
			] = [
				$SessionListService.mix[dragOverId],
				$SessionListService.mix[currentDragId],
			];
		}
		dispatch("dragend", { event, index: currentDragId as number });
		finishDrag();
	}

	function handleDragOver(event: DragEvent, overId: number) {
		dragOverId = overId;
		if (overId === dragOverId) return;
		if ((dragOverId || overId) === null) return;
		if (dragOverId !== null && currentDragId !== null) {
			// [items[currentDragId], items[dragOverId]] = [
			// 	items[dragOverId],
			// 	items[currentDragId],
			// ];
		}
		dispatch("dragover", { event, index: currentDragId as number });
	}

	$: {
		if (dragOverId !== null && currentDragId !== null) {
			[items[currentDragId], items[dragOverId]] = [
				items[dragOverId],
				items[currentDragId],
			];

			currentDragId = dragOverId;
		}
	}
</script>

<div
	class="list"
	on:touchend={() => {
		if (touchTimer) clearTimeout(touchTimer);
		isDragging = false;
	}}
	style="overflow-y: {isDragging ? 'hidden' : 'auto'}; {style}"
>
	{#if currentDragId !== null}
		<div
			class="ghost"
			style="transform: translateY(calc({dragY}px - 10rem)); pointer-events:none; "
		>
			<ListItem
				item={items[currentDragId]}
				idx={currentDragId}
			/>
		</div>
	{/if}
	{#each items as item, index (item)}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="list-item"
			class:dragging={isDragging}
			class:drag-target={currentDragId === index}
			on:touchstart={() => {
				if (touchTimer) clearTimeout(touchTimer);
				touchTimer = setTimeout(() => {
					touchTimer = undefined;
					isDragging = true;
				}, 800);
			}}
			on:touchmove={() => {
				if (isDragging) return;
				if (touchTimer) clearTimeout(touchTimer);
			}}
			on:drag={(event) => {
				const target = event.target;
				if (
					!target ||
					!("getBoundingClientRect" in target) ||
					typeof target.getBoundingClientRect !== "function"
				)
					return;
				if (
					target &&
					"parentElement" in target &&
					target.parentElement instanceof HTMLElement
				) {
					dragY = target.parentElement.scrollTop + event.clientY;
				}
			}}
			on:dragend={handleDragEnd}
			on:dragover|preventDefault={(event) => handleDragOver(event, index)}
			on:dragstart={(event) => {
				if (touchTimer) clearTimeout(touchTimer);
				handleDragStart(event, index);
			}}
		>
			<slot
				name="item"
				{item}
				{index}
			/>
		</div>
	{/each}
</div>

<style lang="scss">
	.list {
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		position: relative;
		// max-height: 100%;
		min-height: 100%;
		height: 100%;
		max-width: 100%;
		visibility: visible;
	}
	.drag-target {
		opacity: 0;
	}
	.list-item.dragging,
	:global(.list-item.dragging > *) {
		-webkit-touch-callout: none !important;
		-webkit-user-select: none !important;
		-webkit-user-drag: none !important;
		-khtml-user-select: none !important;
		-moz-user-select: none !important;
		-ms-user-select: none !important;
		user-select: none !important;
	}
	.ghost {
		position: absolute;
		top: 0;
		transition: transform 280ms cubic-bezier(0.23, 1, 0.32, 1);
		// background-color:  !important;
		:global(& + *) {
			// background-color: red !important;
		}
		opacity: 0.4;
		left: 0;
		will-change: transform, top;
		width: 100%;
		pointer-events: none;
	}
</style>
