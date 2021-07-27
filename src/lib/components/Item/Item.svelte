<script lang="ts">
	import Dropdown from '$components/Dropdown/Dropdown.svelte'

	export let data: Item
	import Loading from '$components/Loading/Loading.svelte'
	import { onMount, tick } from 'svelte'

	import { key, currentTrack } from '$stores/stores'
	import Icon from '$components/Icon/Icon.svelte'
	import { goto } from '$app/navigation'
	import list from '$stores/list'
	import type { Item, Song } from '$lib/types'
	import type { PlaylistSearch } from '$lib/types/playlist'
	import lazy from '$lib/lazy'
	import longpress from '$lib/actions/longpress'

	let videoId = ''
	let playlistId = ''
	let songTitle = ''
	$: title = songTitle = '...'
	let isHidden: Boolean = false
	let explicit
	let clicked
	let artist
	let hidden = clicked ? true : false
	let loading = false
	onMount(() => {
		itemHandler()
	})
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
				goto(`/artist/${data.artistInfo.browseId}`)
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
	const clickHandler = async () => {
		try {
			loading = true
			videoId = data.videoId ? data.videoId : ''
			playlistId = data.playlistId ? data.playlistId : data.shuffle.playlistId
			if (data.type == 'playlist') {
				await list.startPlaylist(playlistId)
			} else {
				await list.initList(videoId, playlistId)
			}
			key.set(0)
			console.log($list.mix)
			currentTrack.set({ ...$list.mix[0] })
			loading = false
			return
		} catch (error) {
			console.log(error)
			return
		}
	}
</script>

<div class="container" class:hidden>
	<div class="innercard">
		<div
			class="itemWrapper"
			on:click|stopPropagation={(e) => {
				if (!loading) {
					clickHandler()
				}
			}}>
			<div
				class="img-container"
				on:longpress|capture={() => {
					alert('longpress!')
				}}>
				{#if loading}
					<Loading size="3em" />
				{/if}
				<div class="thumbnail">
					<!-- svelte-ignore a11y-missing-attribute -->
					<img
						use:longpress
						id="img"
						referrerpolicy="origin-when-cross-origin"
						loading="lazy"
						type="image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
						src={data.thumbnails[0].url}
						alt="thumbnail" />
				</div>
			</div>
			<div class="title">
				<span class="text-title">{title}</span>
				{#if explicit}
					<span class="explicit"> E </span>
				{/if}
				<p class="text-artist">
					{data.type == 'playlist' ? `${data.metaData}` : `by ${artist}`}
				</p>
				<span class="album">
					{#if data.album}<Icon name="album" size="1em" /><a
							href="/release?id={data?.album?.browseId}">{data.album.title}</a>
					{/if}
				</span>
			</div>
		</div>

		<div class="menu">
			<Dropdown bind:isHidden items={DropdownItems} />
		</div>
	</div>
</div>

<style lang="scss">
	.menu {
		position: relative;

		padding-top: 0.125rem;
		padding-right: 0.625rem;
	}
	.hidden {
		display: none;
	}
	.album {
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
		padding: 0.3rem;
		flex-direction: row;
		flex-wrap: nowrap;
		align-items: center;
	}
	p {
		margin: 0.2em 0;
	}
	.container:not(.menu) {
		display: flex;
		flex: 1 1 auto;
		border-bottom: 0.0714rem solid hsla(0, 0%, 66.7%, 0.24);
		width: 100%;
		flex-direction: row;
		flex-wrap: nowrap;

		&:active {
			background: lighten(#212225, 3%);
			transition: cubic-bezier(0.25, 0.46, 0.45, 0.94) background 0.125s;
		}
	}

	.explicit {
		text-shadow: none;
		width: 1rem;
		height: 1rem;
		font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
			Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif;
		font-size: 0.7143rem;
		flex: none;
		color: #000;
		font-weight: 700;
		filter: contrast(100%);
		background: hsla(0, 0%, 100%, 0.966);
		padding: 0 0.4em;
		margin-left: 0.3em;
	}
	.text-artist {
		font-size: 0.95rem;
	}
	.text-title {
		font-size: 1.05rem;

		&:hover {
			text-decoration: underline solid white 0.0714rem;
			cursor: pointer;
		}
	}
	img {
		width: auto;

		height: auto;
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
		@media screen and (min-width: 640px) {
			padding: 0.2rem 0rem;
		}
	}

	.title {
		display: inline-block;
		width: 100%;
		margin-left: 1rem;
		line-height: 1.3125;
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
		border-radius: var(--xs-radius);

		.thumbnail {
			width: 100%;
			height: 100%;
			background: rgba(13, 13, 15, 0.192);
			border-radius: inherit;
			img {
				border-radius: var(--xs-radius);
				width: 100%;
				height: 100%;
				object-fit: contain;
			}
		}
	}
	@media (min-width: 640px) {
		.container:hover:not(.menu) {
			pointer-events: bounding-box;
			background: lighten(#212225, 5%);
			transition: cubic-bezier(0.25, 0.46, 0.45, 0.94) background 0.125s;
		}
	}
</style>
