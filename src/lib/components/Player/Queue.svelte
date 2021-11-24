<script lang="ts">
	import { browser } from '$app/env'
	import drag from '$lib/actions/drag'
	import Icon from '$lib/components/Icon/Icon.svelte'
	import list from '$lib/stores/list'
	import { onMount, setContext } from 'svelte'
	import { quartInOut } from 'svelte/easing'
	import { fade, fly, slide } from 'svelte/transition'

	export let autoId
	export let showing = false

	$: if (browser) active = document.getElementById(autoId)
	$: mixList = $list.mix
	const ctxKey = {}
	let sliding
	let active
	let listContainer: HTMLElement
	let listWidth
	$: posY = 0
	let listHeight = window.innerHeight
	setContext(ctxKey, {
		width: listWidth,
		scrolling: sliding
	})
	function startHandler() {
		sliding = true
	}

	function release() {
		if (sliding) {
			if (posY < listHeight / 1.5) {
				console.log(posY, listHeight)
				close()
			}
		}
		sliding = false
	}
	function trackMovement({ y }) {
		// console.log(y, listHeight)
		if (y <= listHeight && y >= 0) {
			posY = y
		} else if (y < listHeight * 0.7) {
			trackOpen()
		} else {
			close()
		}
		// console.log(y, 'dy: ' + dy)
	}
	function trackOpen() {
		posY = posY
	}
	function open() {
		posY = 0
	}
	function close() {
		posY = posY
		showing = false
		sliding = false
		posY = 0
	}
	let mounted
	$: if (active) active.scrollIntoView(true)

	onMount(() => {
		active = document.getElementById(autoId)
		if (active) active.scrollIntoView(true)
		listContainer = document.getElementById('listContainer')
		listWidth = listContainer.clientWidth
	})
	let queueHeight
	$: transition = sliding
		? ''
		: 'transition: transform 300ms cubic-bezier(0.895, 0.03, 0.685, 0.22)'
	$: height = listHeight - queueHeight + 0.1
</script>

<div
	class="listContainer"
	id="listContainer"
	bind:clientHeight={queueHeight}
	style="transform: translate(0, calc({posY}px)); top: calc({height}px - 4.5rem); transition: {transition}; "
	in:fly|local={{ y: 350, easing: quartInOut }}
	out:fly|local={{
		delay: 125,
		duration: 450,
		easing: quartInOut,
		y: 400,
		opacity: 0.1
	}}
>
	<div
		class="handle"
		use:drag
		on:dragstart={startHandler}
		on:dragmove={(e) => trackMovement({ y: e.detail.y })}
		on:dragend={release}
	>
		<hr />
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
				}}
				on:removeItem
			>
				{#each mixList as item, index}
					<slot {item} {ctxKey} {index} />
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
	hr {
		width: clamp(25%, 35%, 80%);
		color: hsl(0deg 0% 80%);
		border-style: solid;
	}
	.handle {
		width: 100%;
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;
		border-bottom: 0.0175rem solid hsla(0, 0%, 66.7%, 0.233);
		border-top: 0.0175rem solid rgba(170, 170, 170, 0.034);
		box-shadow: 0 -0.4rem 0.8rem 0.5rem hsl(0deg 0% 100% / 9%);
		background: hsla(0, 0%, 66.7%, 0.027);
		z-index: -1;
		height: 1.5rem;
		display: flex;
		cursor: pointer;
		padding: 0.12rem;
		align-items: center;
	}
	.empty > * {
		color: white;
	}
	.empty {
		position: relative;
		padding-top: 4.5em;
		display: flex;
		flex-direction: column;
	}

	.listContainer {
		// isolation: auto;
		box-shadow: 0.1em -0.1em 0.1em 0em #00000040,
			0.1rem -0.1rem 0.05rem 0 rgba(255, 255, 255, 0.048);
		position: fixed;
		margin: 0;
		left: 0;
		border-radius: 0.8em 0.8em 0 0;

		display: flex;
		// bottom: 4.5rem;
		// right: 0;
		flex: 1 1 auto;
		visibility: visible;
		padding-top: 2rem;
		height: auto;
		width: auto;
		background: inherit;
		height: 78.75%;

		// bottom: 4.5rem;
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
		// opacity: 1;

		.subtitle {
			font-size: 1.2rem;
			font-weight: 200;
			line-height: 1.1;
			padding: 4rem 0;
			// max-width: 20rem;
			text-align: center;
			letter-spacing: 0.016em;
		}
	}
	.list {
		color: #fff;
		padding: 0;

		display: flex;
		flex-direction: column;
		min-width: 100%;
		width: 100%;
		position: relative;
		max-height: 100%;
		// margin: auto;
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
		width: 100%;
		padding-left: 0;
		padding: 0.225rem 0.6rem;
		padding-bottom: 0.125rem;
		overflow-x: hidden;
	}

	.empty-title {
		font-family: 'Gill Sans', 'Gill Sans MT', 'Calibri', 'Trebuchet MS',
			sans-serif;
		text-transform: capitalize;
		text-align: center;
		font-size: 4rem;
		letter-spacing: -0.02em;
		font-weight: 500;
		line-height: 1.1;
		// max-width: 14rem;
		padding: 1rem 0;
	}

	@media screen and (min-width: 641px) and (max-width: 800px) {
		.listContainer {
			width: 50.25%;
		}
	}
	@media screen and (max-width: 640px) {
		.listContainer {
			max-width: 100%;
			width: 100%;
		}
	}
</style>
