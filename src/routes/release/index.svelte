<script context="module">
	export async function load({ query, page, fetch }) {
		const browseId = page.query.get('id') || ''
		const pt = page.query.get('type') || ''
		const response = await fetch(
			`/api/main.json?q=&endpoint=browse${
				browseId ? `&browseId=${browseId}` : ''
			}${pt ? `&pt=${pt}` : ''}`
		)
		const data = await response.json()
		if (!response.ok) {
			return {
				props: {
					status: response.statusCode,
					msg: response.statusText
				}
			}
		}

		return {
			props: {
				data: data,
				id: browseId
			},
			maxage: 3600,
			status: 200
		}
	}
</script>

<script lang="ts">
	import { page } from '$app/stores'
	import type { mixList } from '$lib/types'
	import { onMount } from 'svelte'
	import Icon from '$components/Icon/Icon.svelte'
	import ListItem from '$components/ListItem/ListItem.svelte'
	import { currentTitle, theme, key } from '$stores/stores'
	import { parsePageContents } from '$lib/js/releaseUtils'
	import { isPagePlaying } from '$stores/stores'
	import list from '$lib/stores/list'
	export let data
	export let id

	const promise = parsePageContents(data)
	let { details, items } = promise
	// console.log(promise)
	const playAlbum = () => {
		list.startPlaylist(details.audioPlaylistId)
		key.set(0)
		currentTitle.set(items[0].title)
	}
	const playRadio = () => {
		list.initList(items[0].videoId, details.radioAutomixPlaylistId, 0)
		currentTitle.set(items[0].title)
	}

	$: hasList = $list.mix.length > 0
	$: isThisPage = false

	if (hasList && $isPagePlaying !== id) {
		isThisPage = false
	} else if (hasList && $isPagePlaying == id) {
		isThisPage = true
	} else {
		isThisPage = false
	}
</script>

<svelte:head>
	<title
		>{$currentTitle !== '' || undefined ? 'Album' : $currentTitle} - Beatbump</title>
</svelte:head>

{#await promise then _}
	<main>
		<div class="box">
			<div class="info-box">
				<div class="info-wrapper">
					<div class="img">
						<img
							referrerpolicy="origin-when-cross-origin"
							width="18.2857rem"
							height="18.2857rem"
							loading="lazy"
							type="image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
							data-src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0icHJlZml4X19wcmVmaXhfX2ZlYXRoZXIgcHJlZml4X19wcmVmaXhfX2ZlYXRoZXItbGlzdCI+PHBhdGggb3BhY2l0eT0iLjciIHN0cm9rZT0iI2NjYyIgZmlsbD0iIzMzMyIgZD0iTTAgMGgyNHYyNEgweiIvPjwvc3ZnPg=="
							src={details?.thumbnailDetails.thumbnails[1].url.replace(
								/=(w(\d+))-(h(\d+))/g,
								'=w256-h256'
							)}
							alt="album" />
					</div>
					<div class="info">
						<div class="info-title">
							<h4>{details.title}</h4>
							<span>
								<p>
									<a href={`/artist/${details.artistChannelId}`}
										>{details.artistDisplayName}</a>
									&CenterDot;
									<small>{details.releaseDate.year}</small>
									&CenterDot;
									<small
										>{details.trackCount > 1
											? `${details.trackCount} tracks`
											: `${details.trackCount} track`}</small>
								</p>
							</span>
						</div>
						<button
							on:click={() => {
								playAlbum()
							}}
							><Icon name="play" size="1.5em" />
							Play Album</button>
						<button
							class="radioMix"
							class:radioMix-light={$theme.includes('light')}
							on:click={() => playRadio()}
							><Icon name="play" size="1.5em" />
							Album Radio</button>
					</div>
				</div>
				<div class="play-box" />
			</div>
		</div>
		{#each items as item, index}
			<ListItem
				page="release"
				on:pagePlaying={() => {
					isPagePlaying.set(id)
				}}
				{item}
				{index} />
		{/each}
	</main>
{:catch error}
	{error}
{/await}

<!-- markup (zero or more items) goes here -->
<style lang="scss">
	@import '../../lib/shared/listPages.scss';

	button {
		font-family: 'Commissioner' sans-serif;
		font-weight: 500 !important;
	}
	.radioMix:not(.radioMix-light) :not(.light) {
		background-color: transparent !important;
		border-color: white !important;
		color: rgb(255, 255, 255) !important;
		> svg {
			color: white !important;
		}
		&:hover:not(.light),
		&:active:not(.light) {
			background-color: #f2f2f20e !important;
			border-color: #ffffff !important;
		}
		&:active:not(.light) {
			background-color: #f2f2f2a2 !important;
			border-color: #c0c0c0 !important;
			color: #121212 !important;
		}
	}
	.radioMix-light {
		background-color: lighten(#aba9c3ff, 20%) !important;
		border-color: #0f0f0f !important;
		color: #141414 !important;
		&:hover,
		&:active {
			background-color: rgba(242, 242, 242, 0.479) !important;
			border-color: #3d3d3d !important;
		}
		&:active {
			background-color: #f2f2f24d !important;
			border-color: #0f0f0f !important;
			color: #121212 !important;
		}
	}

	@media screen and (max-width: 640px) {
		small {
			font-size: 1rem;
		}
	}
</style>
