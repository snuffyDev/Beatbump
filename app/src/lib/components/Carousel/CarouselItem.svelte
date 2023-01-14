<svelte:options immutable={true} />

<script
	context="module"
	lang="ts"
>
	const RE_ALBUM_PLAYLIST_SINGLE = /PLAYLIST|ALBUM|SINGLE/;
	const RE_THUMBNAIL_DIM = /=w\d+-h\d+-/gm;
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

	function handleContextMenu(event: MouseEvent, dropdownItems: Dropdown) {
		event.preventDefault();
		window.dispatchEvent(new CustomEvent("contextmenu", { detail: "carouselItem" }));

		PopperStore.set({
			items: dropdownItems,
			x: event.pageX,
			y: event.pageY,
			direction: "normal",
		});
	}

	const FILTER_ARTIST_ON_ARTIST_PAGE: ReadonlyArray<string> = ["Favorite", "Add to Queue", "View Artist"] as const;
	const FILTER_ALBUM_PLAYLIST_ITEMS: ReadonlyArray<string> = ["Favorite", "Play Next", "View Artist"] as const;
</script>

<script lang="ts">
	import { goto } from "$app/navigation";
	import Loading from "$components/Loading/Loading.svelte";
	import { groupSession } from "$lib/stores";
	import { IDBService } from "$lib/workers/db/service";

	import list from "$lib/stores/list";
	import { Logger, notify } from "$lib/utils";
	import { showAddToPlaylistPopper, showGroupSessionCreator } from "$stores/stores";
	import { tick } from "svelte";
	import { PopperButton, PopperStore } from "../Popper";
	import { clickHandler } from "./functions";
	import { browser } from "$app/environment";
	import { IsoBase64 } from "$lib/utils";
	import { SITE_ORIGIN_URL } from "$stores/url";
	import type { Dropdown } from "$lib/configs/dropdowns.config";
	import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
	import type { Item } from "$lib/types";
	import { createShare } from "$lib/shared/createShare";

	export let index: number;
	export let item: IListItemRenderer;
	export let type = "";
	export let kind = "";
	export let aspectRatio: string;
	export let isBrowseEndpoint = false;

	let loading = false;
	let RATIO_RECT =
		(aspectRatio?.includes("TWO_LINE_STACK") && kind !== "Fans might also like") || aspectRatio?.includes("16_9")
			? true
			: false;
	const ASPECT_RATIO = !RATIO_RECT ? "1x1" : "16x9";
	let DropdownItems: Dropdown = [
		{
			text: "View Artist",
			icon: "artist",
			action: async () => {
				try {
					const artistId = item.artistInfo ? item.artistInfo.artist[0].browseId : item.subtitle[0].browseId;
					if (!artistId) throw new Error(`Expected a valid artistId string, received ${artistId}`);
					goto(`/artist/${artistId}`);
					await tick();
					window.scrollTo({
						behavior: "smooth",
						top: 0,
						left: 0,
					});
				} catch (e) {
					notify(`Error: ${e}`, "error");
				}
			},
		},
		{
			text: "Add to Queue",
			icon: "queue",
			action: function action() {
				list.setTrackWillPlayNext(item, $list.mix.length);
				notify(`${item.title} has been added to your queue!`, "success");
			},
		},

		{
			text: "Play Next",
			icon: "queue",
			action: function () {
				list.setTrackWillPlayNext(item, $list.position);
				notify(`${item.title} will play next!`, "success");
			},
		},
		{
			text: "Add to Playlist",
			icon: "list-plus",
			action: async () => {
				if (item.endpoint?.pageType.match(RE_ALBUM_PLAYLIST_SINGLE)) {
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
						const shareData = createShare({
							type: "SESSION",
							title: `Join ${groupSession.client.displayName}'s Beatbump Session`,
							id: encodeURIComponent(
								IsoBase64.toBase64(
									JSON.stringify({
										clientId: groupSession.client.clientId,
										displayName: groupSession.client.displayName,
									}),
								),
							),
							origin: $SITE_ORIGIN_URL,
						});
						try {
							if (!navigator.canShare) {
								await navigator.clipboard.writeText(shareData.url);
								notify("Link copied successfully", "success");
							} else {
								await navigator
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
				const shareData = createShare({
					origin: $SITE_ORIGIN_URL,
					id: item.endpoint?.browseId ?? item.videoId,
					type: item.endpoint?.pageType ?? null,
					title: item.title,
				});
				try {
					if (!navigator.canShare) {
						await navigator.clipboard.writeText(shareData.url);
						notify("Link copied successfully", "success");
					} else {
						await navigator.share(shareData);
						notify("Shared successfully", "success");
					}
				} catch (error) {
					notify("Error: " + error, "error");
				}
			},
		},
	];
	$: {
		if (type === "artist" || (item.endpoint && item.endpoint.pageType?.includes("MUSIC_PAGE_TYPE_ARTIST"))) {
			DropdownItems = DropdownItems.filter((item) => FILTER_ARTIST_ON_ARTIST_PAGE.includes(item.text));
		}
		if (item.endpoint?.pageType) {
			DropdownItems = item?.endpoint?.pageType.match(RE_ALBUM_PLAYLIST_SINGLE)
				? [
						{
							action: () => {
								list.initPlaylistSession({ playlistId: item.playlistId, params: "wAEB8gECKAE%3D", index: 0 });
							},
							icon: "shuffle",
							text: "Shuffle",
						},
						{
							action: () => {
								list.setTrackWillPlayNext(item, $list.position);
							},
							icon: "queue",
							text: "Play Next",
						},
						{
							action: () => {
								list.initPlaylistSession({
									playlistId: "RDAMPL" + item.playlistId,
									params: "wAEB8gECeAE%3D",
									index: 0,
								});
							},
							icon: "radio",
							text: "Start Radio",
						},
						...DropdownItems.filter((item) => !FILTER_ALBUM_PLAYLIST_ITEMS.includes(item.text)),
				  ]
				: DropdownItems.filter((item) => FILTER_ALBUM_PLAYLIST_ITEMS.includes(item.text));
		}
	}

	let srcImg = Array.isArray(item?.thumbnails)
		? item?.thumbnails.at(0)
		: { width: 0, height: 0, url: "", placeholder: "" };

	$: srcImg.url = srcImg.width < 100 ? srcImg.url.replace(RE_THUMBNAIL_DIM, "=w240-h240-") : srcImg.url;
	let active;

	$: isArtistKind = kind === "Fans might also like";
</script>

<article
	class="item item{ASPECT_RATIO}"
	on:contextmenu={(event) => handleContextMenu(event, DropdownItems)}
	on:click|stopPropagation={(e) => clickHandler({ isBrowseEndpoint, index, item, kind, type })}
>
	<section class="item-thumbnail-wrapper img{ASPECT_RATIO}">
		<section
			class="item-thumbnail img{ASPECT_RATIO}"
			class:isArtistKind
			on:focus
			on:blur
		>
			<div
				class="image img{ASPECT_RATIO}"
				class:active
				class:isArtistKind
				tabindex="0"
			>
				{#if loading}
					<Loading />
				{/if}
				<img
					alt="thumbnail img{ASPECT_RATIO}"
					on:error={errorHandler}
					loading={index >= 3 ? "lazy" : null}
					width={srcImg.width}
					height={srcImg.height}
					src={index >= 3 ? srcImg.placeholder : srcImg.url}
					data-src={index >= 3 ? srcImg.url : null}
				/>
			</div>
			<div class="item-menu">
				<PopperButton
					tabindex={0}
					items={DropdownItems}
				/>
			</div>
		</section>
	</section>
	<div
		class="item-title"
		class:isArtistKind
	>
		<span class="h1 link">
			{item.title}
		</span>
		{#if item.subtitle}
			<div class="subtitles secondary">
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
			</div>
		{/if}
	</div>
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
				> :where(.image)::before {
					background: linear-gradient(rgba(0, 0, 0, 0.534), rgba(0, 0, 0, 0.11));
					opacity: 0.7;
					z-index: 1;
				}
			}
		}
	}
	.item-thumbnail-wrapper {
		position: relative;
		overflow: hidden;
		display: block;
		margin-bottom: 0.5em;

		&.img16x9 {
			aspect-ratio: 16/9;
		}
		&.img1x1 {
			aspect-ratio: 1/1;
		}
	}
	:where(.item-title.isArtistKind) {
		text-align: center;
	}
	:where(.image.isArtistKind) {
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
	:where(.item-title) {
		display: block;
	}
	:where(.link) {
		display: block;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-bottom: 0.325em;
	}
	.item1x1 {
		position: relative;
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

		> :where(img) {
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

	:where(.item) {
		isolation: isolate;
	}
	:where(.image):hover {
		+ :where(.item-menu) {
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
