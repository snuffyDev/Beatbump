<script context="module">
	export const ssr = true
	// your script goes here
</script>

<script>
	import Loading from '$components/Loading/Loading.svelte'
	import { page } from '$app/stores'
	import { getData } from '$lib/utils'
	import { onMount } from 'svelte'
	import * as utils from '$lib/utils'
	import Icon from '$components/Icon/Icon.svelte'
	import ListItem from '$components/ListItem/ListItem.svelte'
	import { currentMix, currentTitle, currentTrack, key } from '$stores/stores'
	import lazy from '$lib/lazy'
	let browseId = $page.query.get('id')
	// console.log(browseId)
	let pageType = $page.query.get('type')
	let items = []
	$: info = []
	let loading = false
	let explicit
	let type
	let playlistId = ''
	onMount(async () => {
		loading = true
		const data = await getData('', '', 'browse', browseId, pageType, '', '')
		console.log(data)
		if (data) {
			let {
				frameworkUpdates: {
					entityBatchUpdate: { mutations }
				}
			} = await data
			let arr = mutations
			console.log(mutations)
			let temp = []
			info = []
			arr.forEach((d) => {
				if (d.payload.hasOwnProperty('musicTrack')) {
					temp.push(d.payload.musicTrack)
				}
				if (d.payload.hasOwnProperty('musicAlbumRelease')) {
					info.push(d.payload.musicAlbumRelease)
				}
			})
			if (info) playlistId = info[0].radioAutomixPlaylistId
			items = [
				...temp.map((item) => {
					let explicit = false
					if (
						item.contentRating.explicitType.includes(
							'MUSIC_ENTITY_EXPLICIT_TYPE_EXPLICIT'
						)
					) {
						explicit = true
					}
					return {
						playlistId: playlistId ? playlistId : '',
						thumbnail: item.thumbnailDetails.thumbnails[0].url,
						videoId: item.videoId,
						title: item.title,
						index: item.albumTrackIndex,
						artistNames: item.artistNames,
						explicit: explicit
					}
				})
			]
			console.log(info)
			console.log(items)
			loading = false
		}
	})
	let radio = []
</script>

<svelte:head>
	<title>{$currentTitle == '' ? 'Album' : $currentTitle} - Beatbump</title>
</svelte:head>

