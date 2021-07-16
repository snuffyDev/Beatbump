<script lang="ts">
	import CarouselItem from "./CarouselItem.svelte";
	export let setTitle = "";
	export let items = [];
	export let type = "";
	import lazy from "$lib/lazy";
	import { fade } from "svelte/transition";
	import { goto } from "$app/navigation";

	let section = [];
	let arr = items;
	let carousel;
</script>

<div class="header">
	<h3>
		{setTitle}
	</h3>
</div>
<div class="section">
	<div class="scroll" id="scrollItem" bind:this={carousel}>
		<!-- {#each arr as item, index} -->
		<div class="contents" style="display:contents">
			{#each items as item, i}
				{#if type == "trending"}
					<!-- {JSON.stringify(item[1], title, thumbnail, subtitle)} -->
					<CarouselItem type="trending" {item} index={i} bind:section />
				{:else if type == "artist"}
					<CarouselItem type="artist" {item} index={i} bind:section />
				{:else if type == "new"}
					<!-- content here -->
					<section
						class="item"
						on:click={() => {
							console.log();
							let id = item.endpoint.browseId;
							let type = item.endpoint.pageType;

							goto(
								"/release?type=" +
									encodeURIComponent(type) +
									"&id=" +
									encodeURIComponent(id),
								{ replaceState: true }
							);
						}}>
						<!-- svelte-ignore a11y-missing-attribute -->
						<div class="img">
							<div class="container">
								<img
									alt="thumbnail"
									referrerpolicy="origin-when-cross-origin"
									transition:fade|local
									width="256"
									height="256"
									type="image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
									data-src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiI+PGRlZnM+PHBhdGggZD0iTTAgMGg1MTJ2NTEySDBWMHoiIGlkPSJwcmVmaXhfX2EiLz48L2RlZnM+PHVzZSB4bGluazpocmVmPSIjcHJlZml4X19hIiBvcGFjaXR5PSIuMjUiIGZpbGw9IiMyMjIiLz48L3N2Zz4="
									use:lazy={{
										src: item.thumbnails[0].url,
									}} />
							</div>
						</div>
						<div class="cont">
							<h6 class="title">
								{item.title}
							</h6>
							<span class="details">
								{#each item.subtitle as sub}
									<span>{sub.text}</span>
								{/each}
							</span>
						</div>
					</section>
				{/if}
			{/each}
		</div>
		<!-- {/each} -->
	</div>
</div>

<style lang="scss">
	.item {
		padding-bottom: 2em;
	}
	.details {
		display: flex;
		align-items: center;
		margin-top: 3px;
		display: block;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	.title {
		cursor: pointer;

		text-overflow: ellipsis, 2px;
		display: inline-block;
	}
	.section {
		-webkit-overflow-scrolling: touch;
		position: relative;

		border-radius: 0.5em;
		/* width: 100%; */
		/* max-width: 100%; */
		-ms-scroll-snap-type: x mandatory;
		scroll-snap-type: x mandatory;
		/* overflow: scroll;*/
	}

	.header {
		padding: 0.5em;
		// position: sticky;
		// /* top: 0; */
		// width: 100%;
		// left: 0;
		/* display: flow-root; */
		/* right: 0; */
	}
	.scroll {
		margin-bottom: 2.5rem;

		// padding-bottom: 1.25rem;
		// @include scrim(#1f1a2c2c, 'to top', 0.4125);
		// background: linear-gradient(
		// 	180deg,
		// 	#120f1854 1%,
		// 	#312b4230 9%,
		// 	#1b17255e 17%,
		// 	#2c253c57 25%,
		// 	#332c4975 32%,
		// 	#352d4b29 45%,
		// 	#2a234057 56%,
		// 	#332c4659 70%,
		// 	#30284766 80%,
		// 	#2e25435e 90%,
		// 	#2f27435c 100%
		// );
		background: linear-gradient(
			180deg,
			rgb(18 15 24 / 8%) 1%,
			rgb(20 17 29 / 14%) 10%,
			rgb(31 26 43 / 18%) 18%,
			rgb(22 18 30 / 31%) 27%,
			rgb(33 29 47 / 23%) 37%,
			rgb(30 26 42 / 28%) 50%,
			rgb(42 35 64 / 22%) 62%,
			rgb(33 29 46 / 38%) 70%,
			rgb(41 33 57 / 34%) 78%,
			rgb(27 22 39 / 50%) 82%,
			rgb(49 40 66 / 37%) 100%
		);
		grid-column-gap: 0.5rem;
		overflow-y: hidden;
		height: auto;
		/* overflow-y: clip; */
		display: grid;
		// grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
		// grid-auto-rows: 1fr;
		grid-auto-flow: column;
		/* flex-direction: row; */
		overflow-x: scroll;
		grid-template-columns: repeat(auto, 1fr);

		width: auto;
		// /* flex: 1 1 auto; */
		// box-shadow: 0 0 10px 3px rgb(0 0 0 / 13%),
		// 	inset -2px -2px 20px 0 hsl(0deg 0% 57% / 10%),
		// 	inset 0 0 11px 3px rgb(46 56 56 / 9%);

		border-radius: inherit;
		overflow-anchor: none;
		-ms-scroll-snap-type: x mandatory;
		scroll-snap-type: x mandatory;
		-webkit-overflow-scrolling: touch;
	}

	section {
		padding-left: 1.5rem;
		padding-right: 1.5rem;
		padding-top: 1.5rem;
		margin-bottom: 0;
		display: block;
		cursor: pointer;
		content: "";

		::before {
			display: block;
		}
		/* You could reduce this expression with a preprocessor or by doing the math. I've kept the longer form in `calc()` to make the math more readable for this demo. */
	}
	.item {
		scroll-snap-align: start;
		// min-height: 16.75rem;
		height: auto;

		// width: 16rem;
	}

	.img {
		// position: relative;
		/* width: 100%; */
		/* height: clamp(10rem,12.5rem,15rem); */
		/* min-width: 100%; */
		// box-shadow: 0 0 1rem 0.5rem rgb(0 0 0 / 36%);
		position: relative;
		top: 0;
		max-height: 12.5rem;
		min-width: 12.5rem;
		border-radius: 2px;
		overflow: hidden;

		.container {
			display: flex;
			align-items: center;
			width: 100%;
			height: 100%;
			img {
				// height: inherit;
				// -o-object-fit: scale-down;
				// object-fit: scale-down;
				// // max-height: 12rem;
				// width: 100%;
				// max-width: 18rem;
				width: 100%;
				height: 100%;
				-o-object-fit: cover;
				object-fit: cover;

				max-width: inherit;
				max-height: inherit;
			}
		}
	}
	.cont {
		display: flex;
		flex-direction: column;
		margin-top: 0.8571rem;
		padding-right: 1em;
	}
	.scroll-container {
	}
</style>
