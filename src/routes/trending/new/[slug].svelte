<script context="module">
	export async function load({ page, fetch }) {
		// const params = page.query.get('params')
		const response = await fetch(
			`/trending/new/${page.params.slug}.json` +
				`${
					page.query.get('params') ? `?params=${page.query.get('params')}` : ''
				}` +
				`${
					page.query.get('itct')
						? `&itct=${encodeURIComponent(page.query.get('itct'))}`
						: ''
				}`
		)
		const {
			sections = [],
			header = '',
			title = [] | ''
		} = await response.json()
		// console.log(sections, header, title)
		if (response.ok) {
			return {
				props: {
					sections,
					header,
					title
				},
				status: 200
			}
		}
	}
</script>

<script lang="ts">
	import type { sections } from '$lib/types/components/sections'
	export let sections: sections
	export let header
	export let title: string
	import { goto } from '$app/navigation'
	import Header from '$lib/components/Layouts/Header.svelte'
	import list from '$lib/stores/list'
	// $: console.log(sections, header, title)
</script>

<Header name={title ? title.replace(',', ' ') : ''} />

<main>
	<div class="header">
		<h1>{header}</h1>
	</div>
	{#each sections as section}
		<div class="grid">
			{#each section.section as item}
				<div
					class="item"
					on:click={() => {
						item.type == 'albums'
							? goto('/release?id=' + item?.browseId)
							: list.initList(item.videoId, item.autoMixList)
					}}
				>
					<div class="img">
						<img loading="lazy" src={item.thumbnail} alt="thumbnail" />
					</div>
					<div class="item-title">{item.title}</div>
					<div class="item-subtitle">
						{#each item.subtitles as sub}{#if !sub?.navigationEndpoint}{sub.text}{:else}<a
									href={`/artist/${sub?.navigationEndpoint?.browseEndpoint?.browseId}`}
									>{sub.text}</a
								>{/if}{/each}
					</div>
				</div>
			{/each}
		</div>
	{/each}
</main>

<style lang="scss">
	h1 {
		letter-spacing: -0.02em;
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
		font-family: 'Commissioner';
		font-weight: 500;
		font-size: 1.1em;
		letter-spacing: -0.02em;
		margin-bottom: 0.25em;
		cursor: pointer;
	}

	@media screen and (min-width: 25rem) and (max-width: 37rem) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.item {
			max-width: 14rem;
		}
	}
	@media screen and (min-width: 37rem) and (max-width: 48rem) {
		.item {
			max-width: 13rem;
		}
		.grid {
			grid-template-columns: repeat(4, 1fr);
			grid-gap: 1rem;
		}
	}
	@media screen and (min-width: 48rem) {
		.item {
			max-width: 14rem;
		}
		.grid {
			grid-template-columns: repeat(5, 1fr);
			grid-gap: 1.2rem;
		}
	}
</style>
