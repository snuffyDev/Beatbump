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
	$: isLoading = loading ? true : false
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
	let srcImg = item.thumbnails[0].url
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
						await list.initList(item.videoId, item.playlistId)
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
				{#if loading}
					<Loading />
				{/if}
				<!-- svelte-ignore a11y-missing-attribute -->
				<div
					class="container"
					class:img16x9={aspectRatio?.includes('16_9')
						? true
						: false || type == 'trending'}
					class:img1x1={aspectRatio?.includes('SQUARE') ? true : false}>
					{#if type == 'artist'}
						<img
							alt="thumbnail"
							transition:fade|local
							class:img16x9={aspectRatio?.includes('16_9')}
							loading="lazy"
							type="image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
							src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCI+PGRlZnM+PHBhdGggZD0iTS02LjU0LTUuNjFoNTEydjUxMmgtNTEydi01MTJ6IiBpZD0icHJlZml4X19hIi8+PC9kZWZzPjx1c2UgeGxpbms6aHJlZj0iI3ByZWZpeF9fYSIgb3BhY2l0eT0iLjI1IiBmaWxsPSIjMjIyIi8+PC9zdmc+"
							use:lazy={{ src: srcImg }} />
					{:else}
						<img
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
	.subtitles {
		display: inline;
	}
	.text-wrapper {
		display: inline-flex;
		flex-direction: column;
	}
	.item1x1 {
		// padding-top: 100% !important;
		width: 13rem !important;
	}
	.item16x9 {
		// padding-top: 56.25% !important;
		width: 17rem !important;
	}
	.img1x1 {
		// padding-top: 100% !important;
		aspect-ratio: 1/1 !important;
	}
	.img16x9 {
		// padding-top: 56.25% !important;
		aspect-ratio: 16/9 !important;
	}
	.container.carouselItem {
		position: relative;
		padding-bottom: 5ch;
	}
	.menu {
		position: absolute;
		right: 5%;
		top: 2.5%;
		padding-top: 0rem;
		// padding-right: 0.0125rem;
		z-index: 1;
		padding: 0.5ch;
	}
	.title {
		cursor: pointer;
		display: inline;
		font-weight: 450;
		font-size: 1.05em;
		font-family: 'Commissioner', sans-serif;
		margin-bottom: 0.8em;
		letter-spacing: -0.02em;
	}

	section {
		padding-left: 1rem;
		padding-right: 0.5rem;
		margin-top: 0.5rem;
		margin-bottom: 0rem;
		display: block;
		content: '';
		// padding-bottom: 1.8em;

		::before {
			display: block;
		}
		/* You could reduce this expression with a preprocessor or by doing the math. I've kept the longer form in `calc()` to make the math more readable for this demo. */
	}
	section.item {
		scroll-snap-align: start;
		min-height: 16.75rem;
		height: auto;
		width: 100%;
		min-width: 12rem;
		max-width: 20rem;
		position: relative;
		@media screen and (max-width: 500px) {
			max-width: 17rem;
		}
	}

	.img {
		height: auto;
		width: 100%;
		aspect-ratio: inherit;
		.container {
			position: relative; /* If you want text inside of it */

			aspect-ratio: inherit;
			cursor: pointer;
			width: 100%;
			position: relative;

			// padding-top: 100%; /* 1:1 Aspect Ratio */
			&::before {
				position: absolute;
				content: '';
				top: 0;
				right: 0;

				bottom: 0;
				left: 0;
				background: linear-gradient(rgba(0, 0, 0, 0.473), rgba(0, 0, 0, 0));

				transition: opacity cubic-bezier(0.29, -0.3, 0.7, 0.95) 0.15s;
				opacity: 0.1;
				z-index: 1;
			}
			&:hover::before {
				// transition: all cubic-bezier(0.42, 0.16, 0.58, 0.8) 0.2s !important;
				background: linear-gradient(rgba(0, 0, 0, 0.534), rgba(0, 0, 0, 0.11));
				opacity: 0.6;
				z-index: 1;
			}
			img {
				width: 100%;
				height: auto;
				aspect-ratio: inherit;
				// position: absolute;
				border-radius: var(--sm-radius);

				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
			}
		}
	}
	.cont {
		margin-top: 1em;
		// margin-right: var(--lg-spacing);
	}
	.scroll-container {
	}
</style>
