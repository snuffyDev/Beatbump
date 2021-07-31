<script lang="ts">
	import longpress from '$lib/actions/longpress'
	import { clickOutside } from '$lib/js/clickOutside'
	import list from '$lib/stores/list'
	import { currentTitle, key } from '$stores/stores'
	import { createEventDispatcher } from 'svelte'
	import Popout from '../Dropdown/Popout.svelte'

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
				list.moreLikeThis(item)
				// await tick()
				// list.getMore()
				// alert('Coming soon!')
			}
		}
	]
	function handleClick(i) {
		i--
		currentTitle.set($list.mix[i].title)
		dispatch('updated', {
			id: `${i}`
		})
	}
	let isHidden = false
	$: console.log(item)
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
		width: 100%;
		display: inline-flex;
	}
	.p-length {
		margin-left: auto;
		align-self: center;
		white-space: nowrap;
		padding-right: 0.2rem;
	}
	.item {
		display: flex;
		padding: 0.8em;
		cursor: pointer;
		user-select: none;
		border-width: 1px;
		flex-wrap: nowrap;
		margin-top: 0.5rem;
		border-color: #aaa;
		position: relative;
		flex-direction: row;
		margin-left: 0.75rem;
		border-radius: 0.8em;
		margin-right: 0.75rem;
		margin-bottom: 0.5rem;
		// transition: all cubic-bezier(0.39, 0.575, 0.565, 1) 0.23s;;
		background-color: transparentize(rgba(170, 170, 170, 0.801), 0.7);
	}
	.pl-thumbnail {
		width: auto;
		height: 5rem;
		// opacity: 1;;
		background: #00000017;
		border-radius: var(--sm-radius);
		img {
			width: auto;
			height: 100%;
			filter: none;
			max-width: 100%;
			object-fit: contain;
			aspect-ratio: inherit;
			aspect-ratio: inherit;
			border-radius: inherit;
			background: transparent;
			-o-object-fit: scale-down;
			background-color: transparent;
			/* box-shadow: -0.1em 0.1em 0.5em 0 #00000057; */
			transition: background-color cubic-bezier(0.77, 0, 0.175, 1) 0.1s;

			&:active {
				background-color: rgba(245, 241, 241, 0.199);
				transition: all cubic-bezier(0.39, 0.575, 0.565, 1) 0.23s;
			}
		}
	}
	.active {
		display: flex;
		padding: 0.8em;
		cursor: pointer;
		user-select: none;
		flex-wrap: nowrap;
		margin-top: 0.5rem;
		flex-direction: row;
		margin-left: 0.75rem;
		border-radius: 0.8em;
		margin-right: 0.75rem;
		margin-bottom: 0.5rem;
		background-color: hsl(0deg 0% 64% / 29%) !important;
		transition: all cubic-bezier(0.39, 0.575, 0.565, 1) 0.23s;
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
		max-width: 100%;
		object-fit: contain;
		pointer-events: none;
		border-radius: 0.4em;
		aspect-ratio: inherit;
		-o-object-fit: scale-down;
		background: rgba(12, 12, 12, 0.26); // border: 0.2em solid rgb(17 21 28);;
	}
	.p-artist {
		font-weight: 600;
		font-size: 1.0125rem;
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
		content: '';
		display: block;
		padding-top: calc(100% * 2 / 3);
		/* You could reduce this expression with a preprocessor or by doing the math. I've kept the longer form in `calc()` to make the math more readable for this demo. */
	}
	.p-title {
		padding: 0em;
		font-size: 1.0125rem;
	}
	@media screen and (max-width: 640px) {
		.p-text {
			font-size: 1rem;
			flex-flow: wrap;
			line-height: 1.2;
			padding-left: 0.5em;
			display: inline-flex;
			padding-inline: 0.8em;
			/*margin-left: .5em; */
			flex-direction: column;
			justify-content: center;
		}
		.p-title {
			padding: 0em;
			font-size: 1.0175rem;
		}
	}

	:root .light * {
		color: white;
	}
</style>
