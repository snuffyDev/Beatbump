<script lang="ts">
	export let data: Item;

	import Loading from "$components/Loading/Loading.svelte";
	import { hasContext, onMount, tick } from "svelte";

	import { showAddToPlaylistPopper, showGroupSessionCreator } from "$stores/stores";
	import Icon from "$components/Icon/Icon.svelte";
	import { goto } from "$app/navigation";
	import list, { queue, queuePosition, currentTrack } from "$lib/stores/list";
	import type { Item } from "$lib/types";
	import { IDBService } from "$lib/workers/db/service";
	import { browser } from "$app/environment";
	import { createEventDispatcher } from "svelte";
	import { PopperButton, PopperStore } from "../Popper";
	import { filter, Logger, notify } from "$lib/utils";
	import { groupSession } from "$lib/stores";

	import { IsoBase64 } from "$lib/utils";
	import { page } from "$app/stores";
	import { SITE_ORIGIN_URL } from "$stores/url";

	const dispatch = createEventDispatcher();
	let isLibrary = hasContext("library") ? true : false;
	let videoId = "";
	let playlistId = "";
	let isHidden: boolean = false;
	let isArtist = Array.isArray(data?.subtitle) && data.subtitle[0]?.text === "Artist";
	let clicked;

	let hidden = clicked ? true : false;
	let loading = false;

	let DropdownItems = [
		{
			text: "View Artist",
			icon: "artist",
			action: async () => {
				window.scrollTo({
					behavior: "smooth",
					top: 0,
					left: 0,
				});

				await tick();
				goto(`/artist/${data?.artistInfo ? data.artistInfo.artist[0].browseId : data?.subtitle[0].browseId}`);
			},
		},
		{
			text: "Go to album",
			icon: "album",
			action: () => {
				window.scrollTo({
					behavior: "smooth",
					top: 0,
					left: 0,
				});
				goto(`/release?id=${data?.album?.browseId}`);
			},
		},
		{
			text: "Play Next",
			icon: "list-music",
			action: () =>
				groupSession.hasActiveSession
					? groupSession.addToQueue(data, $queuePosition)
					: list.setTrackWillPlayNext(data, $queuePosition),
		},
		{
			text: "Add to Queue",
			icon: "list-music",
			action: () =>
				groupSession.hasActiveSession
					? groupSession.addToQueue(data, $queue.length)
					: list.setTrackWillPlayNext(data, $queue.length),
		},

		{
			text: "Add to Playlist",
			icon: "list-plus",
			action: async () => {
				if (data?.endpoint?.pageType.match(/PLAYLIST|ALBUM|SINGLE/)) {
					// console.log('PLAYLIST')
					const response = await fetch("/api/v1/get_queue.json?playlistId=" + data?.playlistId);
					const _data = await response.json();
					const items: Item[] = _data;
					showAddToPlaylistPopper.set({ state: true, item: [...items] });
				} else {
					showAddToPlaylistPopper.set({ state: true, item: data });
				}
			},
		},
		{
			text: !isLibrary ? "Favorite" : "Remove from Favorites",
			icon: !isLibrary ? "heart" : "x",
			action: async () => {
				// console.log(data)
				if (!browser) return;
				!isLibrary && IDBService.sendMessage("create", "favorite", data);
				if (isLibrary) {
					await IDBService.sendMessage("delete", "favorite", data);
					dispatch("update");
				}
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
					text: "Invite Group Session",
					icon: "send",
					action: async () => {
						if (!browser) return;
						const shareData = {
							title: `Join ${groupSession.client.displayName}'s Group Session on Beatbump!`,

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
			text: "Share",
			icon: "share",
			action: async () => {
				const shareData = {
					title: data.title,

					url: `${$SITE_ORIGIN_URL}/listen?id=${data.videoId}`,
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
	];
	if (isArtist) {
		DropdownItems = [...DropdownItems.filter((item) => !item.text.includes("Add to Playlist"))];
	}
	if (data.type === "playlists") {
		DropdownItems.splice(1, 1, {
			text: "View Playlist",
			icon: "list",
			action: () => {
				window.scrollTo({
					behavior: "smooth",
					top: 0,
					left: 0,
				});
				goto(`/playlist/${data?.browseId}`);
			},
		});
		DropdownItems.shift();
		DropdownItems.pop();
		DropdownItems = [...DropdownItems.filter((item) => !item.text.includes("Favorite"))];
	}
	if (data.type === "videos") {
		DropdownItems = DropdownItems.filter((d) => {
			if (d.text === "View Artist") return;
		});
	}

	if (data?.album?.browseId === undefined) {
		DropdownItems = filter(DropdownItems, (d) => d.text !== "Go to album");
	}
	if (isArtist) {
		DropdownItems = filter(DropdownItems, (d) => d.text !== "View Artist");
	}
	const clickHandler = async (event) => {
		if (
			(event.target instanceof HTMLElement && (event.target.nodeName == "A" || event.target.nodeName == "P")) ||
			loading
		)
			return;
		// console.log(event.target)
		if (isArtist) {
			goto(`/artist/${data.artistInfo.artist[0].browseId}`);
			return;
		}
		try {
			loading = true;
			console.log(data);
			videoId = data.videoId ? data.videoId : "";
			playlistId = data?.playlistId ? data?.playlistId : data.shuffle?.playlistId ? data.shuffle?.playlistId : "";
			if (data.type === "playlist" || data.type === "albums") {
				await list.initPlaylistSession({ playlistId, index: 0 });
			} else {
				await list.initAutoMixSession({
					videoId: videoId,
					playlistId: playlistId,
					keyId: 0,
					clickTracking: data.params,
					config: { playerParams: data.playerParams, type: data.musicVideoType },
				});
			}
			loading = false;
			return;
		} catch (error) {
			Logger.err(error);
			return;
		}
	};
</script>

<div
	class="container"
	on:contextmenu|preventDefault={(e) => {
		window.dispatchEvent(new window.CustomEvent("contextmenu", { detail: "listing" }));

		PopperStore.set({
			items: [...DropdownItems],
			x: e.pageX,
			y: e.pageY,
			direction: "right",
		});
	}}
>
	<div class="innercard">
		<div class="itemWrapper" on:click|stopPropagation={clickHandler}>
			<div class="img-container" class:artist-img={isArtist}>
				{#if loading}
					<Loading size="3em" />
				{/if}
				<div class="thumbnail">
					<!-- svelte-ignore a11y-missing-attribute -->
					<img
						id="img"
						decoding="async"
						loading="lazy"
						src={data.thumbnails ? data.thumbnails[0]?.url : data.thumbnail}
						alt="thumbnail"
					/>
				</div>
			</div>
			<div class="title">
				<p class="text-title">
					{data.title}
					<span class="explicit" class:hidden={!data.explicit}> E </span>
				</p>
				{#if data.type === "artists"}
					<p class="artist-stats">
						{#each data.subtitle as subtitle}
							{subtitle.text}
						{/each}
					</p>
				{:else if data.type === "playlist"}
					<p class="text-artist">
						{data.type == "playlist" ? `${data.metaData}` : ""}
					</p>
				{:else}
					<p class="text-artist secondary">
						{#each data?.subtitle as artist, i}
							{#if !artist.pageType}
								{artist.text}
							{:else if artist.pageType.includes("ALBUM")}
								<a
									on:click|preventDefault={() => goto(`/release/${artist?.browseId}`)}
									href={`/release/${artist?.browseId}`}>{artist.text}</a
								>
							{:else}
								<a
									on:click|preventDefault={() => goto(`/artist/${artist?.browseId}`)}
									href={`/artist/${artist?.browseId}`}>{artist.text}</a
								>
							{/if}
						{/each}
					</p>
				{/if}
			</div>
		</div>

		<div class="menu">
			<PopperButton
				metadata={{
					artist:
						data.type !== "playlist" && Array.isArray(data?.artistInfo?.artist)
							? [...data?.artistInfo?.artist]
							: data?.artistInfo?.artist ?? undefined,
					thumbnail: data.thumbnails ? data.thumbnails[0]?.url : data.thumbnail,
					title: data.title,
					length: data.type !== "artist" && data.type !== "playlist" ? data?.length?.text : "",
				}}
				type="search"
				items={DropdownItems}
			/>
		</div>
	</div>
</div>

<style lang="scss">
	@use "../../../global/stylesheet/base/mixins";
	.menu {
		padding-right: 0.6em;
	}
	.hidden {
		display: none !important;
		visibility: hidden !important;
	}
	.album,
	.artist-stats {
		font-size: 0.9em;
		font-weight: 400;
		align-items: center;
		/* white-space: revert; */
		display: inline-flex;
		pointer-events: auto;
		a {
			margin-left: 0.25em;
		}
	}
	.itemWrapper {
		display: flex;
		width: 100%;
		margin: 0;
		padding: 0.3em 0.3em 0.3em 0.6em;
		flex-direction: row;
		flex-wrap: nowrap;
		align-items: center;
	}
	p {
		margin: 0.2rem 0;
	}
	.container:not(.menu) {
		cursor: pointer;
		display: flex;
		flex: 1 1 auto;
		width: 100%;
		flex-direction: row;
		flex-wrap: nowrap;
		background: transparent;
		transition: cubic-bezier(0.25, 0.46, 0.45, 0.94) background 0.125s;
		max-width: unset !important;
		contain: paint;
		&:active,
		&:hover {
			background: lighten(#3c3d4159, 3%);
			// filter: brightness(0.7);
		}
	}

	.text-artist {
		font-size: 0.925em;
		margin-top: 0;
		@include mixins.trim(2);
	}
	.text-title {
		font-size: 1em;

		font-weight: 400;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		display: block;
		max-width: calc(100% - 2ch) !important;
		&:hover {
			text-decoration: underline solid currentColor 0.0714rem;
			cursor: pointer;
		}
	}
	img {
		width: auto;

		height: auto;
		backdrop-filter: contrast(0.9);
	}
	img::before {
		display: block;
		content: "";
		padding-top: calc(100% * 2 / 3);
	}
	.innercard {
		display: flex;
		width: 100%;
		flex-direction: row;
		align-items: center;
		flex-wrap: nowrap;
		padding: 0.4rem 0rem;
		position: relative;
		@media screen and (min-width: 640px) {
			padding: 0.2rem 0rem;
		}
	}

	.title {
		display: inline-flex;
		// width: 100%;
		margin-left: 1rem;
		// line-height: 1.3;
		align-self: center;
		flex-direction: column;
		font-size: 100%;
		width: calc(100vmin - 50vmin);
	}
	.img-container {
		position: relative;
		display: block;
		width: 100%;
		max-width: 5rem;
		min-width: 5rem;
		height: 5rem;
		border-radius: $xs-radius;

		.thumbnail {
			width: 100%;
			height: 100%;
			background: rgba(13, 13, 15, 0.192);
			border-radius: inherit;
			img {
				border-radius: inherit;
				width: 100%;
				height: 100%;
				object-fit: contain;
			}
		}
	}
	.artist-img {
		border-radius: 99999em;
	}
	.album a {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		display: block;
		max-width: calc(100vw - 2ch) !important;
	}
	a {
		color: inherit;
	}
	@media (min-width: 640px) {
		.container:active:not(.menu) {
			background: lighten(#575a6359, 5%);
		}
	}
</style>
