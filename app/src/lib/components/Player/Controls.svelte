<script lang="ts">
	import { AudioPlayer } from "$lib/player";
	import SessionListService, {
		queue,
		type ISessionListService,
	} from "$lib/stores/list";
	import Icon from "../Icon/Icon.svelte";

	export let prevBtn: () => void;
	export let nextBtn: () => void;
	export let pause: () => void;

	export let isPaused: boolean;
	export let isQueue = false;
	export let loading: boolean;
	export let sizes = { main: "2em", skip: "1.5em" };

	let original: ISessionListService["mix"] = [];
	let isShuffled = false;

	let repeatState: 0 | 1 | 2 = 0;
	let repeatIcon: "repeat" | "repeat-1" = "repeat";
	let repeatAlpha = 0.5;

	function handleShuffle() {
		if (isShuffled === true && original.length !== 0) {
			isShuffled = false;
			SessionListService.setMix(original);
			original = [];
			return;
		}
		isShuffled = true;
		original = [...$queue];
		SessionListService.shuffle($SessionListService.position, true);
	}

	function handleRepeat() {
		++repeatState;
		switch (repeatState) {
			case 0:
				AudioPlayer.repeat("off");
				repeatIcon = "repeat";
				repeatAlpha = 0.5;
				break;
			case 1:
				repeatAlpha = 0.9;
				AudioPlayer.repeat("playlist");
				break;
			case 2:
				repeatAlpha = 0.9;
				repeatIcon = "repeat-1";
				AudioPlayer.repeat("track");
				repeatState = -1;
				break;
			default:
				AudioPlayer.repeat("off");
				repeatState = 0;
				break;
		}
	}
</script>

<div class="player-controls">
	<div class="buttons">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="player-btn"
			on:click|stopPropagation|capture={handleShuffle}
		>
			<Icon
				color="white"
				style="stroke-width:2; stroke: {isShuffled
					? '#fff'
					: 'hsla(0, 0%, 100%, 0.5)'};"
				name="shuffle"
				fill={"none"}
				size={"1em"}
			/>
		</div>
		<div class="controls-middle">
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div
				class="player-btn"
				on:click|stopPropagation|capture={prevBtn}
			>
				<Icon
					color="white"
					style="stroke-width:2; stroke: white;"
					name="skip-back"
					fill={isQueue ? "#fff" : "none"}
					size={sizes.skip}
				/>
			</div>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
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
					<div
						class="player-spinner"
						class:fade-out={loading ? true : false}
					/>
				{:else if isPaused}
					<Icon
						fill={isQueue ? "#FFF" : "none"}
						color="white"
						name="play"
						size={sizes.main}
					/>
				{:else}
					<Icon
						fill={isQueue ? "#FFF" : "none"}
						color="white"
						name="pause"
						size={sizes.main}
					/>
				{/if}
			</div>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div
				class="player-btn"
				on:click|stopPropagation|capture={nextBtn}
			>
				<Icon
					color="white"
					style="stroke-width:2; stroke: white;"
					name="skip-forward"
					fill={isQueue ? "#fff" : "none"}
					size={sizes.skip}
				/>
			</div>
		</div>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="player-btn"
			on:click|stopPropagation|capture={handleRepeat}
		>
			<Icon
				color="white"
				style="stroke-width:2; stroke: hsl(0deg 0% 100% / {repeatAlpha})"
				name={repeatIcon}
				fill={"none"}
				size={"1em"}
			/>
		</div>
	</div>
</div>

<style lang="scss">
	@import "../../../global/stylesheet/components/_player.scss";

	.player-controls {
		// margin-bottom: 0.1275em;margin-bottom
		margin-bottom: 0.2em;
	}

	.player-spinner {
		align-items: center;
		justify-content: center;
		justify-self: center;
		width: 2em;
		height: 2em;
		border: rgb(255 255 255 / 26%) solid 0.25em;
		border-radius: 50%;
		border-top-color: rgb(255 255 255 / 90.4%);
		animation: loading 1s infinite cubic-bezier(0.785, 0.135, 0.15, 0.86);
		max-width: 100%;
		max-height: 100%;
		opacity: 0;
		transition: ease-in-out 1s;
		transition-property: opacity;

		&.fade-out {
			opacity: 1;
			// transition: all ease-in-out 1s;transition
			// transition-property: opacity;transition-property
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
		justify-content: center;
		gap: 1em;
	}

	.controls-middle {
		display: flex;
		align-items: center;
	}

	.player-btn {
		max-height: 4em;
		max-width: 4em;
		padding: 0.5em;
	}
</style>
