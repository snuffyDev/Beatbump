<script lang="ts">
	import list from '$lib/stores/list'
	import { createEventDispatcher, tick } from 'svelte'
	import { currentTitle, key } from '$stores/stores'
	import longpress from '$lib/actions/longpress'
	import Popout from '../Dropdown/Popout.svelte'
	import { clickOutside } from '$lib/js/clickOutside'
	export let item
	export let index
	const dispatch = createEventDispatcher()
	const DropdownItems = [
		{
			text: 'More like this',
			icon: 'music',
			action: async (params) => {
				window.scrollTo({
					behavior: 'smooth',
					top: 0,
					left: 0
				})
				// await tick()
				// list.getMore()
				alert('Coming soon!')
			}
		}
	]
	function handleClick(i) {
		$key = i
		currentTitle.set($list.mix[i - 1])
		dispatch('updated', {
			id: `${i}`
		})
	}
	let isHidden = false
</script>

<li id={index} class:active={$key == index} class="item">
	<div
		use:longpress
		on:longpress={(e) => {
			isHidden = true
		}}
		use:clickOutside
		on:click_outside={() => {
			isHidden = false
		}}
		on:
		class="pl-thumbnail"
		style="min-width:5rem; max-width:5rem;">
		<img
			referrerpolicy="origin-when-cross-origin"
			src={item.thumbnail}
			loading="lazy"
			alt="thumbnail" />
		<Popout items={DropdownItems} type="dd-menu" bind:isHidden />
	</div>
	<div
		class="clickable"
		on:click|stopPropagation={(event) => {
			// console.log(`${autoId}`)
			handleClick(index)
		}}>
		<div class="p-text">
			<span class="p-title">
				<span>{item.title}</span>
			</span>
			<span class="p-artist">
				<span>{item.artistInfo.artist}</span>
			</span>
		</div>
		<span class="p-length">
			<span>{item.length}</span>
		</span>
	</div>
</li>

<style lang="scss">
	.clickable {
		display: inline-flex;
		width: 100%;
	}
	.p-length {
		margin-left: auto;
		align-self: center;
		padding-right: 0.2rem;
		white-space: nowrap;
	}
	.item {
		user-select: none;
		margin-right: 0.75rem;
		margin-left: 0.75rem;
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
		background-color: transparentize(rgba(170, 170, 170, 0.801), 0.7);
		padding: 0.8em;
		border-color: #aaa;
		border-width: 1px;
		border-radius: 0.8em;
		cursor: pointer;
		flex-direction: row;
		// transition: all cubic-bezier(0.39, 0.575, 0.565, 1) 0.23s;
		display: flex;
		position: relative;
		flex-wrap: nowrap;
	}
	.subtitle {
		/* text-transform: uppercase; */

		font-size: 1.2rem;
		font-weight: 200;
		line-height: 1.1;
		margin: 4rem auto;
		max-width: 20rem;
		text-align: center;
		letter-spacing: 0.016em;
	}
	.pl-thumbnail {
		width: auto;
		height: 5rem;
		border-radius: var(--sm-radius);
		// opacity: 1;
		background: #00000017;
		img {
			aspect-ratio: inherit;
			width: auto;
			height: 100%;
			aspect-ratio: inherit;
			max-width: 100%;
			-o-object-fit: scale-down;
			object-fit: contain;
			background: transparent;
			border-radius: inherit;

			background-color: transparent;
			/* box-shadow: -0.1em 0.1em 0.5em 0 #00000057; */
			transition: background-color cubic-bezier(0.77, 0, 0.175, 1) 0.1s;
			filter: none;

			&:active {
				background-color: rgba(245, 241, 241, 0.199);
				transition: all cubic-bezier(0.39, 0.575, 0.565, 1) 0.23s;
			}
		}
	}
	.active {
		user-select: none;
		margin-right: 0.75rem;
		margin-left: 0.75rem;
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
		padding: 0.8em;
		background-color: hsl(0deg 0% 64% / 29%) !important;
		border-radius: 0.8em;
		cursor: pointer;
		flex-direction: row;
		transition: all cubic-bezier(0.39, 0.575, 0.565, 1) 0.23s;
		display: flex;
		flex-wrap: nowrap;
		.pl-thumbnail {
			background: rgba(126, 126, 126, 0.11);
			img {
				filter: drop-shadow(0.166667rem 0.333333rem 0.5rem #00000057);
			}
		}
	}

	img {
		width: auto;
		height: 100%;
		aspect-ratio: inherit;
		max-width: 100%;
		-o-object-fit: scale-down;
		object-fit: contain;
		background: rgba(12, 12, 12, 0.26); // border: 0.2em solid rgb(17 21 28);
		border-radius: 0.4em;
	}
	.p-artist {
		font-size: 1.0125rem;
		font-weight: 600;
	}
	.p-text {
		/*margin-left: .5em; */
		padding-left: 0.5em;
		display: inline-flex;
		font-size: 1rem;
		line-height: 1.75;
		flex-flow: wrap;
		justify-content: center;
		flex-direction: column;
		padding-inline: 0.8em;
	}
	img::before {
		display: block;
		content: '';
		padding-top: calc(100% * 2 / 3);
		/* You could reduce this expression with a preprocessor or by doing the math. I've kept the longer form in `calc()` to make the math more readable for this demo. */
	}
	.p-title {
		padding: 0em;
		font-size: 1.0125rem;
	}
	@media screen and (min-width: 641px) and (max-width: 800px) {
		.listContainer {
			width: 47.5%;
		}
	}
	@media screen and (max-width: 640px) {
		.p-text {
			/*margin-left: .5em; */
			padding-left: 0.5em;
			display: inline-flex;
			font-size: 1rem;

			flex-flow: wrap;
			justify-content: center;
			flex-direction: column;
			padding-inline: 0.8em;

			line-height: 1.2;
		}
		.p-title {
			padding: 0em;
			font-size: 1.0175rem;
		}
	}
</style>