{#if !loading}
	<main>
		<div class="m-alert-danger">
			<h6>Note: This is a work in progress.</h6>
		</div>
		<div class="box">
			{#each info as info}
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
								use:lazy={{
									src: info.thumbnailDetails.thumbnails[1].url.replace(
										/=(w(\d+))-(h(\d+))/g,
										'=w256-h256'
									)
								}}
								alt="album" />
						</div>
						<div class="info">
							<div class="info-title">
								<h4>{info.title}</h4>
								<span>
									<p>
										{info.artistDisplayName} &CenterDot;
										<small>{info.releaseDate.year}</small>
										&CenterDot;
										<small
											>{info.trackCount > 1
												? `${info.trackCount} tracks`
												: `${info.trackCount} track`}</small>
									</p>
								</span>
							</div>
							<button
								class="playAlbum"
								on:click={async () => {
									let mix = await utils
										.getNext(0, '', '', info.radioAutomixPlaylistId)
										.then((data) => {
											let tempList = []
											// console.log(data)
											// let rList = data.results
											// console.log(rList)
											let rList = data.results

											radio = [
												...rList.map((d, i) => ({
													autoMixList: d.autoMixList,
													continuation: data.continuation,
													artistId: d.artistInfo.browseId,

													itct: data.itct,
													id: d.index,
													videoId: d.videoId,
													title: d.title,
													artist: d.artistInfo.artist,
													thumbnail: d.thumbnail,
													length: d.length
												}))
											]
											return radio
										})
									// console.log(radio)
									const play = await utils
										.getSrc(radio[0].videoId)
										.then((p) => console.log(p))
									// @ts-ignore
									currentMix.set({
										list: [...radio]
									})
									key.set(0)
									// currentTrack.set({
									// 	id: 0,
									// 	videoId: id,
									// 	title: radio[0].title,
									// 	thumbnail: thumbnail
									// })
									currentTitle.set(radio[0].title)
								}}
								><Icon name="play" size="1.5em" />
								Album Radio</button>
							<!-- <button class="radioMix" on:click={async () => {}}
								><Icon name="play" size="1.5em" />
								Album Radio</button
							> -->
						</div>
					</div>
					<div class="play-box" />
				</div>
			{/each}
		</div>
		<ul>
			{#each items as item, index}
				<ListItem {item} {index} />
			{/each}
		</ul>
	</main>
{:else}
	<Loading />
{/if}

<!-- markup (zero or more items) goes here -->
<style lang="scss">
	.m-alert-danger {
		h6 {
			margin: 0;
		}
	}
	.item {
		cursor: pointer;
	}
	.info-wrapper {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		flex: none;
		/* margin-left: auto; */
	}
	button {
		font-family: 'Commissioner', sans-serif;

		flex-wrap: nowrap;
		display: flex;
		place-items: center;
		color: #09090a !important;
		font-weight: 600;
		border: #09090a;
		background: white !important;
		margin-bottom: 0.8rem;
		font-size: 1.1rem;
		padding: 0.3em;
	}
	// .radioMix {
	// 	background: transparent !important;
	// 	border: white 0.1rem solid !important;
	// 	color: white !important;
	// 	svg > * {
	// 		fill: white;
	// 	}

	// 	&:active,
	// 	&:hover {
	// 		border: rgb(158, 158, 158) 0.1rem solid !important;
	// 		background: rgba(255, 255, 255, 0.027) !important;
	// 		box-shadow: 0 0 0.1em 0 inset black;
	// 		color: rgb(236, 236, 236) !important;
	// 	}
	// }
	li,
	.box {
		align-content: center;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		margin: 1em;
		background-color: rgb(170 170 170 / 10%);
		padding: 0.8em;
		border-color: rgb(170 170 170);
		border-width: 1px;
		border-radius: 0.8em;
		transition: all 0.23s cubic-bezier(0.39, 0.575, 0.565, 1);
		// /* display: flex; */
		/* flex-wrap: wrap; */
		display: block;
	}
	// .box {
	// 	display: block;
	// 	flex-wrap: unset;
	// }
	.img {
		position: relative;
		aspect-ratio: 1/1;
		width: 100%;
		height: 100%;
		object-fit: contain;
		max-width: 18.2857rem;
		max-height: 18.2857rem;
		img {
			box-shadow: 0 0 1.5rem 0.125rem rgb(0 0 0 / 37%);
			/* max-width: inherit; */
			/* max-height: inherit; */
			max-width: 18.2857rem;
			max-height: 18.2857rem;
			-o-object-fit: scale-down;
			object-fit: scale-down;
			aspect-ratio: inherit;
			height: 100%;
			width: 100%;
		}
	}

	.info {
		/* margin-left: auto; */
		margin-right: auto;
		padding-left: 1.5rem;
		/* float: revert;*/
	}
	ul {
		padding: 0;
		margin: 0;
	}
	p {
		// margin: 0;
	}
	.info-box {
		display: flex;
		flex-direction: column;
		flex: none;
	}
	.number {
		width: 2rem;
		font-size: 1.125rem;
		font-weight: 600;
		margin-right: 0.75rem;
		margin-left: 0.75rem;
	}
	@media screen and (min-width: 513px) and (max-width: 800px) {
		.img {
			margin-right: auto;
		}
		.info {
			/* margin-right: auto; */
			padding-left: 0.5rem;
			padding-top: 0rem;
		}
	}
	@media screen and (max-width: 512px) {
		.img {
			margin-right: auto;
			max-width: 10rem;
			max-height: 10rem;
			align-self: center;
		}
		.info {
			/* margin-right: auto; */
			margin-left: 0.5rem;
			padding-left: 0;
			// padding-top: 1rem;
		}
		.info-wrapper {
			display: flex;
			flex-direction: row;
			flex-wrap: nowrap;
			flex: 1 1 auto;
			/* margin-left: auto; */
		}
		.info-box {
			display: flex;
			flex-direction: column;
			flex: none;
		}
	}
</style>
