<script>
	import { fade } from 'svelte/transition'
	import Icon from '$lib/Icon.svelte'
	import { currentMix, currentTitle, key } from './stores/stores'
	import * as utils from './utils'
	export let item
	export let index

	let radio = []
	let isHovering = false
</script>

<li
	class="item"
	on:click={async () => {
		let mix = await utils
			.getNext(0, '', item.videoId, '', '')
			.then((data) => data)
		// console.log(mix)
		const play = await utils
			.getSrc(mix.results[0].videoId)
			.then((p) => console.log(p))
		// @ts-ignore
		let videoId = await mix.results[0].videoId

		// @ts-ignore
		currentMix.set({
			videoId: `${videoId}`,
			// playlistId: `${playlistId}`,
			list: [
				...mix.results.map((d, i) => ({
					autoMixList: d.autoMixList,
					continuation: radio.continuation,
					artistId: d.artistInfo.browseId,
					itct: radio.itct,
					id: d.index,
					videoId: d.videoId,
					title: d.title,
					artist: d.artistInfo.artist,
					thumbnail: d.thumbnail,
					length: d.length
				}))
			]
		})
		key.set(0)
		// currentTrack.set({
		// 	id: 0,
		// 	videoId: id,
		// 	title: radio[0].title,
		// 	thumbnail: thumbnail
		// })
		currentTitle.set(mix.results[0].title)
	}}
	on:mouseover={() => {
		isHovering = true
	}}
	on:mouseleave={() => {
		isHovering = false
	}}>
	<span class="number"
		>{#if isHovering}
			<span>
				<svelte:component this={Icon} class="icon" name="play" size="1.5em" />
			</span>
			<!-- content here -->
		{:else}
			<span>{index + 1}<!-- else content here --></span>
		{/if}
	</span>
	<span class="itemInfo">
		<span class="title"
			>{item.title}
			{#if item.explicit}
				<span class="explicit">
					{item.explicit ? 'E' : ''}
				</span>
			{/if}
		</span>
		<span class="artist"
			>{item.artistNames ? item.artistNames : item.artistInfo.artists}</span>
	</span>
</li>

<!-- markup (zero or more items) goes here -->
<style lang="scss">
	.explicit {
		text-shadow: none;
		width: 18px;
		height: 18px;
		font-size: 0.7143rem;
		flex: none;
		color: rgb(0, 0, 0);
		font-weight: 600;
		filter: contrast(100%);
		background: rgba(255, 255, 255, 0.966);
		// background-clip: border-box;
		// background-blend-mode: multiply;
		// mix-blend-mode: darken;
		// filter:
		// backdrop-filter: opacity(100%) invert(100%);
		padding: 0 0.2rem;
		margin-left: 0.2rem;
	}
	.itemInfo {
		.title {
			font-weight: 300;
		}
		.artist {
			font-weight: 500;
		}
	}
	.item {
		cursor: pointer;
	}
	.item,
	.box {
		display: flex;
		flex-wrap: nowrap;
		flex-direction: row;
		// margin-top: 1rem;
		align-content: center;
		align-items: center;
		user-select: none;

		// background-color: transparentize(#aaa, 0.9);
		padding: 0.8em;
		border-bottom: 0.0714rem rgba(170, 170, 170, 0.24) solid;
		// border-radius: 0.8em;
		height: auto;
		flex-direction: row;
		transition: all cubic-bezier(0.39, 0.575, 0.565, 1) 0.23s;
		display: flex;
		flex-wrap: nowrap;
		div {
			margin-left: 0.5rem;
		}
	}
	.info {
		padding-left: 0.75rem;
	}
	.itemInfo {
		display: flex;
		flex-direction: column;
		flex: 1 0;
	}
	ul {
		padding: 0;
		margin: 0;
	}
	p {
		margin: 0;
	}
	.number,
	.icon-play {
		width: 2rem;
		font-size: 1.125rem;
		font-weight: 600;
		height: 2rem;
		margin-right: 0.75rem;
		margin-left: 0.75rem;
		opacity: 0;
		transition: opacity 1.25s ease-in-out;
		-moz-transition: opacity 0.25s ease-in-out;
		-webkit-transition: opacity 0.25s ease-in-out;

		&:hover {
			opacity: 1;
			transition: opacity 1.25s ease-in-out;
			-moz-transition: opacity 0.25s ease-in-out;
			-webkit-transition: opacity 0.25s ease-in-out;
		}
	}
	.number {
		opacity: 1 !important;
	}
</style>
