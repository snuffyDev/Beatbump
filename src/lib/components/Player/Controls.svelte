<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { updateTrack } from "$lib/stores/stores";
	import Icon from "../Icon/Icon.svelte";
	// export let canPlay
	export let prevBtn;
	export let nextBtn;
	export let isPlaying;
	export let pause;
	export let loading;
	const dispatch = createEventDispatcher();

	const playEvent = () => dispatch("play");
</script>

<div class="player-controls">
	<div class="buttons">
		<div class="player-btn" on:click={prevBtn}>
			<Icon color="white" name="skip-back" size="1.8em" />
		</div>
		<div
			class="player-btn player-title"
			on:click={(e) => {
				if (!$updateTrack) return;
				if (!isPlaying) {
					// console.log(e)
					playEvent();
				} else {
					pause();
				}
			}}
		>
			{#if loading}
				<div class="player-spinner" class:fade-out={loading ? true : false} />
			{:else if !isPlaying}
				<Icon color="white" name="play-player" size="2em" />
			{:else}
				<Icon color="white" name="pause" size="2em" />
			{/if}
		</div>
		<div class="player-btn" on:click={nextBtn}>
			<Icon color="white" name="skip-forward" size="1.8em" />
		</div>
	</div>
</div>

<style lang="scss">
	@import "../../../global/stylesheet/components/_player.scss";
	.player-btn {
		padding: 8pt;
	}
	.player-spinner {
		align-items: center;
		justify-content: center;
		justify-self: center;
		width: 2rem;

		height: 2rem;
		border: rgba(255, 255, 255, 0.26) solid 0.25em;
		border-radius: 50%;
		border-top-color: rgba(255, 255, 255, 0.904);
		animation: loading 1s infinite cubic-bezier(0.785, 0.135, 0.15, 0.86);
		max-width: 100%;
		max-height: 100%;
		opacity: 0;

		transition: all ease-in-out 1s;
		&.fade-out {
			opacity: 1;
			transition: all ease-in-out 1s;
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
</style>
