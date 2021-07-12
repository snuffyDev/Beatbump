<script>
	import lazy from '$lib/lazy'
	import { trendingHandler } from '$lib/js/indexUtils'
	import Loading from '$components/Loading/Loading.svelte'
	import { currentMix, currentTitle, currentTrack, key } from '$stores/stores'
	import { fade } from 'svelte/transition'
	import Dropdown from '$components/Dropdown/Dropdown.svelte'
	import { goto } from '$app/navigation'
	import Icon from '$components/Icon/Icon.svelte'

	import { addToQueue, getSrc } from '$lib/utils'
	import { clickOutside } from '$lib/js/clickOutside'
	export let section
	export let index
	export let item
	export let type = ''
	export let imgWidth
	export let imgHeight
	let hovering = false
	let isLoading = false
	let loading = isLoading ? true : false
	let showing = false
	let menuToggle = showing ? true : false
	let width
	// $: if (width < 525) {
	// 	hovering = false
	// }
	// if (width < 550) {
	// 	hovering = true
	// }
</script>

<svelte:window bind:outerWidth={width} />
<div class="item">
	<section
		class="item"
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
				if (type == 'trending' && !loading) {
					trendingHandler(item).then(() => {
						loading = !loading
						key.set(0)
					})
					loading = !loading
				} else if (type == 'artist' && !loading) {
					const data = await fetch(
						`/api/artistNext.json?playlistId=${item.playlistId}&videoId=${item.videoId}`
					).then((data) => data.json())
					const res = await data
					await getSrc(res[0].videoId)
					currentMix.set({
						videoId: `${res.videoId}`,
						playlistId: `${res.playlistId}`,
						continuation: '',
						list: [
							...res.map((d, i) => ({
								continuation: '',
								itct: d.itct,
								autoMixList: d.autoMixList,
								artistId: d.artistInfo.browseId,
								id: d.index,
								videoId: d.videoId,
								title: d.title,
								artist: d.artistInfo.artist,
								thumbnail: d.thumbnail,
								length: d.length
							}))
						]
					})
					currentTrack.set({ ...res[0] })
					currentTitle.set(res[0].title)
					key.set(0)
					console.log(data)
				}
			}}>
			<div class="img">
				{#if loading}
					<Loading />
				{/if}
				<!-- svelte-ignore a11y-missing-attribute -->
				<div class="container">
					{#if type == 'artist'}
						<img
							style="aspect-ratio:{imgWidth}/{imgHeight}"
							alt="thumbnail"
							transition:fade|local
							referrerpolicy="origin-when-cross-origin"
							loading="lazy"
							type="image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
							data-src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCI+PGRlZnM+PHBhdGggZD0iTS02LjU0LTUuNjFoNTEydjUxMmgtNTEydi01MTJ6IiBpZD0icHJlZml4X19hIi8+PC9kZWZzPjx1c2UgeGxpbms6aHJlZj0iI3ByZWZpeF9fYSIgb3BhY2l0eT0iLjI1IiBmaWxsPSIjMjIyIi8+PC9zdmc+"
							src={item.thumbnails[0].url} />
					{:else}
						<img
							alt="thumbnail"
							referrerpolicy="origin-when-cross-origin"
							transition:fade|local
							loading="lazy"
							type="image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
							data-src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCI+PGRlZnM+PHBhdGggZD0iTS02LjU0LTUuNjFoNTEydjUxMmgtNTEydi01MTJ6IiBpZD0icHJlZml4X19hIi8+PC9kZWZzPjx1c2UgeGxpbms6aHJlZj0iI3ByZWZpeF9fYSIgb3BhY2l0eT0iLjI1IiBmaWxsPSIjMjIyIi8+PC9zdmc+"
							use:lazy={{
								src: item.thumbnails[0].url
							}} />
					{/if}
				</div>
			</div>
			<div class="cont">
				<div class="text-wrapper">
					<h6 class="title">
						{item.title}
					</h6>
					{#if item.subtitle}
						{#each item.subtitle as sub}
							<span>{sub.text}</span>
						{/each}{/if}
				</div>
			</div>
		</div>
		{#if width < 525}
			<div class="menu">
				<Dropdown>
					<div slot="content">
						<div
							class="dd-item"
							on:click={() => {
								if (item?.subtitle[0]?.navigationEndpoint) {
									goto(
										`/artist?id=${item.subtitle[0].navigationEndpoint.browseEndpoint.browseId}`
									)
								}
							}}
							href={`/artist?id=${
								item.subtitle[0].navigationEndpoint.browseEndpoint.browseId
									? item.subtitle[0].navigationEndpoint.browseEndpoint.browseId
									: ''
							}`}>
							<Icon name="artist" size="1.5em" />
							<div class="dd-text">View Artist</div>
						</div>
						<div
							class="dd-item"
							on:click={async () => {
								if (index !== $key) {
									let mixList = $currentMix.list
									let length = await addToQueue(item.videoId)
									let next = {
										continuation: mixList[0].continuation,
										autoMixList: item.playlistId,
										artistId:
											item.subtitle[0].navigationEndpoint.browseEndpoint
												.browseId,
										id: $key + 1,
										videoId: item.videoId,
										title: item.title,
										artist: item.subtitle[0].text,
										thumbnail: item.thumbnails[0].url,
										length: length
									}
									mixList.splice($key + 1, 0, next)
									console.log(mixList)
								}
							}}>
							<Icon name="queue" size="1.5rem" />
							<div class="dd-text">Add to Queue</div>
						</div>
					</div>
				</Dropdown>
			</div>
		{:else if hovering}
			<div class="menu">
				<Dropdown>
					<div slot="content">
						<div
							class="dd-item"
							on:click={() => {
								if (item?.subtitle[0]?.navigationEndpoint) {
									goto(
										`/artist?id=${item.subtitle[0].navigationEndpoint.browseEndpoint.browseId}`
									)
								}
							}}
							href={`/artist?id=${
								item.subtitle[0].navigationEndpoint.browseEndpoint.browseId
									? item.subtitle[0].navigationEndpoint.browseEndpoint.browseId
									: ''
							}`}>
							<Icon name="artist" size="1.5em" />
							<div class="dd-text">View Artist</div>
						</div>
						<div
							class="dd-item"
							on:click={async () => {
								if (index !== $key) {
									let mixList = $currentMix.list
									let length = await addToQueue(item.videoId)
									let next = {
										continuation: mixList[0].continuation,
										autoMixList: item.playlistId,
										artistId:
											item.subtitle[0].navigationEndpoint.browseEndpoint
												.browseId,
										id: $key + 1,
										videoId: item.videoId,
										title: item.title,
										artist: item.subtitle[0].text,
										thumbnail: item.thumbnails[0].url,
										length: length
									}
									mixList.splice($key + 1, 0, next)
									console.log(mixList)
								}
							}}>
							<Icon name="queue" size="1.5rem" />
							<div class="dd-text">Add to Queue</div>
						</div>
					</div>
				</Dropdown>
			</div>
		{/if}
	</section>
</div>

<style lang="scss">
	.item {
		position: relative;
		padding-bottom: 0.8em;
	}
	.menu {
		position: absolute;
		right: 2%;
		top: 50%;
		padding-top: 0.125rem;
		padding-right: 0.625rem;
	}
	.title {
		cursor: pointer;
		// letter-spacing: 0.02em;
	}

	section {
		padding-left: 1.5rem;
		padding-right: 1.5rem;
		margin-top: 1.5rem;
		margin-bottom: 0rem;
		display: block;
		content: '';
		::before {
			display: block;
		}
		/* You could reduce this expression with a preprocessor or by doing the math. I've kept the longer form in `calc()` to make the math more readable for this demo. */
	}
	section.item {
		scroll-snap-align: start;
		min-height: 16.75rem;
		height: auto;

		width: 16rem;
	}

	.img {
		/* display: block; */
		// min-width: 12.125rem;
		max-width: 12rem;
		// aspect-ratio: 1/1;
		height: auto;
		width: 100%;
		// display: flex;
		// flex: none;
		// max-height: 10rem;
		.container {
			// display: flex;
			// align-items: center;
			// width: 100%;
			// height: 100%;
			// background: rgba(13, 13, 15, 0.3411764705882353);
			// max-width: inherit;
			// max-height: inherit;
			// aspect-ratio: inherit;
			// position: relative;

			cursor: pointer;
			width: 100%;
			max-width: inherit;
			max-height: inherit;
			aspect-ratio: inherit;
			// height: 100%;
			position: relative;

			justify-self: center;
			img {
				width: 100%;
				height: auto;
				max-height: 9rem;
				-o-object-fit: scale-down;
				object-fit: scale-down;
				aspect-ratio: inherit;
				// position: absolute;
				// bottom: 0;
				// top: 0;
				// right: 0;
				// left: 0;
			}
		}
	}
	.cont {
		margin-top: 1em;
		margin-right: 1em;
	}
	.scroll-container {
	}
</style>
