<svelte:options immutable={true} />

<script lang="ts">
	import { goto } from "$app/navigation";
	import Loading from "$components/Loading/Loading.svelte";
	import { groupSession } from "$lib/stores";
	import { IDBService } from "$lib/workers/db/service";

	import list from "$lib/stores/list";
	import type { CarouselItem, Item } from "$lib/types";
	import { Logger, notify } from "$lib/utils";
	import { currentTitle, showAddToPlaylistPopper, showGroupSessionCreator } from "$stores/stores";
	import { page } from "$app/stores";
	import { tick } from "svelte";
	import { PopperButton, PopperStore } from "../Popper";
	import { browseHandler } from "./functions";
	import { browser } from "$app/environment";
	import { IsoBase64 } from "$lib/utils";
	import { SITE_ORIGIN_URL } from "$stores/url";
	export let index;
	export let item: CarouselItem;
	export let type = "";
	export let kind = "";
	export let aspectRatio;
	export let isBrowseEndpoint = false;
	let loading;
	let RATIO_SQUARE = item?.aspectRatio?.match(/SQUARE/) ? true : false;
	let RATIO_RECT =
		(item?.aspectRatio?.includes("TWO_LINE_STACK") && kind !== "Fans might also like") ||
		item?.aspectRatio?.includes("16_9")
			? true
			: false;

	const playAlbum = () => {
		list.initPlaylistSession({ playlistId: item.playlistId });
		list.updatePosition(0);
		currentTitle.set(item.title);
	};
	let DropdownItems: Array<{ text: string; icon: string; action: () => void }> = [
		{
			text: "View Artist",
			icon: "artist",
			action: async () => {
				goto(`/artist/${item.artistInfo.artist[0].browseId}`);
				await tick();
				window.scrollTo({
					behavior: "smooth",
					top: 0,
					left: 0,
				});
			},
		},
		{
			text: "Add to Queue",
			icon: "list-music",
			action: function action() {
				list.setTrackWillPlayNext(item, $list.mix.length);
				notify(`${item.title} has been added to your queue!`, "success");
			},
		},

		{
			text: "Play Next",
			icon: "list-music",
			action: function () {
				list.setTrackWillPlayNext(item, $list.position);
				notify(`${item.title} will play next!`, "success");
			},
		},
		{
			text: "Add to Playlist",
			icon: "list-plus",
			action: async () => {
				if (item.endpoint?.pageType.match(/PLAYLIST|ALBUM|SINGLE/)) {
					const response = await fetch("/api/v1/get_queue.json?playlistId=" + item.playlistId);
					const data = await response.json();
					const items: Item[] = data;
					showAddToPlaylistPopper.set({ state: true, item: [...items] });
				} else {
					showAddToPlaylistPopper.set({ state: true, item: item });
				}
			},
		},

		{
			text: "Favorite",
			icon: "heart",
			action: () => {
				IDBService.sendMessage("create", "favorite", item);
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
							url: `${import.meta.env.DEV ? "localhost:5173" : $SITE_ORIGIN_URL}/session?token=${encodeURIComponent(
								IsoBase64.toBase64(
									JSON.stringify({
										clientId: groupSession.client.clientId,
										displayName: groupSession.client.displayName,
									}),
								),
							)}`,
						};
						try {
							if (!navigator.canShare) {
								await navigator.clipboard.writeText(shareData.url);
								notify("Link copied successfully", "success");
							} else {
								const share = await navigator
									.share(shareData)
									.then(() => {
										notify("Shared successfully", "success");
									})
									.catch((err) => {
										Logger.err(err);
									});
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
				let shareData = {
					title: item.title,

					url: `${$SITE_ORIGIN_URL}/listen?id=${item.videoId}`,
				};
				if (item.endpoint?.pageType?.includes("MUSIC_PAGE_TYPE_PLAYLIST")) {
					shareData = {
						title: item.title,

						url: `${$SITE_ORIGIN_URL}/playlist/${item.endpoint?.browseId}`,
					};
				}
				if (item.endpoint?.pageType?.includes("MUSIC_PAGE_TYPE_ALBUM")) {
					shareData = {
						title: item.title,

						url: `${$SITE_ORIGIN_URL}/release?id=${item.endpoint?.browseId}`,
					};
				}
				if (item.endpoint?.pageType?.includes("MUSIC_PAGE_TYPE_ARTIST")) {
					shareData = {
						title: item.title,
						url: `${$SITE_ORIGIN_URL}/artist/${item.endpoint?.browseId}`,
					};
				}
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

	const errorHandler = (
		event: Event & {
			currentTarget: EventTarget & HTMLImageElement;
		},
	) => {
		if (!browser) return;
		event.currentTarget.onerror = null;

		event.currentTarget.src =
			"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJpc29sYXRpb246aXNvbGF0ZSIgdmlld0JveD0iMCAwIDI1NiAyNTYiIHdpZHRoPSIyNTZwdCIgaGVpZ2h0PSIyNTZwdCI+PGRlZnM+PGNsaXBQYXRoIGlkPSJwcmVmaXhfX2EiPjxwYXRoIGQ9Ik0wIDBoMjU2djI1NkgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNwcmVmaXhfX2EpIj48cGF0aCBmaWxsPSIjNDI0MjQyIiBkPSJNMCAwaDI1NnYyNTZIMHoiLz48ZyBjbGlwLXBhdGg9InVybCgjcHJlZml4X19iKSI+PHRleHQgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTA1LjU0IDE2Ni43OTQpIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLC1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LCZxdW90O1NlZ29lIFVJJnF1b3Q7LFJvYm90byxPeHlnZW4sVWJ1bnR1LENhbnRhcmVsbCwmcXVvdDtPcGVuIFNhbnMmcXVvdDssJnF1b3Q7SGVsdmV0aWNhIE5ldWUmcXVvdDssc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjQwMCIgZm9udC1zaXplPSIxMDAiIGZpbGw9IiNmYWZhZmEiPj88L3RleHQ+PC9nPjxkZWZzPjxjbGlwUGF0aCBpZD0icHJlZml4X19iIj48cGF0aCB0cmFuc2Zvcm09InRyYW5zbGF0ZSg5MiA1NC44MzkpIiBkPSJNMCAwaDcydjE0Ni4zMjNIMHoiLz48L2NsaXBQYXRoPjwvZGVmcz48L2c+PC9zdmc+";
	};
	const clickHandler = async (event: Event, index) => {
		loading = true;
		if (type == "trending") {
			//
			isBrowseEndpoint
				? goto(
						"/release?type=" +
							encodeURIComponent(item?.endpoint?.pageType) +
							"&id=" +
							encodeURIComponent(item.endpoint?.browseId),
				  )
				: await list.initAutoMixSession({
						videoId: item.videoId,
						playlistId: item.playlistId,
						keyId: kind === "isPlaylist" ? index : 0,
						config: { type: item?.musicVideoType },
				  });

			list.updatePosition(kind === "isPlaylist" ? index : 0);
			loading = false;
		}
		if (type == "home") {
			item?.endpoint?.pageType.includes("ARTIST") && goto(`/artist/${item?.endpoint?.browseId}`);

			!isBrowseEndpoint && item.videoId !== undefined && !item?.endpoint?.pageType.includes("ARTIST")
				? await list.initAutoMixSession({
						videoId: item.videoId,
						playlistId: item.playlistId,
				  })
				: browseHandler(item.endpoint.pageType, item.endpoint.browseId);
			loading = false;
		}
		if (type == "artist") {
			item?.endpoint?.pageType.includes("ARTIST") && goto(`/artist/${item?.endpoint?.browseId}`);

			!isBrowseEndpoint && item.videoId !== undefined && !item?.endpoint?.pageType.includes("ARTIST")
				? await list.initAutoMixSession({
						videoId: item.videoId,
						playlistId: item.playlistId,
						keyId: index,
				  })
				: browseHandler(item.endpoint.pageType, item.endpoint.browseId);
			loading = false;
		}
	};

	if (kind === "Singles") {
		DropdownItems.splice(1, 1);
		DropdownItems = DropdownItems;
	}
	if (item?.endpoint?.pageType) {
		DropdownItems = [
			...DropdownItems.filter((item) => {
				if (!item.text.match(/Favorite|Add to Queue|Play Next|View Artist/gm)) {
					return item;
				}
			}),
		];
	}

	if (item.endpoint?.pageType?.match(/MUSIC_PAGE_TYPE_(PLAYLIST|ALBUM)/)) {
		DropdownItems = [
			{
				action: () => list.initPlaylistSession({ playlistId: item.playlistId, params: "wAEB8gECKAE%3D" }),
				icon: "shuffle",
				text: "Shuffle Play",
			},
			{
				action: () => list.initPlaylistSession({ playlistId: item.playlistId }),
				icon: "list-music",
				text: "Play Next",
			},
			{
				action: () => list.initPlaylistSession({ playlistId: "RDAMPL" + item.playlistId, params: "wAEB8gECeAE%3D" }),
				icon: "radio",
				text: "Start Radio",
			},
			...DropdownItems,
		];
	}
	if (type === "artist" || item.endpoint?.pageType?.includes("MUSIC_PAGE_TYPE_ARTIST")) {
		DropdownItems = [
			...DropdownItems.filter((item) => {
				if (!item.text.match(/Favorite|Add to Queue|View Artist|Add to Playlist/gm)) {
					return item;
				}
			}),
		];
	}

	let srcImg = Array.isArray(item?.thumbnails)
		? item?.thumbnails.at(0)
		: { width: 0, height: 0, url: "", placeholder: "" };

	let active;

	$: isArtistKind = kind === "Fans might also like";
</script>

<article
	class:item16x9={RATIO_RECT ? true : false}
	class:item1x1={RATIO_SQUARE ? true : false}
	class="item"
	on:contextmenu={(e) => {
		e.preventDefault();
		window.dispatchEvent(new CustomEvent("contextmenu", { detail: "carouselItem" }));

		PopperStore.set({
			items: [...DropdownItems],
			x: e.pageX,
			y: e.pageY,
			direction: "right",
		});
	}}
	on:click|stopPropagation={(e) => clickHandler(e, index)}
>
	<section
		class="item-thumbnail-wrapper"
		class:img16x9={RATIO_RECT ? true : false}
		class:img1x1={RATIO_SQUARE ? true : false}
	>
		<section
			class="item-thumbnail"
			on:focus
			class:img16x9={RATIO_RECT ? true : false}
			class:img1x1={RATIO_SQUARE ? true : false}
			class:isArtistKind
			on:blur
		>
			<div
				class="image"
				class:active
				class:isArtistKind
				class:img16x9={RATIO_RECT ? true : false}
				class:img1x1={RATIO_SQUARE ? true : false}
				tabindex="0"
			>
				{#if loading}
					<Loading />
				{/if}
				<img
					alt="thumbnail"
					on:error={errorHandler}
					loading={$page.data.iOS ? "eager" : "lazy"}
					class:img16x9={RATIO_RECT}
					class:img1x1={RATIO_SQUARE}
					width={srcImg.width}
					height={srcImg.height}
					src={srcImg.placeholder}
					data-src={srcImg.width < 100 ? srcImg.url.replace(/=w\d+-h\d+-/gm, "=w240-h240-") : srcImg.url}
				/>
			</div>
			<div class="item-menu">
				<PopperButton tabindex="0" items={DropdownItems} />
			</div>
		</section>
	</section>
	<section class="item-title" class:isArtistKind>
		<span class="h1 link">
			{item.title}
		</span>
		{#if item.subtitle}
			<span class="subtitles secondary">
				{#each item.subtitle as sub}
					{#if !sub?.browseId}
						<span>{sub.text}</span>
					{:else}
						<a
							on:click|stopPropagation|preventDefault={() => {
								goto("/artist/" + sub?.browseId);
							}}
							href={"/artist/" + sub?.browseId}><span>{sub.text}</span></a
						>
					{/if}
				{/each}
			</span>
		{/if}
	</section>
</article>

<style lang="scss">
	@import "../../../global/redesign/utility/mixins/media-query";

	article {
		--thumbnail-radius: clamp(4px, calc(var(--column-width, 0px) - 32px) * 0.025, 8px);

		padding: 0.75em;
		margin-bottom: 1em;
		// min-width: 100%;

		scroll-snap-align: start;
		width: var(--column-width);

		contain: layout paint style;

		@media (hover: hover) {
			&:hover {
				.image::before {
					background: linear-gradient(rgba(0, 0, 0, 0.534), rgba(0, 0, 0, 0.11));
					opacity: 0.7;
					z-index: 1;
				}
			}
		}
	}
	.item-thumbnail-wrapper {
		padding-top: 100%;
		position: relative;
		overflow: hidden;
		display: block;
		margin-bottom: 0.5em;

		&.img16x9 {
			padding-top: 56.25%;
		}
		&.img1x1 {
			padding-top: 100%;
		}
	}
	.item-title.isArtistKind {
		text-align: center;
	}
	.image.isArtistKind {
		width: var(--thumbnail-size);
		height: var(--thumbnail-size);

		border-radius: 99999em !important;
	}
	a {
		color: inherit;
		transition: color 100ms linear;
		&:hover {
			color: #eee;
		}
	}
	.item-title {
		display: block;

		contain: content;
		.link {
			display: block;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
			text-overflow: ellipsis;
			margin-bottom: 0.325em;
		}
	}
	.item1x1 {
		position: relative;
		// width: 15em;
	}
	.item16x9 {
		width: calc(var(--column-width) * 2.5);
	}
	.img1x1 {
		// width: 100%;

		aspect-ratio: 1/1 !important;
		height: var(--thumbnail-size);
		width: var(--thumbnail-size);
	}
	.img16x9 {
		min-width: 100%;
		height: var(--thumbnail-size);
		aspect-ratio: 16/9 !important;
	}
	.subtitles {
		display: block;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;

		cursor: pointer;
	}
	.h1 {
		font-size: 1em;
		line-height: 1.25;
		font-weight: 400 !important;
		display: inline;
	}

	.image {
		width: 100%;

		min-height: 100%;
		position: relative;
		cursor: pointer;
		user-select: none;
		border-radius: var(--thumbnail-radius);
		overflow: hidden;
		display: flex;
		align-items: center;
		width: 100%;
		height: 100%;
		contain: paint;

		&:focus {
			border: none;
		}

		&::before {
			position: absolute;
			content: "";
			inset: 0;
			background-image: linear-gradient(rgba(0, 0, 0, 0.502), rgba(0, 0, 0, 0), rgba(0, 0, 0, 0));
			pointer-events: none;
			transition: background-image linear 0.1s, opacity linear 0.1s;
			opacity: 0.1;
			z-index: 1;
		}

		&:active:hover::before {
			background-image: linear-gradient(rgba(0, 0, 0, 0.589), rgba(0, 0, 0, 0.11));
			opacity: 1;
		}

		img {
			height: inherit;
			aspect-ratio: inherit;
			user-select: none;
			contain: content;
			object-fit: cover;
			width: inherit;

			width: 100%;
			height: 100%;
			object-fit: cover;
		}
		@media screen and (max-width: 640px) {
			&::before {
				background: linear-gradient(rgba(0, 0, 0, 0.534), rgba(0, 0, 0, 0.11));
				opacity: 0.7;
				z-index: 1;
			}
		}
	}
	.active {
	}

	.item {
		isolation: isolate;
	}
	.image:hover {
		+ .item-menu {
			opacity: 1 !important;
		}
		& {
			box-shadow: 0px -1px 27px -16px #000 !important;
		}
		&:active:hover {
			box-shadow: 0px -1px 27px -12px #000 !important;
		}
	}

	.item-menu {
		position: absolute;
		right: 0;
		top: 0;
		z-index: 5;
		isolation: isolate;
		margin: 0.25rem;
		opacity: 0;
		transition: 0.1s opacity linear;
		&:focus-visible,
		&:focus-within,
		&:hover {
			opacity: 1;
		}
		@media screen and (max-width: 640px) {
			opacity: 1;
		}
		@media screen and (hover: none) {
			opacity: 1;
		}
	}
	@mixin active {
		> .image {
			&::before {
				background: linear-gradient(rgba(0, 0, 0, 0.534), rgba(0, 0, 0, 0.11));
				opacity: 0.7;
				z-index: 1;
			}
		}
	}
	.item-thumbnail {
		position: relative;
		cursor: pointer;

		contain: paint;

		&:focus-visible,
		&:focus-within {
			@include active;
		}
		position: absolute;
		top: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		border-radius: var(--thumbnail-radius);
	}
	.hidden {
		display: none !important;
		visibility: hidden !important;
	}
	.image,
	img {
		&:focus {
			outline: none;
		}
	}
</style>
