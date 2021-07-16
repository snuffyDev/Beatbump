<script context="module">
	export async function load({ page, fetch }) {
		try {
			const data = await fetch(
				"/api/playlist.json?list=" + encodeURIComponent(page.query.get("list"))
			);
			const { parseTrack } = await data.json();
			return {
				props: { parseTrack },
			};
		} catch (error) {
			return {
				props: { error },
			};
		}
	}
</script>

<script lang="ts">
	export let parseTrack;
	export let error;
	console.log(parseTrack);
	// import { getPlaylist } from '$lib/utils'
</script>

{#await parseTrack}
	<!-- promise is pending -->
	Loading
{:then _}
	<!-- promise was fulfilled -->
	<ul>
		{#each parseTrack as res}
			<li>
				<img
					loading="lazy"
					src={res.thumbnails[0].url}
					width="32"
					height="32"
					alt="thumbnail" />
				<p>{res.title}</p>
			</li>
		{/each}
	</ul>
{:catch error}
	<!-- promise was rejected -->
{/await}

<style>
	li {
		margin: 1rem 0;
	}
	img {
		width: 100%;
		height: 100%;
		max-width: 5rem;
		max-height: 5rem;
		aspect-ratio: 1/1;
		margin-right: 1rem;
		object-fit: scale-down;
	}
</style>
