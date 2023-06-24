<script lang="ts">
	import ListItem from "$components/ListItem/ListItem.svelte";
	import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
	import SessionListService from "$stores/list/sessionList";

	// eslint-disable-next-line no-undef
	export let items: IListItemRenderer[] = [];

	let touchTimer: ReturnType<typeof setTimeout>;
	let isDragging = false;
	let currentDragId: number | null = null;
	let dragOverId: number | null = null;
	let dragY = 0;
	let clickCounter = 0;
$:console.log(items)
	const finishDrag = () => {
		currentDragId = null;
		dragOverId = null;
	};

	function handleDragStart(event: DragEvent, startId: number) {
		currentDragId = startId;

		dragY = event.clientY;
		const target = event.target;
		if (
			!target ||
			!("parentElement" in target) ||
			!(target.parentElement instanceof HTMLElement)
		)
			return;
	}

	function handleDragEnd(event: DragEvent) {
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
		finishDrag();
	}

	function handleDragOver(event: DragEvent, overId: number) {
		dragOverId = overId;
		if (overId === dragOverId) return;
		if (dragOverId !== null && currentDragId !== null) {
			[items[currentDragId], items[dragOverId]] = [
				items[dragOverId],
				items[currentDragId],
			];
		}
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
		alert("touchend");
		if (touchTimer) clearTimeout(touchTimer);
		isDragging = false;
	}}
	style="overflow-y: {isDragging ? 'hidden' : 'auto'};"
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
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="list-item"
			class:drag-target={currentDragId === index}
			on:touchstart={() => {
				if (touchTimer) clearTimeout(touchTimer);
				touchTimer = setTimeout(() => {
					isDragging = true;
				}, 500);
			}}
			on:drag={(event) => {
				const target = event.target;
				if (
					!target ||
					!("getBoundingClientRect" in target) ||
					typeof target.getBoundingClientRect !== "function"
				)
					return;
				dragY = event.target.parentElement.scrollTop + event.clientY;
			}}
			on:dragend={handleDragEnd}
			on:dragover|preventDefault={(event) => handleDragOver(event, index)}
			on:dragstart={(event) => {
				if (touchTimer) clearTimeout(touchTimer);
				setTimeout(() => handleDragStart(event, index), 500);
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
		max-height: 100%;
		max-width: 100%;
		visibility: visible;
	}
	.drag-target {
		opacity: 0;
	}
	.ghost {
		position: absolute;
		top: 0;
		left: 0;
		will-change: transform, top;
		width: 100%;
		pointer-events: none;
	}
</style>
