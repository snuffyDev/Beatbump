<script lang="ts">
	import { browser } from '$app/env'

	import lazy from '$lib/lazy'
	import Icon from '../Icon/Icon.svelte'

	export let thumbnail
	export let title
	export let description = undefined
	export let subtitles = []
	export let secondSubtitle = []
	export let buttons = []
	export let artist = undefined
	export let type = 'playlist'
	let width
</script>

<svelte:window bind:innerWidth={width} />

<div class="box">
	<div class="img">
		<img
			type="image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
			src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0icHJlZml4X19wcmVmaXhfX2ZlYXRoZXIgcHJlZml4X19wcmVmaXhfX2ZlYXRoZXItbGlzdCI+PHBhdGggb3BhY2l0eT0iLjciIHN0cm9rZT0iI2NjYyIgZmlsbD0iIzMzMyIgZD0iTTAgMGgyNHYyNEgweiIvPjwvc3ZnPg=="
			use:lazy={{
				src: thumbnail
			}}
			alt="album"
		/>
	</div>
	<div class="metadata">
		<div class="info-title">
			<div class="box-title">{title}</div>
		</div>
		{#if description && type == 'playlist'}
			<p
				class="secondary subtitle description"
				class:hidden={width < 640 ? true : false}
			>
				{description}
			</p>
			<span class="secondary subtitle-group">
				<p class="secondary subtitle">
					{subtitles.join(' ')}
				</p>
				<em
					><small class="subtitle">
						{secondSubtitle.join(' ')}
					</small>
				</em>
			</span>
		{:else if type == 'release'}
			<p>
				{#if subtitles[0]?.contentRating}
					<span class="explicit"> E </span>
				{/if}
				<a sveltekit:prefetch href={`/artist/${artist.channelId}`}
					>{artist.name}</a
				>
				•
				<small>
					{subtitles[0].year} • {subtitles[0].tracks}
				</small>
			</p>
		{/if}
	</div>
	<div class="button-group">
		{#each buttons as { icon, text, action }, i}
			<button
				on:click={action}
				class="button"
				class:outlined={type == 'release' && i == buttons.length - 1}
				><Icon name={icon} size="1.5rem" /><span class="button-text"
					>{text}</span
				></button
			>
		{/each}
	</div>
</div>

<style lang="scss">
	@import '../../shared/listPages.scss';
	.box-title {
		display: inline-flex;
	}

	p {
		margin-top: 0;
		margin-bottom: 0.3rem;
	}
</style>
