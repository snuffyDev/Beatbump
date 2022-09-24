<script lang="ts">
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import Icon from "$components/Icon/Icon.svelte";
	import { clickOutside } from "$lib/actions/clickOutside";
	import { IMAGE_NOT_FOUND } from "$lib/constants";
	import { IDBService } from "$lib/workers/db/service";
	import { AudioPlayer } from "$lib/player";
	import { groupSession, isMobileMQ } from "$lib/stores";
	import list, { currentTrack, queue, queuePosition } from "$lib/stores/list";
	import { IsoBase64 } from "$lib/utils";
	import { messenger } from "$lib/utils/sync";
	import { notify } from "$lib/utils";
	import { playerLoading, showAddToPlaylistPopper, showGroupSessionCreator } from "$stores/stores";
	import { PopperButton } from "../Popper";
	import { fullscreenStore } from "./channel";
	import Controls from "./Controls.svelte";
	import keyboardHandler from "./keyboardHandler";
	import ProgressBar from "./ProgressBar";

	import { page } from "$app/stores";
	import { SITE_ORIGIN_URL } from "$stores/url";

	const { paused } = AudioPlayer;
	let volume = 0.5;
	let volumeHover;

	$: isPlaying = $paused;
	let innerWidth = 640;
	messenger.listen("player", (data) => {
		AudioPlayer.play();
	});

	function handleImageError(event: Event & { currentTarget: EventTarget & HTMLElement }) {
		(event.target as HTMLImageElement).src = IMAGE_NOT_FOUND;
	}

	$: DropdownItems = [
		{
			text: "View Artist",
			icon: "artist",
			action: () => {
				window.scrollTo({
					behavior: "smooth",
					top: 0,
					left: 0,
				});
				goto(`/artist/${$currentTrack.artistInfo.artist[0].browseId}`);
			},
		},
		{
			text: "Add to Playlist",
			icon: "list-plus",
			action: async () => {
				showAddToPlaylistPopper.set({ state: true, item: $currentTrack });
			},
		},
		{
			text: "Add to Favorites",
			icon: "heart",
			action: async () => {
				if (!browser) return;
				IDBService.sendMessage("create", "favorite", $currentTrack);
			},
		},
		!groupSession.hasActiveSession
			? {
					text: "Start Group Session",
					icon: "users",
					action: async () => {
						if (!browser) return;
						showGroupSessionCreator.set(true);
					},
			  }
			: {
					text: "Share Group Session",
					icon: "share",
					action: async () => {
						if (!browser) return;
						const shareData = {
							title: `Join ${groupSession.client.displayName}'s Beatbump Session`,

							url: `${$SITE_ORIGIN_URL}/session?token=${IsoBase64.toBase64(
								JSON.stringify({
									clientId: groupSession.client.clientId,
									displayName: groupSession.client.displayName,
								}),
							)}`,
						};
						try {
							if (!navigator.canShare) {
								await navigator.clipboard.writeText(shareData.url);
								notify("Link copied successfully", "success");
							} else {
								const share = await navigator.share(shareData);
								notify("Shared successfully", "success");
							}
						} catch (error) {
							notify("Error: " + error, "error");
						}
					},
			  },
		{
			text: "Shuffle",
			icon: "shuffle",
			action: () => {
				list.shuffle($queuePosition, true);
			},
		},
	].filter((item) => {
		{
			if (!$currentTrack?.artistInfo?.artist[0]?.browseId) {
				return;
			} else {
				return item;
			}
		}
	});

	const shortcut = {
		Comma: () => {
			AudioPlayer.previous();
		},
		Period: () => {
			AudioPlayer.next(true);
		},
		Space: () => {
			if (!AudioPlayer && !AudioPlayer.src) return;
			if (AudioPlayer.paused) {
				AudioPlayer.play();
			} else {
				AudioPlayer.pause();
			}
		},
	};
</script>

<svelte:window bind:innerWidth />
<!-- <Fullscreen /> -->
<div
	class="player"
	on:click={(e) => {
		fullscreenStore.toggle();
	}}
	use:keyboardHandler={{ shortcut }}
