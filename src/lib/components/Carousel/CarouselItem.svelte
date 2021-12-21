<script lang="ts">
	import { goto } from '$app/navigation'
	import Loading from '$components/Loading/Loading.svelte'
	import db from '$lib/db'
	import lazy from '$lib/lazy'
	import list from '$lib/stores/list'
	import type { CarouselItem, Item } from '$lib/types'
	import { notify } from '$lib/utils'
	import {
		alertHandler,
		currentTitle,
		key,
		showAddToPlaylistPopper
	} from '$stores/stores'
	import { tick } from 'svelte'
	import { PopperButton, PopperStore } from '../Popper'
	import { browseHandler } from './functions'
	export let section
	export let index
	export let item: CarouselItem
	export let type = ''
	export let kind = ''
	export let aspectRatio
	export let isBrowseEndpoint = false
	let loading
	let RATIO_SQUARE = item.aspectRatio.includes('SQUARE') ? true : false
	let RATIO_RECT =
		item.aspectRatio.includes('TWO_LINE_STACK') ||
		item.aspectRatio.includes('16_9')
			? true
			: false

	const playAlbum = () => {
		list.startPlaylist(item.playlistId)
		key.set(0)
		currentTitle.set(item.title)
	}
	let DropdownItems: Array<{ text: string; icon: string; action: () => void }>
	DropdownItems = [
		{
			text: 'View Artist',
			icon: 'artist',
			action: async () => {
				goto(
					type == 'new'
						? `/artist/${item.subtitle[2].navigationEndpoint.browseEndpoint.browseId}`
						: `/artist/${item.subtitle[0].navigationEndpoint.browseEndpoint.browseId}`
				)
				await tick()
				window.scrollTo({
					behavior: 'smooth',
					top: 0,
					left: 0
				})
			}
		},
		{
			text: 'Add to Queue',
			icon: 'queue',
			action: () => {
				!kind && list.addNext(item, $key)
				kind == 'Videos' && list.addNext(item, $key)
				kind == 'Albums' && playAlbum()
				kind == 'Featured on' && list.startPlaylist(item.playlistId)

				notify(`${item.title} added to queue!`, 'success')
			}
		},
		{
			text: 'Add to Playlist',
			icon: 'playlist-add',
			action: async () => {
				if (item.endpoint?.pageType.match(/PLAYLIST|ALBUM|SINGLE/)) {
					const response = await fetch(
						'/api/getQueue.json?playlistId=' + item.playlistId
					)
					const data = await response.json()
					const items: Item[] = data
					showAddToPlaylistPopper.set({ state: true, item: [...items] })
				} else {
					showAddToPlaylistPopper.set({ state: true, item: item })
				}
			}
		},
		{
			text: 'Favorite',
			icon: 'heart',
			action: () => {
				db.setNewFavorite(item)
			}
		},
		{
			text: 'Share',
			icon: 'share',
			action: async () => {
				let shareData = {
					title: item.title,
					text: `Listen to ${item.title} on Beatbump`,
					url: `https://beatbump.ml/listen?id=${item.videoId}`
				}
				if (item.endpoint?.pageType?.includes('MUSIC_PAGE_TYPE_PLAYLIST')) {
					shareData = {
						title: item.title,
						text: `Listen to ${item.title} on Beatbump`,
						url: `https://beatbump.ml/playlist/${item.endpoint?.browseId}`
					}
				}
				if (item.endpoint?.pageType?.includes('MUSIC_PAGE_TYPE_ALBUM')) {
					shareData = {
						title: item.title,
						text: `Listen to ${item.title} on Beatbump`,
						url: `https://beatbump.ml/release?id=${item.endpoint?.browseId}`
					}
				}
				if (item.endpoint?.pageType?.includes('MUSIC_PAGE_TYPE_ARTIST')) {
					shareData = {
						title: item.title,
						text: `${item.title} on Beatbump`,
						url: `https://beatbump.ml/artist/${item.endpoint?.browseId}`
					}
				}
				try {
					if (!navigator.canShare) {
						await navigator.clipboard.writeText(shareData.url)
						notify('Link copied successfully', 'success')
					} else {
						const share = await navigator.share(shareData)
						notify('Shared successfully', 'success')
					}
				} catch (error) {
					notify('Error: ' + error, 'error')
				}
			}
		}
	]

	type CustomEvent = Event & {
		currentTarget: EventTarget & HTMLImageElement
	}
	let errorCount = 0
	const errorHandler = (event: CustomEvent) => {
		if (errorCount !== 1) {
			event.currentTarget.onerror = null

			event.currentTarget.src =
				'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJpc29sYXRpb246aXNvbGF0ZSIgdmlld0JveD0iMCAwIDI1NiAyNTYiIHdpZHRoPSIyNTZwdCIgaGVpZ2h0PSIyNTZwdCI+PGRlZnM+PGNsaXBQYXRoIGlkPSJwcmVmaXhfX2EiPjxwYXRoIGQ9Ik0wIDBoMjU2djI1NkgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNwcmVmaXhfX2EpIj48cGF0aCBmaWxsPSIjNDI0MjQyIiBkPSJNMCAwaDI1NnYyNTZIMHoiLz48ZyBjbGlwLXBhdGg9InVybCgjcHJlZml4X19iKSI+PHRleHQgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTA1LjU0IDE2Ni43OTQpIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLC1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LCZxdW90O1NlZ29lIFVJJnF1b3Q7LFJvYm90byxPeHlnZW4sVWJ1bnR1LENhbnRhcmVsbCwmcXVvdDtPcGVuIFNhbnMmcXVvdDssJnF1b3Q7SGVsdmV0aWNhIE5ldWUmcXVvdDssc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjQwMCIgZm9udC1zaXplPSIxMDAiIGZpbGw9IiNmYWZhZmEiPj88L3RleHQ+PC9nPjxkZWZzPjxjbGlwUGF0aCBpZD0icHJlZml4X19iIj48cGF0aCB0cmFuc2Zvcm09InRyYW5zbGF0ZSg5MiA1NC44MzkpIiBkPSJNMCAwaDcydjE0Ni4zMjNIMHoiLz48L2NsaXBQYXRoPjwvZGVmcz48L2c+PC9zdmc+'
		} else {
			errorCount += 1
			event.currentTarget.onerror = null
			event.currentTarget.src = item.thumbnails[0].original_url
		}
	}
	const clickHandler = async (event: Event, index) => {
		loading = true
		if (type == 'trending') {
			//
			isBrowseEndpoint
				? goto(
						'/release?type=' +
							encodeURIComponent(item.endpoint.pageType) +
							'&id=' +
							encodeURIComponent(item.endpoint?.browseId)
				  )
				: await list.initList({
						videoId: item.videoId,
						playlistId: item.playlistId,
						config: { type: item?.musicVideoType }
				  })

			key.set(0)
			loading = false
		}
		if (type == 'home') {
			item?.endpoint?.pageType.includes('ARTIST') &&
				goto(`/artist/${item?.endpoint?.browseId}`)
			// if has videoId, and endpoint type is artist page, and is not Browse type
			!isBrowseEndpoint &&
			item.videoId !== undefined &&
			!item?.endpoint?.pageType.includes('ARTIST')
				? await list.initList({
						videoId: item.videoId,
						playlistId: item.playlistId
				  })
				: browseHandler(item.endpoint.pageType, item.endpoint.browseId)
			loading = false
		}
		if (type == 'artist') {
			item?.endpoint?.pageType.includes('ARTIST') &&
				goto(`/artist/${item?.endpoint?.browseId}`)
			// if has videoId, and endpoint type is artist page, and is not Browse type
			!isBrowseEndpoint &&
			item.videoId !== undefined &&
			!item?.endpoint?.pageType.includes('ARTIST')
				? await list.initList({
						videoId: item.videoId,
						playlistId: item.playlistId,
						keyId: index
				  })
				: browseHandler(item.endpoint.pageType, item.endpoint.browseId)
			loading = false
		}
	}

	// $:console.log(item.thumbnails)
	let srcImg = item.thumbnails[0].url

	if (kind === 'Singles') {
		DropdownItems.splice(1, 1)
		DropdownItems = [...DropdownItems]

		// console.log(DropdownItems)
	}
	if (item?.endpoint?.pageType) {
		DropdownItems = [
			...DropdownItems.filter((item) => {
				if (!item.text.match(/Favorite|Add to Queue|View Artist/gm)) {
					return item
				}
			})
		]
	}

	if (item.endpoint?.pageType?.includes('MUSIC_PAGE_TYPE_PLAYLIST')) {
		DropdownItems = [
			{
				action: () => list.startPlaylist(item.playlistId),
				icon: 'shuffle',
				text: 'Shuffle Playlist'
			},
			...DropdownItems
		]
	}
	if (item.endpoint?.pageType?.includes('MUSIC_PAGE_TYPE_ARTIST')) {
		DropdownItems = [
			...DropdownItems.filter((item) => {
				if (
					!item.text.match(
						/Favorite|Add to Queue|View Artist|Add to Playlist/gm
					)
				) {
					return item
				}
			})
		]
	}
	let node: HTMLElement

	let windowWidth
	$: active = windowWidth < 640 ? true : false
