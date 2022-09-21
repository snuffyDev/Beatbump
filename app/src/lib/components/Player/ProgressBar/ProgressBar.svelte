<script lang="ts">
	import { expoIn, sineIn } from "svelte/easing";

	import { fade } from "svelte/transition";

	import { AudioPlayer } from "$lib/player";
	import { format } from "$lib/utils";
	const { currentTimeStore, durationStore } = AudioPlayer;

	let isTouchDrag = false;
	let seeking = false;
	let hovering = false;
	let hoverWidth;
	let songBar: HTMLElement;
	function trackMouse(event: PointerEvent) {
		if (seeking) seekAudio(event);
		if (hovering) hoverEvent(event);
	}

	function seek(event, bounds) {
		let x = event.clientX - bounds.left;

		return Math.min(Math.max(x / bounds.width, 0), 1);
	}

	function hoverEvent(event) {
		if (!songBar) return;
		hoverWidth = hover(event, songBar.getBoundingClientRect());
	}

	function hover(event, bounds) {
		const x = event.clientX - bounds.left;
		return Math.min(Math.max(x / bounds.width, 0), 1);
	}

	function seekAudio(event: PointerEvent) {
		if (!songBar && !AudioPlayer.player.src) return;

		AudioPlayer.seek(seek(event, songBar.getBoundingClientRect()) * $durationStore);
	}
</script>

<svelte:window on:pointerup={() => (seeking = false)} on:pointermove={trackMouse} />
<div class="progress-container">
	<span class="timestamp secondary">{format($currentTimeStore)}</span>
	<div class="progress-bar-wrapper">
		<div
			class="progress-bar"
			transition:fade
			on:pointerover={(e) => {
				hovering = true;
			}}
			on:click|stopPropagation|capture={() => {}}
			on:pointerdown|stopPropagation|capture={seekAudio}
			on:touchstart={() => {
				isTouchDrag = true;
			}}
			on:pointerleave={(event) => {
				hovering = false;
			}}
		>
			{#if hovering}
				<div
					class="hover"
					in:fade={{ duration: 180, delay: 0, easing: expoIn }}
					out:fade={{ duration: 240, delay: 120, easing: sineIn }}
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

<style src="./index.scss" lang="scss">
</style>
