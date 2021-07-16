<script context="module">
	export async function load({ page, fetch }) {
		try {
			const data = await fetch(
				"/api/playlist.json?list=" + encodeURIComponent(page.query.get("list"))
			);
			const { parseTrack, parseHeader: header } = await data.json();
			return {
				props: { parseTrack, header },
				maxage: 3600,
				status: 200,
			};
		} catch (error) {
			return {
				props: { error },
			};
		}
	}
</script>

<script lang="ts">
	import ListItem from "$components/ListItem/ListItem.svelte";
	import lazy from "$lib/lazy";
	export let parseTrack;
	export let header;
	export let error;
	console.log(parseTrack, header);
	// import { getPlaylist } from '$lib/utils'
</script>

{#await parseTrack}
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
							width="18.2857rem"
							height="18.2857rem"
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
							<h4>{header.title}</h4>
							<p>{header.description}</p>
							<span>
								<p>
									{header.subtitles.join(" ", "")}
								</p>
								<em
									><small>
										{header.secondSubtitle.join(" ", "")}
									</small>
								</em>
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		{#each parseTrack as res, i}
			<ListItem item={res} index={i} />

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
</style>
