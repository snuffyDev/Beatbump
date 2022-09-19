<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { updateTrack } from "$lib/stores/stores";
	import Icon from "../Icon/Icon.svelte";
	import SessionListService from "$lib/stores/list";
	import { AudioPlayer } from "$lib/player";
	// export let canPlay
	export let prevBtn;
	export let nextBtn;
	export let isPaused;
	export let pause;
	export let loading;
	export let isQueue = false;
	export let sizes = { main: "2em", skip: "1.5em" };
	const dispatch = createEventDispatcher();

	const playEvent = () => dispatch("play");
</script>

<div class="player-controls">
	<div class="buttons">
		<div class="player-btn" on:click|stopPropagation|capture={prevBtn}>
			<Icon
				color="white"
				style="stroke-width:2; stroke: white;"
				name="skip-back"
				fill={isQueue ? "#fff" : "none"}
				size={sizes.skip}
			/>
		</div>
		<div
			class="player-btn player-title"
			on:click|stopPropagation|capture={(e) => {
				if (!$SessionListService.mix) return;
				if (isPaused) {
					// console.log(e)
					// AudioPlayer.play(e)
					AudioPlayer.play(e);
				} else {
					pause();
				}
			}}
		>
			{#if loading}
				<div class="player-spinner" class:fade-out={loading ? true : false} />
			{:else if isPaused}
				<Icon fill={isQueue ? "#FFF" : "none"} color="white" name="play" size={sizes.main} />
			{:else}
				<Icon fill={isQueue ? "#FFF" : "none"} color="white" name="pause" size={sizes.main} />
			{/if}
		</div>
		<div class="player-btn" on:click|stopPropagation|capture={nextBtn}>
			<Icon
				color="white"
				style="stroke-width:2; stroke: white;"
				name="skip-forward"
				fill={isQueue ? "#fff" : "none"}
				size={sizes.skip}
			/>
		</div>
	</div>
</div>

<style lang="scss">
	@import "../../../global/stylesheet/components/_player.scss";

	.player-controls {
		// margin-bottom: 0.1275em;
		margin-bottom: 0.2em;
	}

	.player-spinner {
		align-items: center;
		justify-content: center;
		justify-self: center;
		width: 2em;

		height: 2em;
		border: rgba(255, 255, 255, 0.26) solid 0.25em;
		border-radius: 50%;
		border-top-color: rgba(255, 255, 255, 0.904);
		animation: loading 1s infinite cubic-bezier(0.785, 0.135, 0.15, 0.86);
		max-width: 100%;
		max-height: 100%;
		opacity: 0;

		transition: ease-in-out 1s;
		transition-property: opacity;
		&.fade-out {
			opacity: 1;
			// transition: all ease-in-out 1s;
			// transition-property: opacity;
		}
	}
	@keyframes loading {
		to {
			transform: rotate(360deg);
		}
	}
	@keyframes loaddone {
		to {
		}
	}
	.buttons {
		gap: 1em;
	}

	.player-btn {
		max-height: 4em;
		max-width: 4em;
		padding: 0.5em;
	}
</style>
