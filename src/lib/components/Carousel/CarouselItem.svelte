<script lang="ts">
	import lazy from '$lib/lazy'
	import Loading from '$components/Loading/Loading.svelte'
	import { key } from '$stores/stores'
	import { fade } from 'svelte/transition'
	import Dropdown from '$components/Dropdown/Dropdown.svelte'
	import { goto } from '$app/navigation'

	import type { CarouselItem } from '$lib/types'
	import list from '$lib/stores/list'
	import { onMount, tick } from 'svelte'
	export let section
	export let index
	export let item: CarouselItem
	export let type = ''
	export let aspectRatio
	export let isBrowse = false
	let hovering = false
	let loading
	let isHidden
	let showing = false
	let menuToggle = showing ? true : false
	let width
	let RATIO_SQUARE = item.aspectRatio.includes('SQUARE') ? true : false
	let RATIO_RECT =
		item.aspectRatio.includes('TWO_LINE_STACK') ||
		item.aspectRatio.includes('16_9')
			? true
			: false
	let DropdownItems = [
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
			action: () => list.addNext(item, $key)
		}
	]
	onMount(() => {
		if (item.endpoint?.pageType?.includes('ARTIST')) {
			console.log(item.title)
		}
	})
	const clickHandler = async (index) => {
		loading = true
		if (type == 'trending') {
			isBrowse
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
			item.endpoint.pageType.includes('ARTIST') &&
				goto(`/artist/${item?.endpoint?.browseId}`)
			!isBrowse &&
			item.videoId !== undefined &&
			!item.endpoint.pageType.includes('ARTIST')
				? await list.initList(item.videoId, item.playlistId, index)
				: browseHandler()
			loading = false
		}
	}
	function browseHandler() {
		if (item.endpoint?.pageType?.includes('ARTIST')) {
			console.log(item)

			goto(`/artist/${item?.endpoint?.browseId}`)
		} else {
			item.endpoint.pageType.includes('PLAYLIST')
				? goto('/playlist?list=' + item.endpoint.browseId)
				: goto(
						'/release?type=' +
							encodeURIComponent(item.endpoint.pageType) +
							'&id=' +
							encodeURIComponent(item.endpoint?.browseId)
				  )
		}
	}

	let srcImg =
		item.thumbnails[0].width <= 60
			? item.thumbnails[0].url.replace(/=(w(\d+))-(h(\d+))/g, '=w256-h256')
			: item.thumbnails[0].url
</script>

<svelte:window bind:outerWidth={width} />
<div class="container carouselItem">
	<section
		class="item"
		class:item16x9={RATIO_RECT ? true : false}
		class:item1x1={RATIO_SQUARE ? true : false}
		on:mouseover={() => {
			hovering = true
		}}
		on:focus={() => {
			hovering = true
		}}
		on:mouseleave={() => {
			hovering = false
			if (width > 550) {
				menuToggle = false
			}
		}}
		transition:fade|local
		bind:this={section[index]}>
		<div class="clickable" on:click={() => clickHandler(index)}>
			<div class="img">
				<!-- svelte-ignore a11y-missing-attribute -->
				<div
					class="container"
					class:img16x9={RATIO_RECT ? true : false}
					class:img1x1={RATIO_SQUARE ? true : false}>
					{#if loading}
						<Loading />
					{/if}
					<img
						alt="thumbnail"
						transition:fade|local
						on:error={(e) => {
							e.currentTarget.onerror = null
							e.currentTarget.src = '/assets/error.svg'
							srcImg = '/logo-header.png'
						}}
						class:img16x9={RATIO_RECT}
						loading="lazy"
						type="image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
						src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCI+PGRlZnM+PHBhdGggZD0iTS02LjU0LTUuNjFoNTEydjUxMmgtNTEydi01MTJ6IiBpZD0icHJlZml4X19hIi8+PC9kZWZzPjx1c2UgeGxpbms6aHJlZj0iI3ByZWZpeF9fYSIgb3BhY2l0eT0iLjI1IiBmaWxsPSIjMjIyIi8+PC9zdmc+"
						use:lazy={{ src: srcImg }} />
				</div>
			</div>

			<div class="cont">
				<div class="text-wrapper">
					<span class="title">
						{item.title.length > 48
							? item.title.substring(0, 48) + '...'
							: item.title}
					</span>
					{#if item.subtitle}
						<div class="subtitles">
							{#each item.subtitle as sub}
								<span class:hidden={sub?.navigationEndpoint}>{sub.text}</span>
								<a
									class:hidden={!sub?.navigationEndpoint}
									on:click|stopPropagation|preventDefault={() => {
										goto(
											'/artist/' +
												sub?.navigationEndpoint?.browseEndpoint?.browseId
										)
									}}
									href={'/artist/' +
										sub?.navigationEndpoint?.browseEndpoint?.browseId}
									><span>{sub.text}</span></a>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>

		{#if !isBrowse}
			<div class="menu" class:mobile={width < 550}>
				{#if hovering || width < 550}
					<Dropdown color="white" bind:isHidden items={DropdownItems} />
				{/if}
			</div>
		{/if}
	</section>
</div>

<style lang="scss">
	@import '../../../global/scss/components/_carousel-item.scss';
	.hidden {
		display: none !important;
		visibility: hidden !important;
	}
</style>
