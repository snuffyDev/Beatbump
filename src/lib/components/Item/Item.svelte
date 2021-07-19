<script lang="ts">
	import Dropdown from '$components/Dropdown/Dropdown.svelte'

	export let data
	import { fade } from 'svelte/transition'
	import Loading from '$components/Loading/Loading.svelte'
	import { onMount } from 'svelte'

	import { currentMix, currentTitle, key, currentTrack } from '$stores/stores'
	import * as utils from '$lib/utils'
	import Icon from '$components/Icon/Icon.svelte'
	import { goto } from '$app/navigation'
	import { addToQueue } from '$lib/actions/dropdown'
	import list from '$stores/list'
	import DropdownItem from '../Carousel/DropdownItem.svelte'
	// import { addToQueue } from '$lib/utils'

	let ctoken = ''
	let videoId = ''
	let playlistId = ''
	let songTitle
	$: title = songTitle = '...'

	let src
	let video
	let thumbnail

	let explicit
	let clicked
	let artist
	let hidden = clicked ? true : false
	let loading = false
	let id = $key
	$: mixList = $list.mix

	let DropdownItems = [
		{
			text: 'View Artist',
			icon: 'artist',
			action: () => {
				window.scrollTo({
					behavior: 'smooth',
					top: 0,
					left: 0
				})
				goto(`/artist?id=${data.artistInfo.browseId}`)
			}
		},
		{
			text: 'Go to album',
			icon: 'list',
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
	}
	onMount(() => {
		itemHandler()
	})

	const itemHandler = () => {
		explicit = data.explicit
		title = data.title
		thumbnail = data.thumbnails[0].url
		if (data.type !== 'playlist') {
			artist = data.artistInfo.artist
		}
		if (title.length > 48) {
			title = title.substring(0, 48) + '...'
		} else {
			title = title
		}
	}

	// console.log(type)

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

	let showing
	$: toggle = showing ? true : false
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
			<div class="img-container">
				{#if loading}
					<Loading size="3em" />
				{/if}
				<div class="thumbnail">
					<!-- svelte-ignore a11y-missing-attribute -->
					<img
						id="img"
						referrerpolicy="origin-when-cross-origin"
						loading="lazy"
						src={thumbnail}
						alt="thumbnail"
						transition:fade />
				</div>
			</div>
			<div class="title">
				<span class="text-title">{title}</span>
				{#if explicit}
					<span class="explicit"> E </span>
				{/if}
				<p>
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
			<Dropdown items={DropdownItems} />
		</div>
	</div>
</div>

<style lang="scss">
	.menu {
		// position: absolute;
		// right: 0.8rem;
		// top: 50%;
		position: relative;

		padding-top: 0.125rem;
		padding-right: 0.625rem;
	}
	.hidden {
		display: none;
	}
	.album {
		// display: flex;
		// flex-direction: row;
		font-size: 0.9em;
		font-weight: 300;
		align-items: center;
		a {
			margin-left: 0.25em;
		}
	}
	.itemWrapper {
		display: flex;
		width: 100%;
		margin: 0;
		/* margin-bottom: auto; */
		padding: 0.3rem;
		flex-direction: row;
		flex-wrap: nowrap;
		align-items: center;
		// isolation:isolate;
	}
	p {
		margin: 0.2em 0;
	}
	// .listItem {
	// 	width: 100%;
	// 	display: flex;
	// 	padding: 0rem 1rem;
	// 	align-items: center;
	// 	cursor: pointer;
	// 	margin: 0;
	// 	.list-icon {
	// 		display: inline;
	// 	}
	// 	.list-item-text {
	// 		display: inline;
	// 		margin-left: 0.5rem;
	// 	}
	// 	&:hover {
	// 		background: #313338;
	// 		transition: cubic-bezier(0.25, 0.46, 0.45, 0.94) all 0.1s;
	// 	}
	// }

	.container:not(.menu) {
		display: flex;
		flex: 1 1 auto;
		// margin-top: 0.125rem;
		// margin-bottom: 0.125rem;
		// pointer-events: bounding-box;
		// isolation: isolate;
		border-bottom: 0.0714rem solid hsla(0, 0%, 66.7%, 0.24);
		width: 100%;
		/* height: 6rem; */
		/* margin: 0; */
		flex-direction: row;
		flex-wrap: nowrap;

		&:active {
			background: lighten(#212225, 3%);
			transition: cubic-bezier(0.25, 0.46, 0.45, 0.94) all 0.125s;
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
	.text-title {
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
		/* You could reduce this expression with a preprocessor or by doing the math. I've kept the longer form in `calc()` to make the math more readable for this demo. */
	}
	.innercard {
		display: flex;
		width: 100%;
		flex-direction: row;
		align-items: center;
		/* padding: 0.3rem 0.3rem; */
		flex-wrap: nowrap;
	}

	.title {
		display: inline-block;
		width: 100%;
		margin-left: 1rem;
		line-height: 1.25;
	}
	.img-container {
		// position: relative;
		/* width: 100%; */

		/* height: clamp(10rem,12.5rem,15rem); */
		/* min-width: 100%; */
		// box-shadow: 0 0 1rem 0.5rem rgb(0 0 0 / 36%);
		position: relative;
		display: block;
		width: auto;
		height: auto;
		width: 100%;
		max-width: 5rem;
		min-width: 5rem;
		height: 5rem;
		.thumbnail {
			width: 100%;
			height: 100%;
			background: rgba(13, 13, 15, 0.3411764705882353);
			img {
				// height: inherit;
				// -o-object-fit: scale-down;
				// object-fit: scale-down;
				// // max-height: 12rem;
				// width: 100%;
				// max-width: 18rem;
				width: 100%;
				height: 100%;
				-o-object-fit: scale-down;
				object-fit: scale-down;
			}
		}
	}
	@media (min-width: 640px) {
		.container:hover:not(.menu) {
			pointer-events: bounding-box;
			background: lighten(#212225, 5%);
			transition: cubic-bezier(0.25, 0.46, 0.45, 0.94) all 0.125s;
		}
	}
</style>
