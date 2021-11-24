<script lang="ts">
	import { browser } from '$app/env'

	import lazy from '$lib/lazy'
	import Icon from '../Icon/Icon.svelte'
	import { createEventDispatcher } from 'svelte'

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
	$: thumbnail = thumbnail
	const dispatch = createEventDispatcher()
</script>

<svelte:window bind:innerWidth={width} />

<div class="box">
	<div class="img">
		<img
			on:error={(e) => {
				// console.dir('error: e ' + e)
				e.currentTarget.onerror = null
				e.currentTarget.src =
					'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJpc29sYXRpb246aXNvbGF0ZSIgdmlld0JveD0iMCAwIDI1NiAyNTYiIHdpZHRoPSIyNTZwdCIgaGVpZ2h0PSIyNTZwdCI+PGRlZnM+PGNsaXBQYXRoIGlkPSJwcmVmaXhfX2EiPjxwYXRoIGQ9Ik0wIDBoMjU2djI1NkgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNwcmVmaXhfX2EpIj48cGF0aCBmaWxsPSIjYWNhY2FjIiBkPSJNMCAwaDI1NnYyNTZIMHoiLz48ZyBjbGlwLXBhdGg9InVybCgjcHJlZml4X19iKSI+PHRleHQgdHJhbnNmb3JtPSJtYXRyaXgoMS4yOTkgMCAwIDEuMjcgOTUuNjg4IDE4Ni45NzEpIiBmb250LWZhbWlseT0iTGF0byIgZm9udC13ZWlnaHQ9IjQwMCIgZm9udC1zaXplPSIxMjAiIGZpbGw9IiMyODI4MjgiPj88L3RleHQ+PC9nPjxkZWZzPjxjbGlwUGF0aCBpZD0icHJlZml4X19iIj48cGF0aCB0cmFuc2Zvcm09Im1hdHJpeCgxLjI5OSAwIDAgMS4yNyA3OCA0Mi4yODYpIiBkPSJNMCAwaDc3djEzNUgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjwvZz48L3N2Zz4='
			}}
			use:lazy={{ src: thumbnail }}
			src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJpc29sYXRpb246aXNvbGF0ZSIgdmlld0JveD0iMCAwIDI1NiAyNTYiIHdpZHRoPSIyNTZwdCIgaGVpZ2h0PSIyNTZwdCI+PGRlZnM+PGNsaXBQYXRoIGlkPSJwcmVmaXhfX2EiPjxwYXRoIGQ9Ik0wIDBoMjU2djI1NkgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNwcmVmaXhfX2EpIj48cGF0aCBmaWxsPSJub25lIiBkPSJNMCAwaDI1NnYyNTZIMHoiLz48cGF0aCBmaWxsPSIjOEE4QThBIiBmaWxsLW9wYWNpdHk9Ii40OSIgZD0iTTAgMGgyNTZ2MjU2SDB6Ii8+PC9nPjwvc3ZnPg=="
			alt="album"
		/>
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
					{#if i !== artist.length - 1}
						•
					{/if}
				{/each}
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
				class:outlined={i == buttons.length - 1}
				><Icon name={icon} size="1em" /><span class="button-text">{text}</span
				></button
			>
		{/each}
	</div>
</div>

<style lang="scss">
	@import '../../shared/listPages.scss';

	p {
		margin-top: 0;
		margin-bottom: 0.3rem;
	}
</style>
