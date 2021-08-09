<script lang="ts">
	import { clickOutside } from '$lib/js/clickOutside'
	import list from '$lib/stores/list'
	import { afterUpdate, createEventDispatcher, onMount, tick } from 'svelte'
	import { cubicInOut } from 'svelte/easing'
	import { fly } from 'svelte/transition'
	import QueueListItem from './QueueListItem.svelte'
	import { browser } from '$app/env'
	import slide from '$lib/actions/slide'
	import Icon from '$lib/components/Icon/Icon.svelte'
	import { spring } from 'svelte/motion'
	export let autoId
	export let showing = false
	export let QueueList = []
	let sliding
	$: mixList = $list.mix

	let active
	$: if (browser) active = document.getElementById(autoId)

	const dispatch = createEventDispatcher()

	afterUpdate(() => {
		if (sliding) return
		active = document.getElementById(autoId)
		if (active) active.scrollIntoView(true)
	})

	// let y = 22.0938
	let dy = 22.0938
	let queueList
	let listHeight = window.innerHeight
	function handler() {
		sliding = true
	}
	function mobile(event) {
		// console.log(event)
		if (event.touches[0]) {
			trackMovement({ y: Math.round(event.touches[0].clientY) })
		}
	}

	function release(event) {
		if (sliding) {
			if (dy < listHeight / 2) {
				open()
			} else {
				close()
			}
		}
		sliding = false
	}
	function trackMovement({ y }) {
		if (y <= listHeight && y >= 0) {
			dy = y
		} else if (y < listHeight / 2) {
			open()
		} else {
			close()
		}
		console.log(y, 'dy: ' + dy, listHeight, listHeight * 0.333)
	}
	function open() {
		dy = 22.0938
	}
	function close() {
		dy = 0
		showing = false
		sliding = false
	}
	onMount(() => {
		active = document.getElementById(autoId)
		if (active) active.scrollIntoView(true)
	})
</script>

<div
	bind:this={queueList}
	class="listContainer"
	style="transform: translate3d(0, {(dy + listHeight) / 32}vh, 0);"
	transition:fly={{ y: 0, duration: 125, easing: cubicInOut }}>
	<div
		class="handle"
		on:touchstart={handler}
		on:touchmove|passive={mobile}
		on:touchend={release}>
		<Icon name="minus" size="1rem" width="100%" />
	</div>

	<div class="list">
		{#if mixList.length > 0}
			<ul
				class="list-m"
				id="list"
				on:touchstart|stopPropagation={() => {
					sliding = true
				}}
				on:mousedown|stopPropagation={() => {
					sliding = false
				}}>
				{#each mixList as item, index}
					<slot {item} {index} />
				{/each}
			</ul>
		{:else}
			<div class="empty">
				<span class="empty-title">Empty!</span>
				<span class="subtitle">Choose a song to see your feed</span>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.handle {
		width: 100%;
		position: absolute;
		top: 0;
		right: 0;
		border-bottom: 0.125px solid rgba(170, 170, 170, 0.233);
		box-shadow: 0 -0.4rem 0.2rem 0 rgba(255, 255, 255, 0.247);
		background: rgba(170, 170, 170, 0.027);
		z-index: -1;
		height: 1rem;
	}
	.empty > * {
		color: white;
	}
	.empty {
		display: inline-flex;
		flex-direction: column;

		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.listContainer {
		isolation: auto;
		box-shadow: 0.1em -0.1em 0.1em 0em #00000040,
			0.1rem -0.1rem 0.05rem 0 rgba(255, 255, 255, 0.048);
		position: fixed;
		margin: 0;
		left: 0;
		border-radius: 0.8em 0.8em 0 0;

		display: flex;
		top: 0;
		right: 0;
		flex: 1 1 auto;
		visibility: visible;
		padding-top: 1rem;
		height: auto;
		width: auto;
		background: inherit;
		max-height: 75%;

		bottom: 5.4rem;
		transition: transform cubic-bezier(0.23, 1, 0.32, 1) 120ms;
		min-height: 23rem;
		width: 40%;
		z-index: -1;
		&::before {
			position: absolute;
			content: '';
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			filter: brightness(0.4);
			width: 100%;
			height: 100%;
			z-index: -1;
			background-color: inherit;
		}

		overflow-y: hidden;
		opacity: 1;

		.subtitle {
			font-size: 1.2rem;
			font-weight: 200;
			line-height: 1.1;
			margin: 4rem auto;
			max-width: 20rem;
			text-align: center;
			letter-spacing: 0.016em;
		}
	}
	.list {
		color: #fff;
		padding: 0;
		min-width: 100%;
	}
	.list-m {
		padding: 0;
		padding-top: 0.125rem;
		list-style-type: none;
		touch-action: pan-y;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		margin: 0;
		overflow-y: scroll;
		height: 100%;
		scroll-padding-top: 0.8rem;
		padding-bottom: 2rem;
	}

	.empty-title {
		font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS',
			sans-serif;
		text-transform: capitalize;
		text-align: center;
		font-size: 4rem;
		letter-spacing: -0.02em;
		font-weight: 500;
		line-height: 1.1;
		margin: 4rem auto;
		max-width: 14rem;
		margin: 2rem auto;
	}

	@media screen and (min-width: 641px) and (max-width: 800px) {
		.listContainer {
			width: 47.5%;
		}
	}
	@media screen and (max-width: 640px) {
		.listContainer {
			max-width: 100%;
			width: 100%;
			height: auto;
			max-height: 75%;
		}
	}
</style>
