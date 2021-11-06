<script lang="ts">
	import { goto } from '$app/navigation'
	import Loading from '$components/Loading/Loading.svelte'
	import db from '$lib/db'
	import lazy from '$lib/lazy'
	import list from '$lib/stores/list'
	import type { CarouselItem } from '$lib/types'
	import { alertHandler, currentTitle, key } from '$stores/stores'
	import { tick } from 'svelte'
	import { PopperButton } from '../Popper'
	import { browseHandler } from './functions'
	export let section
	export let index
	export let item: CarouselItem
	export let type = ''
	export let kind = ''
	export let aspectRatio
	export let isBrowseEndpoint = false
	let loading
	let isHidden
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
	let DropdownItems: Array<Record<string, any>>
	DropdownItems = [
		{
			text: 'View Artist',
			icon: 'artist',
			action: async () => {
				window.scrollTo({
					behavior: 'smooth',
					top: 0,
					left: 0
				})
				await tick()

				goto(
					type == 'new'
						? `/artist/${item.subtitle[2].navigationEndpoint.browseEndpoint.browseId}`
						: `/artist/${item.subtitle[0].navigationEndpoint.browseEndpoint.browseId}`
				)
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
				alertHandler.set({
					msg: `${item.title} added to queue!`,
					type: 'success'
				})
			}
		},
		{
			text: 'Favorite',
			icon: 'heart',
			action: () => {
				console.log(item)
				db.setNewFavorite(item)
			}
		},
		{
			text: 'Share',
			icon: 'share',
			action: async () => {
				const shareData = {
					title: item.title,
					text: `Listen to ${item.title} on Beatbump`,
					url: `https://beatbump.ml/listen?id=${item.videoId}`
				}
				try {
					if (!navigator.canShare) {
						await navigator.clipboard.writeText(shareData.url)
						alertHandler.set({
							msg: 'Link copied Successfully!',
							type: 'success'
						})
					} else {
						const share = await navigator.share(shareData)
						alertHandler.set({ msg: 'Shared Successfully!', type: 'success' })
					}
				} catch (error) {
					alertHandler.set({ msg: 'Error!' + error, type: 'error' })
				}
			}
		}
	]

	type CustomEvent = Event & {
		currentTarget: EventTarget & HTMLImageElement
	}
	const errorHandler = (event: CustomEvent) => {
		event.currentTarget.onerror = null
		event.currentTarget.src =
			'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJpc29sYXRpb246aXNvbGF0ZSIgdmlld0JveD0iMCAwIDI1NiAyNTYiIHdpZHRoPSIyNTZwdCIgaGVpZ2h0PSIyNTZwdCI+PGRlZnM+PGNsaXBQYXRoIGlkPSJwcmVmaXhfX2EiPjxwYXRoIGQ9Ik0wIDBoMjU2djI1NkgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNwcmVmaXhfX2EpIj48cGF0aCBmaWxsPSIjYWNhY2FjIiBkPSJNMCAwaDI1NnYyNTZIMHoiLz48ZyBjbGlwLXBhdGg9InVybCgjcHJlZml4X19iKSI+PHRleHQgdHJhbnNmb3JtPSJtYXRyaXgoMS4yOTkgMCAwIDEuMjcgOTUuNjg4IDE4Ni45NzEpIiBmb250LWZhbWlseT0iTGF0byIgZm9udC13ZWlnaHQ9IjQwMCIgZm9udC1zaXplPSIxMjAiIGZpbGw9IiMyODI4MjgiPj88L3RleHQ+PC9nPjxkZWZzPjxjbGlwUGF0aCBpZD0icHJlZml4X19iIj48cGF0aCB0cmFuc2Zvcm09Im1hdHJpeCgxLjI5OSAwIDAgMS4yNyA3OCA0Mi4yODYpIiBkPSJNMCAwaDc3djEzNUgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjwvZz48L3N2Zz4='
	}
	const clickHandler = async (event: Event, index) => {
		loading = true
		if (event) console.log(event)
		if (type == 'trending') {
			//
			isBrowseEndpoint
				? goto(
						'/release?type=' +
							encodeURIComponent(item.endpoint.pageType) +
							'&id=' +
							encodeURIComponent(item.endpoint?.browseId)
				  )
				: await list.initList(item.videoId, item.playlistId)

			key.set(0)
			loading = false
		}
		if (type == 'artist') {
			item?.endpoint?.pageType.includes('ARTIST') &&
				goto(`/artist/${item?.endpoint?.browseId}`)
			// if has videoId, and endpoint type is artist page, and is not Browse type
			!isBrowseEndpoint &&
			item.videoId !== undefined &&
			!item?.endpoint?.pageType.includes('ARTIST')
				? await list.initList(item.videoId, item.playlistId, index)
				: browseHandler(item.endpoint.pageType, item.endpoint.browseId)
			loading = false
		}
	}
	// $:console.log(item.thumbnails)
	let srcImg =
		item.thumbnails[0].width <= 60
			? item.thumbnails[0].url.replace(/=(w(\d+))-(h(\d+))/g, '=w256-h256')
			: item.thumbnails[0].url
	if (kind === 'Singles') {
		DropdownItems.splice(1, 1)
		DropdownItems = [...DropdownItems]
		// console.log(DropdownItems)
	}

	let active
</script>