>
	<div class="now-playing" style="align-items:center;">
		{#if $queue.length !== 0}
			<img
				width="64"
				height="64"
				on:error|capture={handleImageError}
				src={$currentTrack?.thumbnails?.[0]?.url ?? IMAGE_NOT_FOUND}
				alt="{$currentTrack?.title} thumbnail image"
			/>
			<div
				class="container"
				style="
    font-weight: 400;
    font-family: 'CommissionerVariable';
    letter-spacing: -0.02em;"
			>
				<span class="now-playing-title">{$currentTrack?.title}</span>
				<span class="now-playing-artist">{$currentTrack.artistInfo?.artist[0]?.text}</span>
			</div>
		{:else}
			<img
				width="64"
				height="64"
				on:error={(event) => handleImageError(event)}
				style="object-fit:scale-down; background: #000;"
				src={IMAGE_NOT_FOUND}
				alt=""
			/>
			<div class="container" style="gap:0.20125em;">
				<span>Not Playing</span>
				<div />
			</div>
		{/if}
	</div>
	<div class="player-controls" style:display={$isMobileMQ ? "none" : "block"}>
		{#if !$isMobileMQ}
			<Controls
				bind:isPaused={isPlaying}
				bind:loading={$playerLoading}
				on:play={() => AudioPlayer.play()}
				pause={() => AudioPlayer.pause()}
				nextBtn={() => {
					if ($queue.length === 0) return;
					AudioPlayer.next(true, groupSession.hasActiveSession ? true : false);
					// AudioPlayer.updateTime($durationStore);
				}}
				prevBtn={() => AudioPlayer.previous(true)}
			/>
			<ProgressBar />
		{/if}
	</div>

	<div class="player-right">
		<div class="container row" style="gap:0.5em;">
			<div
				class="volume "
				on:pointerleave={() => {
					volumeHover = false;
				}}
				use:clickOutside
				on:click_outside={() => (volumeHover = false)}
			>
				<div
					color="white"
					class="volume-icon player-btn"
					on:pointerover={() => {
						volumeHover = true;
					}}
					on:click|capture|stopPropagation={() => (volumeHover = !volumeHover)}
				>
					<Icon color="white" name="volume" size="1.625em" />
				</div>
				{#if volumeHover}
					<div class="volume-wrapper">
						<div class="volume-slider">
							<input
								class="volume"
								type="range"
								on:click|capture|stopPropagation={() => {}}
								on:input|capture|stopPropagation={(e) => {
									let linear = e.target.value / 1;
									let sqrt = Math.pow(linear, 1.2);
									AudioPlayer.volume = sqrt;
								}}
								bind:value={volume}
								min="0"
								max="1"
								step="any"
							/>
						</div>
					</div>
				{/if}
			</div>
			<div style="background:inherit;">
				<div
					on:click|capture|stopPropagation={() => {
						if (!$queue) return;
						fullscreenStore.toggle();
					}}
					class="listButton player-btn"
				>
					<Icon color="white" name="queue" size="1.625em" />
				</div>
			</div>
			<div class="menu-container">
				<PopperButton tabindex="-1" type="player" size="1.625em" items={DropdownItems} />
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	@import "../../../global/stylesheet/components/_player.scss";
	.now-playing {
		display: flex;
		grid-area: n;
		line-height: 1.7;
		font-size: 0.95em;
		gap: 0.95em;
		@media screen and (min-width: 720px) {
			line-height: 1.6;
			font-size: 14px;
			// gap: 0.875em;
		}
		.container {
			visibility: visible;
			display: flex;
			// }
		}
	}
	:where(.now-playing) title {
		display: block;
		white-space: nowrap;
		text-overflow: ellipsis;
		max-width: calc(100% - 0.2em);
		overflow: hidden;

		font-size: small;
	}
	.now-playing-artist {
		display: block;
		font-size: 12px;
		color: rgba(255, 255, 255, 0.7) !important;
	}
	.now-playing img {
		object-fit: contain;
		background: #000;
		max-height: 4.25rem;
		max-width: 4.25rem;
		width: 100%;
	}
	.player-controls {
		// display: flex;
		// place-self: center;

		width: 100%;
	}
	row {
		position: relative;
	}
	.hidden {
		display: none !important;
		visibility: hidden !important;
	}

	.volume {
		position: relative;
		will-change: visibility, display;
		@media screen and (max-width: 575.75px) {
			visibility: hidden;
			display: none;
		}
	}

	.listButton {
		visibility: hidden !important;
	}
	.player {
		background-color: inherit;
	}
	.volume-wrapper {
		background: var(--dark-bottom);
		display: flex;

		position: absolute;
		bottom: 6.5rem;
		transform: rotate(-90deg);
		padding: 0 0.4rem;
		left: calc(calc(100% * -1) + 16px);
		height: 1.3rem;
		border-radius: 0.6rem;
		isolation: isolate;
		z-index: 100;
		&::before {
			content: "";
			position: absolute;
			width: 100%;
			// bottom: 0;
			// inset: 0;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			height: 5rem;
		}
	}
	.volume-slider {
		height: 100%;
		display: flex;
		align-items: center;
	}
	.volume-icon {
		cursor: pointer;
	}

	.menu-container {
		padding: 0;
		position: relative;
		will-change: position;
		// margin-right: 8%;
		// grid-area: r;
		place-self: flex-end;
		align-self: center;
		@media screen and (max-width: 500px) {
			position: relative !important;
			place-self: center;
		}
	}

	.player-left,
	.player-right {
		align-self: center;

		align-items: center;
	}
	.player-right {
		grid-area: r;
		display: inline-flex;
		justify-content: end;
		.container {
			width: auto;
		}
	}
	@media screen and (min-width: 720px) {
		.listButton {
			visibility: visible !important;
		}
	}
</style>
