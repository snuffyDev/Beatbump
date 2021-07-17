<script context="module">
	export async function load({ page, fetch }) {
		try {
			const data = await fetch(
				"/api/playlist.json?list=" + encodeURIComponent(page.query.get("list"))
			);
			const { tracks, header, continuations } = await data.json();
			return {
				props: {
					tracks: await tracks,
					continuations: await continuations,
					header: await header,
				},
				// maxage: 0,
				status: 200,
			};
		} catch (error) {
			return {
				error: new Error("it broke"),
			};
		}
	}
</script>

<script lang="ts">
	import ListItem from "$components/ListItem/ListItem.svelte";
	import lazy from "$lib/lazy";
	import list from "$lib/stores/list";
	import { isPagePlaying } from "$lib/stores/stores";
	import { onMount, setContext } from "svelte";
	export let tracks;
	export let header;
	// export let error;
	export let continuations;
	const key = {};
	$: hasList = $list.mix.length > 0;
	$: isThisPage = false;
	let pageTitle = header?.title;
	// setContext(key, header.playlistId);
	console.log(tracks, continuations, header);
	console.log(continuations);
	$: console.log(isThisPage, $isPagePlaying);
	onMount(() => {
		if (header !== undefined) {
			if ((!hasList && !$isPagePlaying) || !header.playlistId) {
				isThisPage = false;
			} else if (hasList && $isPagePlaying == header.playlistId) {
				isThisPage = true;
			} else {
				isThisPage = false;
			}
		}
	});
	// import { getPlaylist } from '$lib/utils'
	let width;
</script>

<svelte:head>
	<title>Playlist - Beatbump</title>
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
							data-src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0icHJlZml4X19wcmVmaXhfX2ZlYXRoZXIgcHJlZml4X19wcmVmaXhfX2ZlYXRoZXItbGlzdCI+PHBhdGggb3BhY2l0eT0iLjciIHN0cm9rZT0iI2NjYyIgZmlsbD0iIzMzMyIgZD0iTTAgMGgyNHYyNEgweiIvPjwvc3ZnPg=="
							use:lazy={{
								src: header.thumbnails[0].url.replace(
									/=(w(\d+))-(h(\d+))/g,
									"=w256-h256"
								),
							}}
							alt="album" />
					</div>
					<div class="info">
						<div class="info-title">
							<h4 class="title">{header?.title}</h4>
							<p class="subtitle" class:hidden={width < 640 ? true : false}>
								{header.description}
							</p>
							<span>
								<p class="subtitle">
									{header.subtitles.join(" ", "")}
								</p>
								<em
									><small class="subtitle">
										{header.secondSubtitle.join(" ", "")}
									</small>
								</em>
							</span>
							<div class="button-group">
								<button class="button--outlined">Start Listening</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<hr />
		{#each tracks as res, i}
			<ListItem
				on:pagePlaying={() => {
					isPagePlaying.set(header.playlistId);
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
{/await}

<style lang="scss">
	.button--outlined {
		color: #131313 !important;
		border-color: #fff !important;
		background-color: #fff !important;
		margin-top: 0.5rem;
		font-weight: 600;
		font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
		-webkit-font-smoothing: antialiased;
	}
	.subtitle {
		margin: 0 0 0.25em 0;

		@media screen and (max-width: 500px) {
			// font-size: 1.5rem;
			margin: 0 0 0em 0;
		}
	}
	.title {
		font-weight: bold;
		font-size: 2.8em;
		letter-spacing: 0.01rem;
		text-overflow: ellipsis;
		/* width: 100%; */
		/* max-width: 90px; */
		margin-right: 1.8rem;
		line-break: strict;
		@media screen and (max-width: 640px) {
			font-size: 1.75em;
		}
		@media screen and (max-width: 876px) {
			font-size: 2em;
		}
		@media screen and (max-width: 500px) {
			font-size: 1.5rem;
		}
	}
	small {
		display: inline;
		justify-self: flex-end;
	}

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
		// display: flex;
		// flex-wrap: wrap;
		width: auto;

		// flex-direction: row;
		transition: all 0.23s cubic-bezier(0.39, 0.575, 0.565, 1);
		// /* display: flex; */
		/* flex-wrap: wrap; */
		// display: block;
	}
	// .box {
	// 	display: block;
	// 	flex-wrap: unset;
	// }
	hr {
		border-color: rgba(170, 170, 170, 0.152);
		width: 100%;
		border-width: 0.0143rem;
		border-style: groove;
	}
	.img {
		position: relative;
		aspect-ratio: 1/1;
		height: auto;
		width: 100%;
		max-width: 18.8571rem;
		border-radius: 2%;
		// min-width: 100%;
		max-height: 18.8571rem;
		img {
			box-shadow: 0 0 1.5rem 0.125rem rgb(0 0 0 / 37%);
			/* max-width: inherit; */
			/* max-height: inherit; */
			max-width: inherit;
			border-radius: 2%;

			// min-width: inherit;
			// min-height: inherit;
			max-height: inherit;
			-o-object-fit: cover;
			object-fit: cover;
			aspect-ratio: inherit;
			height: auto;
			width: 100%;
		}
		@media screen and (max-width: 896px) {
			.img {
				max-width: 12rem;
				max-height: 12rem;
				img {
					max-width: inherit;
					max-height: inherit;
				}
			}
		}
	}
	.info-wrapper {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		flex: 1 1 auto;
	}
	.info {
		/* margin-left: auto; */
		margin-right: auto;
		padding-left: 1.5rem;
		@media screen and (max-width: 500px) {
			// margin-right: 0.5rem;
			padding-left: 0.5rem;
			// font-size: 1.5rem;
		}
		/* float: revert;*/
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
		.info-wrapper {
			flex-direction: column;
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
			padding-left: 1rem;
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

	@media screen and (max-width: 525px) {
		.hidden {
			display: none;
		}
	}
</style>
