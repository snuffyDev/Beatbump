<script lang="ts">
	import lazy from '$lib/lazy'
	import Loading from '$components/Loading/Loading.svelte'
	import { currentTrack, key } from '$stores/stores'
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
	// $: console.log(loading)
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
					`/artist/${item.subtitle[0].navigationEndpoint.browseEndpoint.browseId}`
				)
			}
		},
		{
			text: 'Add to Queue',
			icon: 'queue',
			action: () => list.addNext(item, $key)
		}
	]
	$: srcImg = item.thumbnails[0].url
	// $: if (width < 525) {
	// 	hovering = false
	// }
	// if (width < 550) {
	// 	hovering = true
	// }
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
					currentTrack.set({ ...$list.mix[0] })
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
						loading = true
						await list.initArtistList(item.videoId, item.playlistId)
						getSrc(item.videoId)
						currentTrack.set({ ...$list.mix[0] })
						// currentTitle.set(res[0].title);
						key.set(0)
						// console.log(data);
					} else {
						loading = true
						await list.startPlaylist(item.playlistId)
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
					{#if type == 'artist'}
						<img
							alt="thumbnail"
							transition:fade|local
							on:error={() => {
								srcImg =
									'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJpc29sYXRpb246aXNvbGF0ZSIgdmlld0JveD0iMCAwIDY0IDY0IiB3aWR0aD0iNjRwdCIgaGVpZ2h0PSI2NHB0Ij48ZGVmcz48Y2xpcFBhdGggaWQ9InByZWZpeF9fYSI+PHBhdGggZD0iTTAgMGg2NHY2NEgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNwcmVmaXhfX2EpIj48cGF0aCBmaWxsPSIjOTk5IiBkPSJNMCAwaDY0djY0SDB6Ii8+PGcgY2xpcC1wYXRoPSJ1cmwoI3ByZWZpeF9fYikiPjx0ZXh0IHRyYW5zZm9ybT0idHJhbnNsYXRlKDI2LjUgNDguOTMyKSIgZm9udC1mYW1pbHk9IkxhdG8iIGZvbnQtd2VpZ2h0PSI0MDAiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiMxNzE4MjQiPj88L3RleHQ+PC9nPjxkZWZzPjxjbGlwUGF0aCBpZD0icHJlZml4X19iIj48cGF0aCB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMy41IDEwLjQpIiBkPSJNMCAwaDE3djQzLjJIMHoiLz48L2NsaXBQYXRoPjwvZGVmcz48L2c+PC9zdmc+'
							}}
							class:img16x9={aspectRatio?.includes('16_9')}
							loading="lazy"
							type="image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
							src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCI+PGRlZnM+PHBhdGggZD0iTS02LjU0LTUuNjFoNTEydjUxMmgtNTEydi01MTJ6IiBpZD0icHJlZml4X19hIi8+PC9kZWZzPjx1c2UgeGxpbms6aHJlZj0iI3ByZWZpeF9fYSIgb3BhY2l0eT0iLjI1IiBmaWxsPSIjMjIyIi8+PC9zdmc+"
							use:lazy={{ src: srcImg }} />
					{:else}
						<img
							on:error={() => {
								srcImg =
									'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJpc29sYXRpb246aXNvbGF0ZSIgdmlld0JveD0iMCAwIDY0IDY0IiB3aWR0aD0iNjRwdCIgaGVpZ2h0PSI2NHB0Ij48ZGVmcz48Y2xpcFBhdGggaWQ9InByZWZpeF9fYSI+PHBhdGggZD0iTTAgMGg2NHY2NEgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNwcmVmaXhfX2EpIj48cGF0aCBmaWxsPSIjOTk5IiBkPSJNMCAwaDY0djY0SDB6Ii8+PGcgY2xpcC1wYXRoPSJ1cmwoI3ByZWZpeF9fYikiPjx0ZXh0IHRyYW5zZm9ybT0idHJhbnNsYXRlKDI2LjUgNDguOTMyKSIgZm9udC1mYW1pbHk9IkxhdG8iIGZvbnQtd2VpZ2h0PSI0MDAiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiMxNzE4MjQiPj88L3RleHQ+PC9nPjxkZWZzPjxjbGlwUGF0aCBpZD0icHJlZml4X19iIj48cGF0aCB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMy41IDEwLjQpIiBkPSJNMCAwaDE3djQzLjJIMHoiLz48L2NsaXBQYXRoPjwvZGVmcz48L2c+PC9zdmc+'
							}}
							alt="thumbnail"
							transition:fade|local
							class:img16x9={aspectRatio?.includes('16_9')}
							loading="lazy"
							type="image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
							src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCI+PGRlZnM+PHBhdGggZD0iTS02LjU0LTUuNjFoNTEydjUxMmgtNTEydi01MTJ6IiBpZD0icHJlZml4X19hIi8+PC9kZWZzPjx1c2UgeGxpbms6aHJlZj0iI3ByZWZpeF9fYSIgb3BhY2l0eT0iLjI1IiBmaWxsPSIjMjIyIi8+PC9zdmc+"
							use:lazy={{ src: srcImg }} />
					{/if}
				</div>
			</div>

			<div class="cont">
				<div class="text-wrapper">
					<span class="title">
						{item.title}
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
					<Dropdown bind:isHidden items={DropdownItems} />
				{/if}
			</div>
		{/if}
	</section>
</div>

<style lang="scss">
	@import '../../../global/scss/components/_carousel-item.scss';
</style>
