<script lang="ts">
	import longpress from '$lib/actions/longpress';
	import { clickOutside } from '$lib/actions/clickOutside';
	import list from '$lib/stores/list';
	import { currentTitle, key } from '$stores/stores';
	import { createEventDispatcher, getContext } from 'svelte';
	import Popout from '../Dropdown/Popout.svelte';

	export let item;
	export let index;
	export let ctxKey = {};
	const dispatch = createEventDispatcher();

	const DropdownItems = [
		{
			text: 'More like this',
			icon: 'music',
			action: async (params) => {
				window.scrollTo({
					behavior: 'smooth',
					top: 0,
					left: 0
				});
				list.moreLikeThis(item);
			}
		},
		{
			text: 'Remove from queue',
			icon: 'x',
			action: async (params) => {
				list.removeItem(index);
			}
		}
	];

	function handleClick(i) {
		currentTitle.set($list.mix[i].title);
		dispatch('updated', {
			id: `${i}`
		});
	}
	$: console.log(item);
	let isShowing = false;
</script>

<div class="li-wrapper">
	<li id={index} class:active={$key == index} class="item">
		<div
			use:longpress
			on:longpress={(e) => {
				isShowing = true;
				// pressing = false
			}}
			use:clickOutside
			on:click_outside={() => {
				isShowing = false;
			}}
			class="pl-thumbnail"
			style="min-width:5rem; max-width:5rem;"
		>
			<img
				src={item.thumbnails && item.thumbnails[0].url}
				width={item.thumbnails && item.thumbnails[0].width}
				height={item.thumbnails && item.thumbnails[0].height}
				alt="thumbnail"
				loading="lazy"
				decoding="async"
			/>
			<Popout items={DropdownItems} type="dd-menu" bind:isShowing />
		</div>
		<div
			class="clickable"
			on:click|stopPropagation={(event) => {
				handleClick(index);
			}}
		>
			<div class="p-text">
				<span class="p-title">{item?.title}</span>
				<span class="p-artist">
					{item.artistInfo?.artist[0]?.text ?? item.artistInfo.artist}
				</span>
			</div>
			<span class="p-length">
				{item.length ?? ''}
			</span>
		</div>
	</li>
</div>

<style lang="scss">
	* {
		color: #f3f3f3 !important;
	}
	.clickable {
		width: 100%;
		display: grid;
		max-width: 100%;
		/* flex: 1 1 auto; */
		/* flex-direction: row; */
		align-items: center;
		grid-template-columns: 1fr auto;
	}
	.p-length {
		align-self: center;
		white-space: nowrap;
		padding-right: 0.2rem;
	}
	.li-wrapper {
		position: relative;
		height: 6.9rem;
		margin-top: 0.425rem;

		margin-bottom: 0.425rem;
	}
	.item {
		display: flex;
		padding: 0.8em;
		cursor: pointer;
		user-select: none;
		border-width: 1px;
		flex-wrap: nowrap;
		border-color: rgba(36, 36, 36, 0.452);
		// position: absolute;
		flex-direction: row;
		left: 0%;
		right: 0;
		height: 100%;
		top: 0;
		// bottom: 0;
		// margin-left: 0.75rem;
		border-radius: 0.8em;
		// margin-right: 0.75rem;
		// margin-bottom: 0.5rem;
		width: 100%;

		background-color: transparentize(rgba(170, 170, 170, 0.801), 0.7);
		transition: all cubic-bezier(0.39, 0.575, 0.565, 1) 0.15s;
	}
	.pl-thumbnail {
		width: auto;
		height: 5rem;
		touch-action: none;

		background: #00000027;
		border-radius: $sm-radius;
		-webkit-user-drag: none;
		-khtml-user-drag: none;
		-moz-user-drag: none;
		-o-user-drag: none;
		user-drag: none;

		-webkit-touch-callout: none;
		-webkit-text-size-adjust: none;
		-webkit-user-select: none;
		user-select: none;
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

			transition: background-color cubic-bezier(0.77, 0, 0.175, 1) 0.1s;

			&:active {
				background-color: rgba(245, 241, 241, 0.295);
				transition: all cubic-bezier(0.39, 0.575, 0.565, 1) 0.23s;
				border: rgba(170, 170, 170, 0.801) solid 0.5rem;
			}
		}
	}
	.active {
		background-color: hsl(0deg 0% 64% / 29%) !important;
		transition: all cubic-bezier(0.39, 0.575, 0.565, 1) 0.15s;
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
		background: rgba(12, 12, 12, 0.26);
	}
	.p-artist {
		font-weight: 600;
		font-size: 1.0125rem;
	}
	.p-text {
		padding-left: 0.5em;
		display: flex;
		overflow: hidden;
		font-size: 1rem;
		line-height: 1.75;
		flex-flow: nowrap;
		flex-direction: column;
		padding-inline: 0.8em;
		max-width: 95%;
		/* margin-right: auto;*/
	}
	img::before {
		content: '';
		display: block;
		padding-top: calc(100% * 2 / 3);
	}
	.p-title {
		padding: 0;
		font-size: 1.0125rem;
		display: block;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}
	@media screen and (max-width: 640px) {
		.p-text {
			font-size: $size-1;
			// flex-flow: wrap;
			line-height: 1.5;
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
</style>
