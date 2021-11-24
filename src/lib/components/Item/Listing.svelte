<script lang="ts">
	export let data: Item

	import Loading from '$components/Loading/Loading.svelte'
	import { hasContext, onMount, tick } from 'svelte'

	import {
		alertHandler,
		key,
		showAddToPlaylistPopper,
		theme
	} from '$stores/stores'
	import Icon from '$components/Icon/Icon.svelte'
	import { goto } from '$app/navigation'
	import list from '$lib/stores/list'
	import type { Item } from '$lib/types'
	import longpress from '$lib/actions/longpress'
	import db from '$lib/db'
	import { browser } from '$app/env'
	import { createEventDispatcher } from 'svelte'
	import { PopperButton, PopperStore } from '../Popper'
	import { notify } from '$lib/utils'

	const dispatch = createEventDispatcher()
	let isLibrary = hasContext('library') ? true : false
	let videoId = ''
	let playlistId = ''
	let songTitle = ''
	$: title = songTitle = '...'
	let isHidden: boolean = false
	let explicit
	let clicked
	let artist
	let hidden = clicked ? true : false
	let loading = false
	onMount(() => {
		itemHandler()
	})
	type CustomEvent = Event & {
		currentTarget: EventTarget & HTMLImageElement
	}
	const errorHandler = (event: CustomEvent) => {
		event.currentTarget.onerror = null
		event.currentTarget.src =
			'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJpc29sYXRpb246aXNvbGF0ZSIgdmlld0JveD0iMCAwIDI1NiAyNTYiIHdpZHRoPSIyNTZwdCIgaGVpZ2h0PSIyNTZwdCI+PGRlZnM+PGNsaXBQYXRoIGlkPSJwcmVmaXhfX2EiPjxwYXRoIGQ9Ik0wIDBoMjU2djI1NkgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNwcmVmaXhfX2EpIj48cGF0aCBmaWxsPSIjYWNhY2FjIiBkPSJNMCAwaDI1NnYyNTZIMHoiLz48ZyBjbGlwLXBhdGg9InVybCgjcHJlZml4X19iKSI+PHRleHQgdHJhbnNmb3JtPSJtYXRyaXgoMS4yOTkgMCAwIDEuMjcgOTUuNjg4IDE4Ni45NzEpIiBmb250LWZhbWlseT0iTGF0byIgZm9udC13ZWlnaHQ9IjQwMCIgZm9udC1zaXplPSIxMjAiIGZpbGw9IiMyODI4MjgiPj88L3RleHQ+PC9nPjxkZWZzPjxjbGlwUGF0aCBpZD0icHJlZml4X19iIj48cGF0aCB0cmFuc2Zvcm09Im1hdHJpeCgxLjI5OSAwIDAgMS4yNyA3OCA0Mi4yODYpIiBkPSJNMCAwaDc3djEzNUgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjwvZz48L3N2Zz4='
	}
	let DropdownItems = [
		{
			text: 'View Artist',
			icon: 'artist',
			action: async () => {
				window.scrollTo({
					behavior: 'smooth',
					top: 0,
					left: 0
				})

				await tick()
				goto(
					`/artist/${data['artistInfo']['artist'][0]['navigationEndpoint']['browseEndpoint']['browseId']}`
				)
			}
		},
		{
			text: 'Go to album',
			icon: 'album',
			action: () => {
				window.scrollTo({
					behavior: 'smooth',
					top: 0,
					left: 0
				})
				goto(`/release?id=${data?.album?.browseId}`)
			}
		},
		{
			text: 'Add to Queue',
			icon: 'queue',
			action: () => list.addNext(data, $key)
		},
		{
			text: !isLibrary ? 'Favorite' : 'Remove from Favorites',
			icon: 'heart',
			action: async () => {
				// console.log(data)
				if (!browser) return
				!isLibrary && (await db.setNewFavorite(data))
				if (isLibrary) {
					await db.deleteFavorite(data)
					dispatch('update')
				}
			}
		},
		{
			text: 'Share',
			icon: 'share',
			action: async () => {
				const shareData = {
					title: data.title,
					text: `Listen to ${data.title} on Beatbump!`,
					url: `https://beatbump.ml/listen?id=${data.videoId}`
				}
				try {
					if (!navigator.canShare) {
						await navigator.clipboard.writeText(shareData.url)
						notify('Link copied successfully', 'success')
					} else {
						const share = await navigator.share(shareData)
						notify('Shared successfully', 'success')
					}
				} catch (error) {
					notify('Error: ' + error, 'error')
				}
			}
		}
	]
	if (data.type == 'playlist') {
		DropdownItems.splice(1, 1, {
			text: 'View Playlist',
			icon: 'list',
			action: () => {
				window.scrollTo({
					behavior: 'smooth',
					top: 0,
					left: 0
				})
				goto(`/playlist?list=${data?.browseId}`)
			}
		})
		DropdownItems.shift()
		DropdownItems.pop()
		DropdownItems = [
			...DropdownItems.filter((item) => !item.text.includes('Favorite'))
		]
		DropdownItems.push({
			text: 'Add to Playlist',
			icon: 'playlist-add',
			action: async () => {
				const _data = await fetch(
					`/api/getQueue.json?playlistId=${data.playlistId}`
				).then((data) => data.json())
				let thumb = data.thumbnails?.reverse()
				showAddToPlaylistPopper.set({ state: true, item: data })
			}
		})
	}
	if (data.type == 'video') {
		DropdownItems = DropdownItems.filter((d) => {
			if (d.text == 'View Artist') return
		})
	}
	const itemHandler = () => {
		explicit = data.explicit
		title = data.title

		if (data.type !== 'playlist') {
			artist = data?.artistInfo?.artist
		}
		if (title.length > 48) {
			title = title.substring(0, 48) + '...'
		} else {
			title = title
		}
	}
	const clickHandler = async (event) => {
		if (
			(event.target instanceof HTMLElement &&
				(event.target.nodeName == 'A' || event.target.nodeName == 'P')) ||
			loading
		)
			return
		// console.log(event.target)
		if (data.type == 'artist') {
			goto(`/artist/${data.artistInfo.artist}`)
			return
		}
		try {
			loading = true
			videoId = data.videoId ? data.videoId : ''
			playlistId = data?.playlistId
				? data?.playlistId
				: data.shuffle?.playlistId
			if (data.type == 'playlist') {
				await list.startPlaylist(playlistId)
			} else {
				await list.initList({
					videoId: videoId,
					playlistId: playlistId || data.autoMixList,
					keyId: 0,
					clickTracking: data.params,
					config: { playerParams: data.playerParams, type: data.musicVideoType }
				})
			}
			key.set(0)
			loading = false
			return
		} catch (error) {
			console.log(error)
			return
		}
	}
