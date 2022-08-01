<script lang="ts">
	import { AudioPlayer } from "$lib/player";
	import { playerLoading } from "$lib/stores";
	import { queue } from "$lib/stores/list";
	import Icon from "../Icon/Icon.svelte";
	const { paused } = AudioPlayer;

	$: isPaused = $paused;
</script>

<div
	class="player-btn player-title"
	on:click={(e) => {
		if (!$queue) return;
		if (isPaused) {
			// console.log(e)
			// AudioPlayer.play(e)
			AudioPlayer.play(e);
		} else {
			AudioPlayer.pause();
		}
	}}
>
	{#if $playerLoading}
		<div class="player-spinner" class:fade-out={$playerLoading ? true : false} />
	{:else if isPaused}
		<Icon color="white" name="play-player" size={"1.625em"} />
	{:else}
		<Icon color="white" name="pause" size={"1.625em"} />
	{/if}
</div>

<style lang="scss">
	@import "../../../global/stylesheet/components/_player.scss";
</style>
