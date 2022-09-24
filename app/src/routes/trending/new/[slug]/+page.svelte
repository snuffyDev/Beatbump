<script lang="ts">
	import type { Sections } from "$lib/types/components/sections";
	import type { PageData } from "./$types";

	import Header from "$lib/components/Layouts/Header.svelte";
	import { Grid } from "$lib/components/Grid";
	import { page } from "$app/stores";
	import Carousel from "$lib/components/Carousel/Carousel.svelte";
	import CarouselItem from "$lib/components/Carousel/CarouselItem.svelte";

	export let data: PageData;

	let sections: Sections = data.sections;

	let header = data.header;
	let title: string = data.title;
	// $: console.log(data);
</script>

<Header title={title ? title.replace(",", " ") : ""} url={$page.url.pathname} desc="The latest in music" />

<main>
	{#if title === "Charts"}
		<div class="header">
			<span class="h1">{header}</span>
		</div>
	{/if}
	{#each sections as section, i}
		{#if section?.type === "grid"}
			<Grid heading={header} items={section.section} let:item>
				<!-- <GridItem slot="item" {item} /> -->
				<CarouselItem
					index
					aspectRatio={item.aspectRatio}
					{item}
					kind="album"
					type="home"
					isBrowseEndpoint={true}
					slot="item"
				/>
			</Grid>
		{:else if i === 1}
			<Carousel
				header={section.header}
				items={section.results}
				type="artist"
				kind="Fans might also like"
				isBrowseEndpoint={true}
			/>
		{:else}
			<Carousel header={section.header} items={section.results} type="home" isBrowseEndpoint={false} />
		{/if}
	{/each}
</main>

<style lang="scss">
	h1 {
		letter-spacing: -0.02em;
	}
	.h1 {
		font-size: 2.88rem;
	}
	.header {
		margin-bottom: 0.8rem;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-gap: 0.5rem;
	}

	.item {
		display: flex;
		flex-wrap: nowrap;
		flex-direction: column;
		// border: #aaaaaa40 solid 1px;
		justify-content: flex-start;
		border-radius: 0.4rem;
		padding: 0.5rem 0.4rem 0.4rem;
		position: relative;
		width: 100%;
		cursor: pointer;

		.img {
			width: 100%;
			margin-bottom: 0.5em;
		}
	}
	.item-title {
		display: inline;
		padding: 0.3rem 0.1rem;
		font-family: "CommissionerVariable";
		font-weight: 500;
		font-size: 1.1em;
		letter-spacing: -0.02em;
		margin-bottom: 0.25em;
		cursor: pointer;
	}

	@media screen and (min-width: 25em) and (max-width: 37em) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.item {
			max-width: 14rem;
		}
	}
	@media screen and (min-width: 37em) and (max-width: 48em) {
		.item {
			max-width: 13rem;
		}
		.grid {
			grid-template-columns: repeat(4, 1fr);
			grid-gap: 1rem;
		}
	}
	@media screen and (min-width: 48em) {
		.item {
			max-width: 14rem;
		}
		.grid {
			grid-template-columns: repeat(5, 1fr);
			grid-gap: 1.2rem;
		}
	}
</style>
