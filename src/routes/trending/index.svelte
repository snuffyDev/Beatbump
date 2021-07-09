<script lang="ts">
	import { currentTitle } from '$lib/stores/stores'
	import Loading from '$lib/components/Loading/Loading.svelte'
	import * as utils from '$lib/utils'

	import Carousel from '$lib/components/Carousel/Carousel.svelte'

	$: content = listNew.length > 0

	$: listNew = []
	$: listTrending = []

	$: titleNew = ' '
	$: titleTrending = ''
	let data
	let moods
	let genres
	let carouselItems = []

	let browseId = 'FEmusic_explore'

	const handler = getTracks()

	function getTracks() {
		utils.moodsAndGenres('FEmusic_moods_and_genres').then((data) => {
			let moodsArr = data[0][0]
			let genresArr = data[1][0]

			genres = [...genresArr.items.slice(0, 10)]
			utils.shuffle(genres)
			moods = [...moodsArr.items.slice(0, 10)]
			return { genres, moods }
		})
		// @ts-ignore
		data = utils
			.getData('', '', 'browse', browseId, '', '', '')
			.then((data) => {
				let {
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
				} = data
				contents.forEach((content) => {
					if (content.hasOwnProperty('musicCarouselShelfRenderer')) {
						carouselItems.push(content)
					}
				})
				carouselItems = carouselItems.map(({ musicCarouselShelfRenderer }) => {
					let ctx = musicCarouselShelfRenderer
					let { header, contents } = ctx
					header = utils.transform(header)

					header = [
						...header.map(({ musicCarouselShelfBasicHeaderRenderer }) => {
							let h = musicCarouselShelfBasicHeaderRenderer
							return {
								title: utils.pb(h, 'title:runs:text', true),
								browseId: utils.pb(
									h,
									'moreContentButton:buttonRenderer:navigationEndpoint:browseEndpoint:browseId',
									true
								)
							}
						})
					]
					let results = []

					contents.map((r) => {
						let type = Object.getOwnPropertyNames(r).toString()
						interface result {
							title: string
							artist: string
							endpoint?: string
							videoId: string
							playlistId: string
							params?: string
							thumbnails: []
							subtitle?: {}[]
						}
						let result: result
						switch (type) {
							case 'musicTwoRowItemRenderer':
								result = {
									title: r.musicTwoRowItemRenderer.title.runs[0].text,
									thumbnails:
										r.musicTwoRowItemRenderer.thumbnailRenderer
											.musicThumbnailRenderer.thumbnail.thumbnails,
									...r.musicTwoRowItemRenderer.navigationEndpoint.watchEndpoint,
									subtitle: [...r.musicTwoRowItemRenderer.subtitle.runs]
								}
								// console.log(result)

								break
							case 'musicResponsiveListItemRenderer':
								result = {
									subtitle: [
										...r.musicResponsiveListItemRenderer.flexColumns[1]
											.musicResponsiveListItemFlexColumnRenderer.text.runs
									],
									title:
										r.musicResponsiveListItemRenderer.flexColumns[0]
											.musicResponsiveListItemFlexColumnRenderer.text.runs[0]
											.text,
									videoId:
										r.musicResponsiveListItemRenderer.flexColumns[0]
											.musicResponsiveListItemFlexColumnRenderer.text.runs[0]
											.navigationEndpoint.watchEndpoint.videoId,
									playlistId:
										r.musicResponsiveListItemRenderer.menu.menuRenderer.items[0]
											.menuNavigationItemRenderer.navigationEndpoint
											.watchEndpoint.playlistId,
									thumbnails:
										r.musicResponsiveListItemRenderer.thumbnail
											.musicThumbnailRenderer.thumbnail.thumbnails
								}
								// console.log(result, 'musicResponse')
								break
							case 'musicNavigationButtonRenderer':
								// console.log('nav')
								break
							default:
								break
						}
						results.push(result)
					})
					return {
						header,
						results
					}
				})
				console.log(carouselItems)
				let newList = contents[1].musicCarouselShelfRenderer
				let trendList = contents[3].musicCarouselShelfRenderer
				let carousel = [newList, trendList]

				titleNew =
					newList.header.musicCarouselShelfBasicHeaderRenderer.title.runs[0]
						.text
				titleTrending = carouselItems[0].header.title
				listTrending = trendList.contents
				listNew = newList.contents
				return { listNew, listTrending, titleNew, titleTrending }
			})

		return { data, genres }
	}
</script>

<svelte:head>
	<title>{$currentTitle == '' ? 'Home' : $currentTitle} - Beatbump</title>
</svelte:head>

{#if !content}
	<Loading />
	{#await handler then _}
		{''}
	{/await}
{:else}
	{''}
{/if}

{#if content}
	<main>
		<Carousel
			setTitle={carouselItems[2].header[0].title}
			items={carouselItems[2].results}
			type="trending" />

		<Carousel
			setTitle={carouselItems[3].header[0].title}
			items={carouselItems[3].results}
			type="trending" />
		<Carousel setTitle={titleNew} items={listNew} type="new" />
		<div class="breakout">
			<div class="box-cont">
				<section-header>Moods</section-header>
				<div class="m-alert-info"><em>Coming Soon!</em></div>
				<box>
					{#each moods as moods}
						<div
							style={`border-left: 0.4286rem solid ${moods.colorCode}`}
							class="box">
							{moods.text}
						</div>
					{/each}
				</box>
				<span class="link" on:click={() => alert('Coming Soon!')}>See All</span>

				<hr />
				<section-header>Genres</section-header>
				<div class="m-alert-info"><em>Coming Soon!</em></div>

				<box>
					{#each genres as genres}
						<div
							style={`border-left: 0.4286rem solid ${genres.colorCode}`}
							class="box">
							{genres.text}
						</div>
					{/each}
				</box>
				<span class="link" on:click={() => alert('Coming Soon!')}>See All</span>
			</div>
		</div>
	</main>
{/if}

<style lang="scss">
	section-header {
		font-weight: 700;
		font-size: 1.5rem;
		margin: 0 0 0rem 0;
	}
	.breakout {
		// border: 2px solid rgba(119, 136, 153, 0.171);
		border-radius: 0.8rem;
		// padding: 0.8rem;
	}
	.box-cont {
		// display: flex;
		// width: 100%;
		// flex-direction: column;
		// flex-wrap: wrap;
		justify-content: space-around;

		padding: 0.8rem;
	}
	box {
		display: grid;
		// grid-gap: 1rem;

		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));

		grid-gap: 0.8rem;
	}
	.box {
		margin-bottom: 0.8rem;
		cursor: pointer;
		background: #17151c;
		display: flex;
		justify-content: flex-start;
		flex-direction: row;
		flex-wrap: nowrap;
		text-overflow: clip;
		font-size: 100%;
		min-width: 180px;
		border-radius: 0.8rem;
		width: 100%;
		align-items: center;
		white-space: nowrap;
		height: 3rem;
		padding: 0 0 0 1rem;
	}
</style>
