<script lang="ts">
	import { browser } from '$app/env'

	import lazy from '$lib/lazy'
	import Icon from '../Icon/Icon.svelte'
	import { createEventDispatcher } from 'svelte'
	import Button from '../Button'

	export let thumbnail: string
	export let title: string = ''
	export let description = undefined
	export let subtitles = []
	export let secondSubtitle = []
	export let buttons = []
	export let artist = undefined
	export let editable = false
	export let type = 'playlist'
	let width
	const dispatch = createEventDispatcher()
</script>

<svelte:window bind:innerWidth={width} />

<div class="box">
	<div class="img">
		<img src={thumbnail} loading="lazy" width="512" height="512" alt="album" />
	</div>
	<div class="metadata">
		<div class="info-title">
			<span class="box-title">{title}</span>
		</div>
		{#if description && type == 'playlist'}
			{#key description}
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
			{/key}
		{:else if type == 'release'}
			<p>
				{#if subtitles[0]?.contentRating}
					<span class="explicit"> E </span>
				{/if}
				{#each artist as artist, i}
					<a sveltekit:prefetch href={`/artist/${artist.channelId}`}
						>{artist.name}</a
					>
					<!-- {#if i !== artist.length - 1}
						•
					{/if} -->
				{/each}
				<small>
					• {subtitles[0].year} • {subtitles[0].tracks}
				</small>
			</p>
		{/if}
	</div>
	<div class="button-group">
		<div class="container row">
			{#each buttons as { icon, text, action }, i}
				<Button
					on:click={action}
					outlined={i == buttons.length - 1}
					icon={{ name: icon }}
					{text}
				/>
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	@import '../../shared/listPages.scss';

	p {
		margin-top: 0;
		margin-bottom: 0.3rem;
	}
</style>
