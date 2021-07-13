<script context="module">
	// import { getTrending } from './index.json'
	export async function load({ page, fetch }) {
		const slug = page.params.slug
		const data = await fetch('/trending.json?q=browse')
		const { carouselItems } = await data.json()

		if (!data.ok) {
			return {
				status: 400,
				error: data.statusText
			}
		}
		return {
			props: {
				carouselItems
			},
			maxage: 3600,
			status: 200
		}
	}
</script>

<script lang="ts">
	export let carouselItems
	import { currentTitle } from '$stores/stores'
	import Loading from '$components/Loading/Loading.svelte'
	import * as utils from '$lib/utils'

	import Carousel from '$components/Carousel/Carousel.svelte'

	let moods = []
	let genres = []
	$: console.log(carouselItems)
	let browseId = 'FEmusic_explore'
	const d = async () => {
		const r = await fetch('/trending.json?q=browse')
		const da = await r.json()
		return da
	}
	d().then(console.log)
	const handler = getTracks()

	function getTracks() {
		utils
			.moodsAndGenres('FEmusic_moods_and_genres')
			.then((data) => {
				let moodsArr = data[0][0]
				let genresArr = data[1][0]

				genres = [...genresArr.items.slice(0, 10)]
				utils.shuffle(genres)
				moods = [...moodsArr.items.slice(0, 10)]
				return { genres, moods }
			})
			.finally((msg) => {
				console.log(genres, moods)
			})
		// @ts-ignore
	}
</script>

<svelte:head>
	<title>{$currentTitle == '' ? 'Home' : $currentTitle} - Beatbump</title>
</svelte:head>
{#await handler}
	<Loading />
{:then _}
	<main>
		<Carousel
			setTitle={carouselItems[2].header[0].title}
			items={carouselItems[2].results}
			type="trending" />

		<Carousel
			setTitle={carouselItems[3].header[0].title}
			items={carouselItems[3].results}
			type="trending" />
		<Carousel
			setTitle={carouselItems[0].header[0].title}
			items={carouselItems[0].results}
			type="new" />
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
				<span class="link" on:click={() => alert('Coming Soon!')}
					>See All</span>

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
				<span class="link" on:click={() => alert('Coming Soon!')}
					>See All</span>
			</div>
		</div>
	</main>
{/await}

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
