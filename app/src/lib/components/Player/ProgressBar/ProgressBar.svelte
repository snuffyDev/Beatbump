<script
	context="module"
	lang="ts"
>
	export const progressBarSeek = writable<number>(0);
</script>

<script lang="ts">
	import { expoIn, sineIn } from "svelte/easing";
	import { fade } from "svelte/transition";

	import { AudioPlayer } from "$lib/player";
	import { format } from "$lib/utils";
	import { createEventDispatcher } from "svelte";
	import { writable } from "svelte/store";

	const { currentTimeStore, durationStore } = AudioPlayer;

	const dispatch = createEventDispatcher<{ seek: number }>();

	let isTouchDrag = false;
	let seeking = false;
	let hovering = false;
	let hoverWidth: number;
	let songBar: HTMLElement;

	function trackMouse(event: PointerEvent) {
		if (seeking) seekAudio(event);
		if (hovering) hoverEvent(event);
	}

	function seek(event: PointerEvent, bounds: DOMRect) {
		let x = event.clientX - bounds.left;

		return Math.min(Math.max(x / bounds.width, 0), 1);
	}

	function hoverEvent(event: PointerEvent) {
		if (!songBar) return;
		hoverWidth = hover(event, songBar.getBoundingClientRect());
	}

	function hover(event: PointerEvent, bounds: DOMRect) {
		const x = event.clientX - bounds.left;
		return Math.min(Math.max(x / bounds.width, 0), 1);
	}

	function seekAudio(event: PointerEvent) {
		if (!songBar) return;

		const seekTime =
			seek(event, songBar.getBoundingClientRect()) * $durationStore;
		AudioPlayer.seek(seekTime);

		progressBarSeek.set(seekTime);
	}

	$: $progressBarSeek && dispatch("seek", $progressBarSeek);
</script>

<svelte:window
	on:pointerup={() => (seeking = false)}
	on:pointermove={trackMouse}
/>
<div class="progress-container">
	<span class="timestamp secondary">{format($currentTimeStore)}</span>
	<div class="progress-bar-wrapper">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="progress-bar"
			transition:fade|global
			on:pointerover={() => {
				hovering = true;
			}}
			on:pointerup
			on:click|stopPropagation|capture={null}
			on:pointerdown|stopPropagation|capture={seekAudio}
			on:touchstart={() => {
				isTouchDrag = true;
			}}
			on:pointerleave={() => {
				hovering = false;
			}}
		>
			{#if hovering}
				<div
					class="hover"
					in:fade|global={{ duration: 180, delay: 0, easing: expoIn }}
					out:fade|global={{ duration: 240, delay: 120, easing: sineIn }}
					style="transform:scaleX({hoverWidth});"
				/>
			{/if}
			<progress
				on:touchstart={() => {
					seeking = true;
					hovering = false;
				}}
				on:pointerdown={() => {
					seeking = true;
					hovering = false;
				}}
				on:pointerup={() => {
					seeking = false;
					hovering = false;
				}}
				class:isTouchDrag
				bind:this={songBar}
				value={$currentTimeStore}
				max={$durationStore}
			/>
		</div>
	</div>

	<span class="timestamp secondary">{format($durationStore)}</span>
</div>

<style
	src="./index.scss"
	lang="scss"
>
</style>
