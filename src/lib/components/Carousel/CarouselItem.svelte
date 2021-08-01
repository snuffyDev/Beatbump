<script lang="ts">
	import lazy from '$lib/lazy'
	import Loading from '$components/Loading/Loading.svelte'
	import { key } from '$stores/stores'
	import { fade } from 'svelte/transition'
	import Dropdown from '$components/Dropdown/Dropdown.svelte'
	import { goto } from '$app/navigation'

	import { getSrc } from '$lib/utils'
	import type { SearchResult } from '$lib/types'
	import list from '$lib/stores/list'
	import { tick } from 'svelte'
	export let section
	export let index
	export let item: SearchResult
	export let type = ''
	export let aspectRatio
	export let isBrowse = false
	let hovering = false
	let loading
	let isHidden
	let showing = false
	let menuToggle = showing ? true : false
	let width
	let mobile = width < 525

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
	let srcImg =
		item.thumbnails[0].width <= 60
			? item.thumbnails[0].url.replace(/=(w(\d+))-(h(\d+))/g, '=w256-h256')
			: item.thumbnails[0].url
</script>

<svelte:window bind:outerWidth={width} />
<div class="container carouselItem">
	<section
		class="item"
		class:item16x9={aspectRatio?.includes('16_9')
			? true
			: false || type == 'trending'}
		class:item1x1={aspectRatio?.includes('SQUARE') ? true : false}
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
		<div
			class="clickable"
			on:click={async () => {
				loading = true
				if (type == 'trending') {
					await list.initList(item.videoId, item.playlistId)
					key.set(0)
				}
				if (type == 'new') {
					let id = item.endpoint?.browseId
					let type = item.endpoint?.pageType
					window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
					goto(
						'/release?type=' +
							encodeURIComponent(type) +
							'&id=' +
							encodeURIComponent(id)
					)
				}
				if (type == 'artist') {
					if (isBrowse) {
						goto(`/artist/${item?.endpoint?.browseId}`)
					} else if (item.videoId !== undefined) {
						console.log('data')
						loading = true
						await list.initList(item.videoId, item.playlistId, index)
						// currentTitle.set(res[0].title);
						key.set(index)
					} else {
						loading = true
						list.startPlaylist(item.playlistId)
						key.set(0)
					}
				}

				loading = false
			}}>
			<div class="img">
				<!-- svelte-ignore a11y-missing-attribute -->
				<div
					class="container"
					class:img16x9={aspectRatio?.includes('16_9')
						? true
						: false || type == 'trending'}
					class:img1x1={aspectRatio?.includes('SQUARE') ? true : false}>
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
						class:img16x9={aspectRatio?.includes('16_9')}
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
								<span>{sub.text}</span>
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
</style>