<article class="item" on:click|stopPropagation={(e) => clickHandler(e, index)}>
	<section
		class="item-thumbnail"
		on:mouseover={() => (active = true)}
		on:focus
		on:mouseout={() => (active = false)}
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
				loading="lazy"
				class:img16x9={RATIO_RECT}
				class:img1x1={RATIO_SQUARE}
				width={item.thumbnails[0].width}
				height={item.thumbnails[0].height}
				src={item.thumbnails[0]?.placeholder}
				use:lazy={{ src: srcImg }}
			/>
		</div>
		<div class="item-menu" class:hidden={isBrowseEndpoint}>
			<PopperButton bind:isHidden items={DropdownItems} />
		</div>
	</section>
	<section class="item-title">
		<h1 class="link">
			{item.title.length > 48
				? item.title.substring(0, 48) + '...'
				: item.title}
		</h1>
		{#if item.subtitle}
			<span class="subtitles secondary">
				{#each item.subtitle as sub}
					<span class:hidden={sub?.navigationEndpoint}>{sub.text}</span>
					<a
						sveltekit:prefetch
						class:hidden={!sub?.navigationEndpoint}
						on:click|stopPropagation|preventDefault={() => {
							goto(
								'/artist/' + sub?.navigationEndpoint?.browseEndpoint?.browseId
							)
						}}
						href={'/artist/' +
							sub?.navigationEndpoint?.browseEndpoint?.browseId}
						><span>{sub.text}</span></a
					>
				{/each}
			</span>
		{/if}
	</section>
</article>

<!-- <section
	class="item"
	class:item16x9={RATIO_RECT ? true : false}
	class:item1x1={RATIO_SQUARE ? true : false}
	bind:this={section[index]}
>
	<div
		class="clickable"
		style="display:block;"
		use:menu
		on:menutouch={(e) => {}}
		on:click|stopPropagation={(e) => clickHandler(e, index)}
	>
		<div
			class="image"
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
				loading="lazy"
				class:img16x9={RATIO_RECT}
				class:img1x1={RATIO_SQUARE}
				width={item.thumbnails[0].width}
				height={item.thumbnails[0].height}
				src={item.thumbnails[0]?.placeholder}
				use:lazy={{ src: srcImg }}
			/>
		</div>

		<div class="cont">
			<div class="text-wrapper">
				<span class="title">
					{item.title.length > 48
						? item.title.substring(0, 48) + '...'
						: item.title}
					<!-- {kind}
				</span>
				{#if item.subtitle}
					<div class="secondary subtitles">
						{#each item.subtitle as sub}
							<span class:hidden={sub?.navigationEndpoint}>{sub.text}</span>
							<a
								sveltekit:prefetch
								class:hidden={!sub?.navigationEndpoint}
								on:click|stopPropagation|preventDefault={() => {
									goto(
										'/artist/' +
											sub?.navigationEndpoint?.browseEndpoint?.browseId
									)
								}}
								href={'/artist/' +
									sub?.navigationEndpoint?.browseEndpoint?.browseId}
								><span>{sub.text}</span></a
							>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
	{#if !isBrowseEndpoint}
		<div class="menu">
			<!-- <Dropdown color="white" bind:isHidden items={DropdownItems} /> -
			<PopperButton bind:isHidden items={DropdownItems} />
		</div>
	{/if}
</section> -->
<style lang="scss">
	.item-title {
		display: inline-flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.item1x1 {
		// padding-top: 100% !important;
		width: 100%;
		max-width: 20rem !important;
		position: relative;
	}
	.item16x9 {
		// padding-top: 56.25% !important;
		min-width: 20rem !important;
		position: relative;
	}
	.img1x1 {
		// padding-top: 100% !important;
		min-width: 13rem !important;
		max-width: 20rem;
		aspect-ratio: 1/1 !important;
	}
	.img16x9 {
		// padding-top: 56.25% !important;
		min-width: 20rem !important;
		max-width: 23rem;
		aspect-ratio: 16/9 !important;
	}
	// @import '../../../global/stylesheet/components/_carousel-item.scss';
	.subtitles {
		display: inline-flex;
		flex-wrap: wrap;
		cursor: pointer;
		> * {
			margin-right: 0.125rem;
		}
	}
	h1 {
		font-size: 1.1rem;
		font-weight: 500;
		margin-bottom: 0;
		display: inline;
	}
	article {
		// display: block;
		// padding-bottom: 1.8rem;
		// padding-left: 1rem;
		scroll-snap-align: start;
		// padding-right: 1rem;
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
		border-radius: var(--sm-radius);
		&:focus {
			border: none;
		}

		&::before {
			border-radius: inherit;
			position: absolute;
			content: '';
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			background: linear-gradient(
				rgba(0, 0, 0, 0.502),
				rgba(0, 0, 0, 0),
				rgba(0, 0, 0, 0)
			);
			pointer-events: none;
			will-change: contents;
			transition: background cubic-bezier(0.455, 0.03, 0.515, 0.955) 0.1s,
				opacity cubic-bezier(0.455, 0.03, 0.515, 0.955) 0.1s;
			opacity: 0.1;
			// z-index: 1;
		}

		&:active:hover::before {
			// transition: all cubic-bezier(0.42, 0.16, 0.58, 0.8) 0.2s !important;
			background: linear-gradient(rgba(0, 0, 0, 0.651), rgba(0, 0, 0, 0.11));
			opacity: 1;
			z-index: 1;
		}
		// padding-top: 100%;

		img {
			width: inherit;
			height: inherit;
			aspect-ratio: inherit;
			user-select: none;
			// position: absolute;
			object-fit: cover;
			// border-radius: var(--xs-radius);
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
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
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
		margin: 0.25rem;
		opacity: 0;
		transition: 50ms opacity cubic-bezier(0.55, 0.055, 0.675, 0.19);
		&:hover {
			opacity: 1;
		}
		@media screen and (max-width: 550px) {
			opacity: 1;
		}
	}
	.item-thumbnail {
		position: relative;
		cursor: pointer;
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
