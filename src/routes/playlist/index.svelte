<script context="module">
	import { api } from '$lib/api'
	export async function load({ page }) {
		const data = await api('playlist', { list: page.query.get('list') })

		const { tracks, header, continuations } = await data.body
		return {
			props: {
				tracks: tracks,
				continuations: continuations,
				header: header
			},
			maxage: 3600,
			status: 200
		}
	}
</script>

<script lang="ts">
	import ListItem from '$components/ListItem/ListItem.svelte'
	import Icon from '$lib/components/Icon/Icon.svelte'
	import lazy from '$lib/lazy'
	import list from '$lib/stores/list'
	import { currentTitle, isPagePlaying } from '$lib/stores/stores'
	import type { Header } from '$lib/types/playlist'
	import { onMount, setContext } from 'svelte'
	export let tracks: PlaylistItem[]
	export let header: Header
	// export let error;
	export let continuations
	const key = {}
	$: hasList = $list.mix.length > 0
	$: isThisPage = false
	let pageTitle = header?.title
	let description
	// setContext(key, header.playlistId);
	console.log(tracks, continuations, header)
	console.log(continuations)
	$: console.log(isThisPage, $isPagePlaying)
	onMount(() => {
		pageTitle =
			pageTitle.length > 64 ? pageTitle.substring(0, 64) + '...' : header.title
		description =
			header.description.length > 240
				? header.description.substring(0, 240) + '...'
				: header.description
		if (header !== undefined) {
			if ((!hasList && !$isPagePlaying) || !header.playlistId) {
				isThisPage = false
			} else if (hasList && $isPagePlaying == header.playlistId) {
				isThisPage = true
			} else {
				isThisPage = false
			}
		}
	})
	// import { getPlaylist } from '$lib/utils'
	let width
</script>

<svelte:head>
	<title
		>{$currentTitle !== undefined ? $currentTitle : 'Playlist'} - Beatbump</title>
</svelte:head>

<svelte:window bind:innerWidth={width} />
{#await tracks}
	<!-- promise is pending -->
	Loading
{:then _}
	<!-- promise was fulfilled -->
	<main>
		<div class="box">
			<div class="info-box">
				<div class="info-wrapper">
					<div class="img">
						<img
							referrerpolicy="origin-when-cross-origin"
							loading="lazy"
							type="image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
							src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0icHJlZml4X19wcmVmaXhfX2ZlYXRoZXIgcHJlZml4X19wcmVmaXhfX2ZlYXRoZXItbGlzdCI+PHBhdGggb3BhY2l0eT0iLjciIHN0cm9rZT0iI2NjYyIgZmlsbD0iIzMzMyIgZD0iTTAgMGgyNHYyNEgweiIvPjwvc3ZnPg=="
							use:lazy={{
								src: header.thumbnails[0].url.replace(
									/=(w(\d+))-(h(\d+))/g,
									'=w256-h256'
								)
							}}
							alt="album" />
					</div>
					<div class="info">
						<div class="info-title">
							<h4 class="box-title">{pageTitle}</h4>
							{#if header?.description}
								<p
									class="subtitle description"
									class:hidden={width < 640 ? true : false}>
									{header.description}
								</p>
								<span>
									<p class="subtitle">
										{header.subtitles.join(' ', '')}
									</p>
									<em
										><small class="subtitle">
											{header.secondSubtitle.join(' ', '')}
										</small>
									</em>
								</span>
							{/if}
							<div class="button-group">
								<button
									on:click={() => {
										list.startPlaylist(tracks[0].playlistId)
									}}
									class="button--outlined"
									><Icon name="play" size="1em" /> Play</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<hr />
		{#each tracks as res, i}
			<ListItem
				page="playlist"
				on:pagePlaying={() => {
					isPagePlaying.set(header.playlistId)
				}}
				item={res}
				index={i} />

			<!-- <img
				loading="lazy"
				src={res.thumbnails[0].url}
				width="32"
				height="32"
				alt="thumbnail" />
			<p>{res.title}</p> -->
		{/each}
	</main>
{:catch error}
	<!-- promise was rejected -->
	{error}
{/await}

<style lang="scss">
	@import '../../lib/shared/listPages.scss';
</style>
