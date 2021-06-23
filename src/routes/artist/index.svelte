<script>
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
				items = [...d.songs]

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
			<section>
				<h4>Songs</h4>
				<section class="songs">
					{#each items as item, index}
						<ListItem {item} {index} />
					{/each}
				</section>
			</section>
			{#each carouselItems as carousel}
				<section>
					{#if carousel.header[0].title}
						<h4>{carousel.header[0].title}</h4>
					{:else}
						<h4>{carousel.header}</h4>
					{/if}
					<section class="grid">
						{#each carousel.contents as item, index}
							<!-- <ListItem {item} {index} /> -->
							<div class="grid-item">
								<img src={item.thumbnails[0].url} alt="Thumbnail" />
								<p class="item-title">{item.title}</p>
							</div>
						{/each}
					</section>
				</section>
			{/each}
		</div>
	</main>
{/await}

<style lang="scss">
	.grid-item {
	}
	.item-title {
		font-size: 1.25rem;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		grid-gap: 2rem;
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
