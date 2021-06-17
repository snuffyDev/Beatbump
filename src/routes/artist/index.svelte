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
	let headerContent
	let items = []
	let thumbnail = []
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
		</div>
	</main>
{/await}

<style lang="scss">
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
		svg > * {
			fill: white;
		}

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
	.artist-header {
		display: block;
		margin-bottom: 0.5rem;
	}
	.artist-thumbnail {
		display: block;
		position: relative;
		background: linear-gradient(360deg, #000 8.98%, rgba(0, 0, 0, 0) 100%);
		height: 100%;
	}
	.header-thumbnail {
		z-index: -1;
		top: 0;
		width: 100%;
		max-height: 25%;
		overflow: hidden;
		&::before {
			position: absolute;
			content: '';
			top: 0;
			right: 0;

			bottom: 0;
			left: 0;
			background: linear-gradient(360deg, #09090a 8.98%, rgba(0, 0, 0, 0) 100%);
			z-index: 5;
			transition: all cubic-bezier(0.42, 0, 0.58, 1) 0.2s !important;
			opacity: 1;
		}
	}
	.artist-content {
		position: relative;
		z-index: 5;
		.content-wrapper {
			position: absolute;
			bottom: 0;
			margin-bottom: 0.5rem;
			padding-left: 2rem;

			.description {
				display: block;
				padding: 0 2rem 2rem 2rem;
			}
			.name {
				font-size: 5rem;
				font-weight: 700;
				display: block;
				padding: 0 2rem 0 2rem;
				@media screen and (max-width: 500px) {
					inline-size: 150px;
					overflow-wrap: break-word;
					font-size: 3rem;
					padding: 2rem;
				}
			}
		}
	}
	.gradient {
		@include scrim(#000000ef, 'to top', 1);
	}
	main {
		margin: 0;
		padding: 0;
	}
</style>
