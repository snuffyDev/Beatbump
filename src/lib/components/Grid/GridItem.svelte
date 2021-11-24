<script lang="ts">
	import { goto } from '$app/navigation'
	import lazy from '$lib/lazy'
	import type { Item } from '$lib/types'
	import list from '$lib/stores/list'
	export let item: Item
</script>

<article
	class="item"
	on:click={() => {
		const itemType = item.endpoint?.pageType
		itemType.includes('PLAYLIST') &&
			goto('/playlist?list=' + item.endpoint.browseId)
		itemType.includes('ALBUM') && goto('/release?id=' + item.endpoint.browseId)
		item.videoId &&
			list.initList({ videoId: item.videoId, playlistId: item.playlistId })
	}}
>
	<div class="img">
		<img
			width={item.thumbnails[0].width}
			height={item.thumbnails[0].height}
			loading="lazy"
			on:error={(e) => {
				e.currentTarget.onerror = null
				e.currentTarget.src =
					'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJpc29sYXRpb246aXNvbGF0ZSIgdmlld0JveD0iMCAwIDI1NiAyNTYiIHdpZHRoPSIyNTZwdCIgaGVpZ2h0PSIyNTZwdCI+PGRlZnM+PGNsaXBQYXRoIGlkPSJwcmVmaXhfX2EiPjxwYXRoIGQ9Ik0wIDBoMjU2djI1NkgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNwcmVmaXhfX2EpIj48cGF0aCBmaWxsPSIjYWNhY2FjIiBkPSJNMCAwaDI1NnYyNTZIMHoiLz48ZyBjbGlwLXBhdGg9InVybCgjcHJlZml4X19iKSI+PHRleHQgdHJhbnNmb3JtPSJtYXRyaXgoMS4yOTkgMCAwIDEuMjcgOTUuNjg4IDE4Ni45NzEpIiBmb250LWZhbWlseT0iTGF0byIgZm9udC13ZWlnaHQ9IjQwMCIgZm9udC1zaXplPSIxMjAiIGZpbGw9IiMyODI4MjgiPj88L3RleHQ+PC9nPjxkZWZzPjxjbGlwUGF0aCBpZD0icHJlZml4X19iIj48cGF0aCB0cmFuc2Zvcm09Im1hdHJpeCgxLjI5OSAwIDAgMS4yNyA3OCA0Mi4yODYpIiBkPSJNMCAwaDc3djEzNUgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjwvZz48L3N2Zz4='
			}}
			use:lazy={{ src: item.thumbnails[0].url }}
			src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJpc29sYXRpb246aXNvbGF0ZSIgdmlld0JveD0iMCAwIDI1NiAyNTYiIHdpZHRoPSIyNTZwdCIgaGVpZ2h0PSIyNTZwdCI+PGRlZnM+PGNsaXBQYXRoIGlkPSJwcmVmaXhfX2EiPjxwYXRoIGQ9Ik0wIDBoMjU2djI1NkgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNwcmVmaXhfX2EpIj48cGF0aCBmaWxsPSJub25lIiBkPSJNMCAwaDI1NnYyNTZIMHoiLz48cGF0aCBmaWxsPSIjOEE4QThBIiBmaWxsLW9wYWNpdHk9Ii40OSIgZD0iTTAgMGgyNTZ2MjU2SDB6Ii8+PC9nPjwvc3ZnPg=="
			alt="thumbnail"
		/>
	</div>
	<div class="item-title">{item.title}</div>
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
		font-family: 'Commissioner';
		font-weight: 500;
		font-size: 1.1em;
		letter-spacing: -0.02em;
		margin-bottom: 0.5em;
	}
	@media screen and (min-width: 25rem) and (max-width: 37rem) {
		.item {
			max-width: 14rem;
		}
	}
	@media screen and (min-width: 37rem) and (max-width: 48rem) {
		.item {
			max-width: 13rem;
		}
	}
	@media screen and (min-width: 48rem) {
		.item {
			max-width: 14rem;
		}
	}
</style>
