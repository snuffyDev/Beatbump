<script>
	import Icon from '$components/Icon/Icon.svelte'
	import { isPagePlaying, key } from '$stores/stores'
	import { createEventDispatcher } from 'svelte'
	import list from '$lib/stores/list'
	export let item
	export let index
	export let page
	export let ctx = {}
	import { getContext } from 'svelte'
	const { pageId } = getContext(ctx)
	const dispatch = createEventDispatcher()
	function dispatchPlaying() {
		dispatch('pagePlaying', {
			isPlaying: true
		})
	}
	let isHovering = false
	let parent
</script>

<div
	bind:this={parent}
	class="item"
	class:playing={$isPagePlaying == pageId && index == $key}
	on:click={async () => {
		// @ts-ignore
		if (page == 'playlist') {
			key.set(index)
			console.log('key: ' + $key, item.playlistId)

			await list.initList(
				item.videoId,
				item.playlistId,
				index,
				item.playlistSetVideoId ? item.playlistSetVideoId : '',
				'',
				item.playerParams
			)
		} else {
			key.set(0)
			await list.initList(item.videoId, item.playlistId, $key)
		}
		dispatchPlaying()
	}}
>
	<div
		class="item-wrapper"
		on:mouseenter|capture={(e) => {
			if (parent && parent.contains(e.target)) isHovering = true
		}}
		on:mouseleave|capture={(e) => {
			// isHovering = false
			if (parent && parent.contains(e.target)) {
				isHovering = true
			}
			isHovering = false
		}}
	>
		<div class="number">
			<span class:hidden={!isHovering}>
				<svelte:component this={Icon} class="icon" name="play" size="1.5em" />
			</span>
			<!-- content here -->
			<span class:hidden={isHovering}
				>{index + 1}<!-- else content here --></span
			>
		</div>
		<div class="itemInfo">
			<div class="item-title">
				{item.title}
				{#if item.explicit}
					<span class="explicit">
						{item.explicit ? 'E' : ''}
					</span>
				{/if}
			</div>
			<div class="artists">
				{#if item.subtitle}
					{#each item?.subtitle as subtitle}
						<span class="artist">{subtitle.text}</span>
					{/each}
				{/if}
			</div>
		</div>
		<span class="length" class:hidden={!item?.length ? true : false}
			>{item?.length}</span
		>
	</div>
</div>

<!-- markup (zero or more items) goes here -->
<style lang="scss">
	.artists {
	}
	.hidden {
		display: none;
		visibility: hidden;
	}
	.length {
		align-self: center;
		margin-right: 1.5rem;
	}
	.item-wrapper {
		display: flex;
		padding: 0.4rem 0;
		/* align-items: stretch; */
		/* flex-wrap: nowrap; */
		height: 100%;
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
	.itemInfo {
		display: inline-flex;
		flex-direction: column;
		flex: 1 0;
		align-self: center;
		margin-right: 1.8rem;
		.item-title {
			font-weight: 400;
		}
		.artist {
			font-family: 'Commissioner', sans-serif;
			font-weight: 450;
		}
	}
	.item {
		cursor: pointer;
		height: 5rem;
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
		border: 0.001rem solid #12121233;
		background: rgba(238, 238, 238, 0.966);
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
	.item {
		display: flex;
		flex-direction: column;
		align-content: center;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		flex: 0 1 auto;
		height: auto;
		border-bottom: calc(0.000321rem / 2) solid rgb(141 141 142 / 34%);
		width: 100%;
		flex-wrap: nowrap;
		padding: 0.1rem 0.9rem;
		&:hover,
		&:active:not(.menu) {
			background: lighten(#57575831, 1%);
			transition: cubic-bezier(0.25, 0.46, 0.45, 0.94) all 0.125s;
			pointer-events: all;
			&:active:not(.menu) {
				background: lighten(#212225, 5%);
				transition: cubic-bezier(0.25, 0.46, 0.45, 0.94) all 0.125s;
			}
		}
	}
	.playing {
		background: lighten(#2122254f, 5%);
		transition: cubic-bezier(0.25, 0.46, 0.45, 0.94) all 0.125s;
	}
	// background-color: transparentize(#aaa, 0.9);

	.itemInfo {
		display: flex;
		flex-direction: column;
		flex: 1 0;
	}

	.number {
		width: 2rem;
		font-size: 1.125rem;
		font-weight: 600;
		height: 2rem;
		text-align: center;
		pointer-events: all;
		opacity: 1;
		margin-left: 0.4rem;
		margin-right: 1.1rem;
		align-self: center;

		justify-self: center;
	}
</style>
