<script>
	import { goto } from '$app/navigation'
	import Carousel from '$lib/Carousel.svelte'
	import ArtistPageHeader from '../../lib/ArtistPageHeader.svelte'

	import Loading from '$lib/Loading.svelte'
	import { getData } from '$lib/utils'
	import { page } from '$app/stores'

	import { parseArtistPage } from '$lib/js/artistUtils'
	import Icon from '$lib/Icon.svelte'
	import ListItem from '$lib/ListItem.svelte'

	let id = $page.query.get('id')
	let description = ''
	let width
	let headerContent = {}
	let items = []
	let thumbnail = []
	let carouselItems = []
	let promise = parser()
	async function parser() {
		return await getData('', '', 'browse', id, 'MUSIC_PAGE_TYPE_ARTIST')
			.then(
				({
					header: { musicImmersiveHeaderRenderer },
					contents: {
						singleColumnBrowseResultsRenderer: {
							tabs: [
								{
									tabRenderer: {
										content: {
											sectionListRenderer: { contents }
										}
									}
								}
							]
						}
					}
				}) => {
					return parseArtistPage(musicImmersiveHeaderRenderer, contents)
				}
			)
			.then((d) => {
				console.log(d)
				carouselItems = [...d.carouselItems]
				headerContent = d[0]
				headerContent.thumbnails.forEach((h) => {
					thumbnail.push(h)
				})
				if (d.songs) {
					items = [...d.songs]
				} else {
					items = undefined
				}

				description = headerContent.description.split('.')
				// console.log(headerContent, d, description, items)
				return { headerContent, items }
			})
	}
	if (width < 501) {
		description = headerContent.description.split('.')
		// console.log(description)
	}
</script>

<svelte:head>
	<title
		>{headerContent.name == undefined
			? 'Artist - '
			: `${headerContent.name} - `}Beatbump</title>
</svelte:head>

<svelte:window bind:innerWidth={width} />

{#await promise}
	<Loading />
{:then _}
	<main>
		<ArtistPageHeader
			bind:description
			bind:headerContent
			bind:width
			bind:thumbnail />
		<div class="artist-body">
			<button class="radio-button"
				><Icon size="1.5rem" name="radio" /><span class="btn-text">
					Play Radio</span
				></button>
			{#if items !== undefined}
				<section>
					<h4 class="grid-title">Songs</h4>
					<section class="songs">
						{#each items as item, index}
							<ListItem {item} {index} />
						{/each}
					</section>
				</section>
			{/if}
			{#each carouselItems as carousel}
				<!-- <Carousel
					setTitle={carousel.header[0].title
						? carousel.header[0].title
						: carousel.header}
					items={carousel.contents}
					type="trending" /> -->
				<section>
					{#if carousel.header[0].title}
						<h4 class="grid-title">{carousel.header[0].title}</h4>
					{:else}
						<h4 class="grid-title">{carousel.header}</h4>
					{/if}
					<section class="grid">
						{#each carousel.contents as item, index}
							<!-- <ListItem {item} {index} /> -->
							<div
								class="grid-item"
								on:click={() => {
									if (
										carousel?.header[0]?.title?.includes('Singles') ||
										carousel?.header[0]?.title?.includes('Albums')
									) {
										goto(`/release?id=${item.browseEndpoint.browseId}`)
									} else if (
										carousel?.header?.includes('Singles') ||
										carousel?.header?.includes('Albums')
									) {
										goto(`/release?id=${item.browseEndpoint.browseId}`)
									}
								}}>
								<div class="row">
									<div class="thumbnail-wrapper">
										<img
											loading="lazy"
											class="thumbnail"
											src={item.thumbnails[0].url}
											alt="Thumbnail" />
									</div>
									<div class="content-wrapper">
										<span class="item-title">{item.title}</span>
									</div>
								</div>
							</div>
						{/each}
					</section>
				</section>
			{/each}
		</div>
	</main>
{/await}

<style lang="scss">
	.row {
		display: grid;
		/* flex-direction: row; */
		/* flex: 1 0 auto; */
		place-items: center;
		grid-template-rows: repeat(auto-fill, minmax(50px, 1fr));
	}
	.content-wrapper {
		display: flex;
		max-width: inherit;
		margin: 0.5rem 0 0.5em 0;
	}
	.grid-title {
		font-weight: 600;
		font-size: 1.75rem;
		padding: 0 0em 0 0.75rem;
		margin: 1.5rem 0;
	}
	.grid-item {
		/* display: flex; */
		/* flex-direction: column; */
		/* flex-wrap: nowrap; */
		transition: all 50ms cubic-bezier(0.16, 0.73, 0.85, 0.49);
		position: relative;
		padding: 1em;
		margin: 0;
		&:before {
			content: '';
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			width: 100%;
			border-radius: 0.8rem;
			background: rgb(255 255 255 / 1%);
		}
		&:before:hover {
			background: rgba(170, 170, 170, 0.041);
		}
		.thumbnail-wrapper {
			cursor: pointer;
			width: 100%;
			height: auto;
			max-width: 12rem;
			max-height: 12rem;
			aspect-ratio: 1/1;
			position: relative;
			/* bottom: 0; */
			/* right: 0; */
			/* left: 0; */
			/* top: 0; */
			background: none;
			justify-self: center;
		}
		&:hover {
			background: rgba(170, 170, 170, 0.041);
			.thumbnail-wrapper {
				box-shadow: 0em 0em 1em 0.1em #bbbbbb0a;

				// outline: #1f1c3173 solid 0.0125rem;
			}
		}
		.thumbnail {
			width: 100%;
			height: 100%;
			-o-object-fit: scale-down;
			object-fit: scale-down;
			max-height: 100%;
			max-width: 100%;
			aspect-ratio: inherit;
			position: absolute;
			bottom: 0;
			top: 0;
			right: 0;
			left: 0;
		}
	}
	.item-title {
		font-size: 1rem;
		cursor: pointer;
		margin: 0;
		padding: 0;
	}
	.grid {
		display: grid;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(12.85rem, 1fr));
		grid-gap: 1.7rem 1.2rem;
		// grid-gap: 1rem 1.5rem;
		@media screen and (max-width: 575px) {
			grid-template-columns: repeat(auto-fit, minmax(12.85rem, 1fr));
		}
	}
	.songs {
		margin-bottom: 1rem;
	}
	.artist-body {
		padding: 0 2rem;
		@media screen and (max-width: 500px) {
			padding: 0 1rem;
		}
	}
	button {
		flex-wrap: nowrap;
		display: flex;
		place-items: center;
		color: #09090a !important;
		font-weight: 550;
		border: #09090a;
		background: white !important;
		margin-bottom: 0.8rem;

		padding: 0.3rem;
	}
	.radio-button {
		margin-left: 0.5rem;
		background: transparent !important;
		border: white 0.1rem solid !important;
		color: white !important;

		&:active,
		&:hover {
			border: rgb(158, 158, 158) 0.1rem solid !important;
			background: rgba(255, 255, 255, 0.027) !important;
			box-shadow: 0 0 0.1em 0 inset black;
			color: rgb(236, 236, 236) !important;
		}
	}
	.btn-text {
		margin-left: 0.25rem;
	}
	main {
		margin: 0;
		padding: 0;
	}
</style>
