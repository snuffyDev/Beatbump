<svelte:options immutable={true} />

<script lang="ts">
	import { AudioPlayer } from "$lib/player";
	import { playerLoading } from "$lib/stores";
	import { queue } from "$lib/stores/list";
	import Icon from "../Icon/Icon.svelte";
	const { paused } = AudioPlayer;

	$: isPaused = $paused;
	$: console.log(isPaused);
	function handleButtonPress() {
		if (!$queue) return;
		if (isPaused) {
			// console.log(e)
			// AudioPlayer.play(e)
			return AudioPlayer.play();
		} else {
			AudioPlayer.pause();
		}
	}
</script>

<div
	class="player-btn player-title"
	on:click|capture|stopPropagation={handleButtonPress}
	on:keydown|capture|stopPropagation={handleButtonPress}
>
	{#if $playerLoading}
		<div
			class="player-spinner"
			class:fade-out={$playerLoading ? true : false}
		/>
	{:else if isPaused}
		<Icon
			color="white"
			name="play"
			size={"24px"}
		/>
	{:else}
		<Icon
			color="white"
			name="pause"
			size={"1.625rem"}
		/>
	{/if}
</div>

<style lang="scss">
	@import "../../../global/stylesheet/components/_player.scss";
</style>
