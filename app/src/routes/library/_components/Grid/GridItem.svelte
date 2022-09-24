<script lang="ts">
	import { goto } from "$app/navigation";
	import lazy from "$lib/lazy";
	import type { Item } from "$lib/types";
	import list from "$lib/stores/list";
	export let item;
</script>

<article class="item" on:click>
	<div class="img">
		<img width={"200"} height={"200"} loading="lazy" src={item.thumbnail} alt="thumbnail" />
	</div>
	<div class="item-text">
		<div class="item-title">{item.name}</div>
		<div class="item-description">
			{@html item?.description ? item.description + ` &bull; ` : ""}
			{#if item.items !== undefined}
				{item?.items?.length == 1 ? `1 Song` : item?.items?.length == 0 ? "No tracks" : `${item?.items?.length} Songs`}
			{/if}
		</div>
	</div>
</article>

<style lang="scss">
	.item {
		display: flex;
		flex-wrap: nowrap;
		flex-direction: column;

		justify-content: flex-start;

		cursor: pointer;
		border-radius: 0.4rem;
		padding: 0.5rem 0.4rem 0.4rem;
		position: relative;
		gap: 0.3rem;
		width: 100%;
		.img {
			width: 100%;
			margin-bottom: 0.5em;
			img {
				height: auto;
				width: 100%;
			}
		}
	}
	.item-title {
		display: inline;
		padding: 0.3rem 0.1rem;
		font-family: "CommissionerVariable";
		font-weight: 500;
		font-size: 1.1em;
		letter-spacing: -0.02em;
		// margin-bottom: 0.5em;
	}
	.item-description {
		font-weight: 500;
		color: #999;
	}
	.item-text {
		display: flex;
		flex-direction: column;
	}
	@media screen and (min-width: 25em) and (max-width: 37em) {
		.item {
			max-width: 13rem;
		}
	}
	@media screen and (min-width: 37em) and (max-width: 48em) {
		.item {
			max-width: 14.5rem;
		}
	}
	@media screen and (min-width: 48em) {
		.item {
			max-width: 15rem;
		}
	}
</style>