</script>

<svelte:window bind:innerWidth={windowWidth} />
<article
	class:item16x9={RATIO_RECT ? true : false}
	class:item1x1={RATIO_SQUARE ? true : false}
	class="item"
	on:contextmenu={(e) => {
		e.preventDefault()
		window.dispatchEvent(
			new CustomEvent('contextmenu', { detail: 'carouselItem' })
		)

		PopperStore.set({
			items: [...DropdownItems],
			x: e.pageX,
			y: e.pageY,
			direction: 'right'
		})
	}}
	on:click|stopPropagation={(e) => clickHandler(e, index)}
>
	<section
		class="item-thumbnail"
		on:mouseover={() => (active = true)}
		on:focus
		on:mouseout={() => (active = false)}
		class:img16x9={RATIO_RECT ? true : false}
		class:img1x1={RATIO_SQUARE ? true : false}
		on:blur
	>
		<div
			class="image"
			class:active
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
				class:img16x9={RATIO_RECT}
				class:img1x1={RATIO_SQUARE}
				decoding="async"
				width={item.thumbnails[0].width}
				height={item.thumbnails[0].height}
				src={item.thumbnails[0]?.placeholder}
				use:lazy={{
					src: srcImg
				}}
			/>
		</div>
		<div class="item-menu">
			<PopperButton tabindex="0" items={DropdownItems} />
		</div>
	</section>
	<section class="item-title">
		<h1 class="link">
			{item.title}
		</h1>
		{#if item.subtitle}
			<span class="subtitles secondary">
				{#each item.subtitle as sub}
					{#if !sub?.browseId}
						<span>{sub.text}</span>
					{:else}
						<a
							sveltekit:prefetch
							on:click|stopPropagation|preventDefault={() => {
								goto('/artist/' + sub?.browseId)
							}}
							href={'/artist/' + sub?.browseId}><span>{sub.text}</span></a
						>
					{/if}
				{/each}
			</span>
		{/if}
	</section>
</article>

<style lang="scss">
	a {
		color: inherit;
		transition: color 100ms linear;
		&:hover {
			color: #eee;
		}
	}
	.item-title {
		display: inline-block;
		.link {
			display: block;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
	.item1x1 {
		// padding-top: 100% !important;
		width: 100%;
		max-width: 20rem !important;
		position: relative;
	}
	.item16x9 {
		width: 100%;
	}
	.img1x1 {
		// padding-top: 100% !important;

		aspect-ratio: 1/1 !important;
		width: clamp(12rem, 14rem, 22rem) !important;
	}
	.img16x9 {
		// padding-top: 56.25% !important;
		max-width: 100%;
		width: 25rem;
		aspect-ratio: 16/9 !important;
		// width: clamp(13rem, 22rem, 22rem) !important;
	}
	.subtitles {
		display: block;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
		// white-space: nowrap;
		cursor: pointer;
	}
	h1 {
		font-size: 1.125rem;
		font-weight: 500;
		margin-bottom: 0;
		display: inline;
	}
	article {
		padding: 1rem;
		min-width: 12rem;
		scroll-snap-align: start;
		// padding-right: 1rem;

		contain: layout paint style;
		&::before {
			position: absolute;
			display: block;
			content: '';
			padding-top: calc(100% * 2 / 3);
		}
	}
	.image {
		width: 100%;
		// height: 100%;
		height: auto;

		position: relative;
		cursor: pointer;
		user-select: none;
		border-radius: $sm-radius;
		overflow: hidden;

		&:focus {
			border: none;
		}

		&::before {
			position: absolute;
			content: '';
			inset: 0;
			background: linear-gradient(
				rgba(0, 0, 0, 0.502),
				rgba(0, 0, 0, 0),
				rgba(0, 0, 0, 0)
			);
			pointer-events: none;
			transition: background linear 0.1s, opacity linear 0.1s;
			opacity: 0.1;
			// z-index: 1;
		}
		@media screen and (max-width: 640px) {
			&::before {
				opacity: 1;
			}
		}

		&:active:hover::before {
			// transition: all cubic-bezier(0.42, 0.16, 0.58, 0.8) 0.2s !important;
			background: linear-gradient(rgba(0, 0, 0, 0.589), rgba(0, 0, 0, 0.11));
			opacity: 1;
			z-index: 1;
		}
		// padding-top: 100%;

		img {
			width: inherit;
			height: inherit;
			aspect-ratio: inherit;
			user-select: none;

			object-fit: cover;
			min-width: 100%;
			// min-height: 100%;
		}
	}
	.active {
		&::before {
			// transition: all cubic-bezier(0.42, 0.16, 0.58, 0.8) 0.2s !important;
			background: linear-gradient(rgba(0, 0, 0, 0.534), rgba(0, 0, 0, 0.11));
			opacity: 0.7;
			z-index: 1;
		}
	}

	.item {
		isolation: isolate;

		// cursor: pointer;
	}
	.image:hover {
		+ .item-menu {
			opacity: 1 !important;
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
		@media screen and (max-width: 550px) {
			opacity: 1;
		}
	}
	@mixin active {
		> .image {
			&::before {
				// transition: all cubic-bezier(0.42, 0.16, 0.58, 0.8) 0.2s !important;
				background: linear-gradient(rgba(0, 0, 0, 0.534), rgba(0, 0, 0, 0.11));
				opacity: 0.7;
				z-index: 1;
			}
		}
	}
	.item-thumbnail {
		position: relative;
		cursor: pointer;
		margin-bottom: 0.8rem;

		&:focus-visible,
		&:focus-within {
			@include active;
		}
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