</script>

<div
	class="container"
	on:contextmenu={(e) => {
		window.dispatchEvent(new CustomEvent('contextmenu', { detail: 'listing' }))

		PopperStore.set({
			items: [...DropdownItems],
			x: e.pageX,
			y: e.pageY,
			direction: 'right'
		})
	}}
>
	<div class="innercard">
		<div class="itemWrapper" on:click|stopPropagation={clickHandler}>
			<div class="img-container">
				{#if loading}
					<Loading size="3em" />
				{/if}
				<div class="thumbnail">
					<!-- svelte-ignore a11y-missing-attribute -->
					<img
						use:longpress
						id="img"
						src={data.thumbnails ? data.thumbnails[0]?.url : data.thumbnail}
						alt="thumbnail"
					/>
				</div>
			</div>
			<div class="title">
				<span class="text-title"
					>{title}
					<span class="explicit" class:hidden={!data.explicit}> E </span></span
				>
				{#if data.type == 'artist'}
					<p class="artist-stats">
						Artist &CenterDot; {data?.length?.text}
					</p>
				{:else if data.type == 'playlist'}
					<p class="text-artist">
						{data.type == 'playlist' ? `${data.metaData}` : ''}
					</p>
				{:else}
					<p class="text-artist">
						by
						<a
							sveltekit:prefetch
							href={`/artist/${
								Array.isArray(data.artistInfo?.artist)
									? data.artistInfo?.artist[0]?.navigationEndpoint
											?.browseEndpoint?.browseId
									: data.artistInfo?.browseId
							}`}
							>{data.artistInfo?.artist[0].text || data.artistInfo?.artist}</a
						>
					</p>
				{/if}
				<span class="album">
					{#if data.album?.browseId}<Icon name="album" size="1em" /><a
							sveltekit:prefetch
							href="/release?id={data?.album?.browseId}">{data.album.title}</a
						>
					{/if}
				</span>
			</div>
		</div>

		<div class="menu">
			<PopperButton
				metadata={{
					artist:
						data.type !== 'playlist' && Array.isArray(data?.artistInfo?.artist)
							? [...data?.artistInfo?.artist]
							: data?.artistInfo?.artist ?? undefined,
					thumbnail: data.thumbnails ? data.thumbnails[0]?.url : data.thumbnail,
					title: title,
					length:
						data.type !== 'artist' && data.type !== 'playlist'
							? data?.length?.text
							: ''
				}}
				type="search"
				bind:isHidden
				items={DropdownItems}
			/>
		</div>
	</div>
</div>

<style lang="scss">
	.menu {
		padding-right: 0.6rem;
	}
	.hidden {
		display: none !important;
		visibility: hidden !important;
	}
	.album,
	.artist-stats {
		font-size: 0.9em;
		font-weight: 300;
		align-items: center;
		/* white-space: revert; */
		display: inline-flex;
		pointer-events: auto;
		a {
			margin-left: 0.25em;
		}
	}
	.itemWrapper {
		display: flex;
		width: 100%;
		margin: 0;
		padding: 0.3rem 0.3rem 0.3rem 0.6rem;
		flex-direction: row;
		flex-wrap: nowrap;
		align-items: center;
	}
	p {
		margin: 0.2rem 0;
	}
	.container:not(.menu) {
		display: flex;
		flex: 1 1 auto;
		border-bottom: 0.0714rem solid hsla(0, 0%, 66.7%, 0.24);
		width: 100%;
		flex-direction: row;
		flex-wrap: nowrap;
		background: transparent;
		transition: cubic-bezier(0.25, 0.46, 0.45, 0.94) background 0.125s;
		max-width: unset !important;
		&:active,
		&:hover {
			background: lighten(#3c3d4159, 3%);
			// filter: brightness(0.7);
		}
	}

	.explicit {
		text-shadow: none;
		// width: 1rem;
		// height: 1rem;
		font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
			Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif;
		font-size: calc(0.7143rem / 1.05);
		flex: none;
		color: rgb(8, 8, 8);
		font-weight: 700;
		// filter: contrast(100%);
		background: rgba(247, 247, 247, 0.993);
		padding: 0 0.4em;
		margin-left: 0.25em;
		display: inline-block;
		border-radius: 0.2rem;
		vertical-align: baseline;
		border: rgba(255, 255, 255, 0.377) solid 0.01px;
	}
	.text-artist {
		font-size: 0.95rem;
	}
	.text-title {
		font-size: 1em;

		&:hover {
			text-decoration: underline solid currentColor 0.0714rem;
			cursor: pointer;
		}
	}
	img {
		width: auto;

		height: auto;
		backdrop-filter: contrast(0.9);
	}
	img::before {
		display: block;
		content: '';
		padding-top: calc(100% * 2 / 3);
	}
	.innercard {
		display: flex;
		width: 100%;
		flex-direction: row;
		align-items: center;
		flex-wrap: nowrap;
		padding: 0.4rem 0rem;
		position: relative;
		@media screen and (min-width: 640px) {
			padding: 0.2rem 0rem;
		}
	}

	.title {
		display: inline-flex;
		width: 100%;
		margin-left: 1rem;
		line-height: 1.3;
		align-self: center;
		flex-direction: column;
		font-size: 100%;
	}
	.img-container {
		position: relative;
		display: block;
		width: auto;
		height: auto;
		width: 100%;
		max-width: 5rem;
		min-width: 5rem;
		height: 5rem;
		border-radius: $xs-radius;

		.thumbnail {
			width: 100%;
			height: 100%;
			background: rgba(13, 13, 15, 0.192);
			border-radius: inherit;
			img {
				border-radius: $xs-radius;
				width: 100%;
				height: 100%;
				object-fit: contain;
			}
		}
	}
	@media (min-width: 640px) {
		.container:active:not(.menu) {
			background: lighten(#575a6359, 5%);
		}

		:root .light .container:active:not(.menu) {
			background: darken(#0a0a0c71, 5%);
		}
	}
</style>
