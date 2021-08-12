<script lang="ts">
	import list from '$lib/stores/list'
	import { afterUpdate, onMount } from 'svelte'
	import { browser } from '$app/env'
	import drag from '$lib/actions/drag'
	import Icon from '$lib/components/Icon/Icon.svelte'
	export let autoId
	export let showing = false

	$: if (browser) active = document.getElementById(autoId)
	$: mixList = $list.mix

	let sliding
	let active
	let posY = 0
	let listHeight = window.innerHeight
	function startHandler() {
		sliding = true
	}

	function release() {
		if (sliding) {
			if (posY < listHeight / 1.5) {
				open()
			} else {
				close()
			}
		}
		sliding = false
	}
	function trackMovement({ y, dy }) {
		// console.log(y, y + dy)
		if (y <= listHeight && y >= 0) {
			posY = y + dy
		} else if (y < listHeight / 1.5) {
			open()
		} else {
			close()
		}
		// console.log(y, 'dy: ' + dy)
	}
	function open() {
		posY = 0
	}
	function close() {
		posY = 0
		showing = false
		sliding = false
	}
	onMount(() => {
		active = document.getElementById(autoId)
		if (active) active.scrollIntoView(true)
	})
	afterUpdate(() => {
		if (sliding) return
		active = document.getElementById(autoId)
		if (active) active.scrollIntoView(true)
	})
</script>

<div class="listContainer" style="transform: translate(0, {posY / 28}vh);">
	<div
		class="handle"
		use:drag
		on:startDrag={startHandler}
		on:dragMove={(e) => trackMovement({ y: e.detail.y, dy: e.detail.dy })}
		on:dragEnd={release}>
		<Icon name="minus" color="white" size="1rem" width="100%" />
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
		border-bottom: 0.0175rem solid hsla(0, 0%, 66.7%, 0.233);
		box-shadow: 0 -0.4rem 0.8rem 0.5rem hsl(0deg 0% 100% / 9%);
		background: hsla(0, 0%, 66.7%, 0.027);
		z-index: -1;
		height: 1rem;
		display: flex;
		align-items: center;
	}
	.empty > * {
		color: white;
	}
	.empty {
		display: flex;
		flex-direction: column;
		justify-content: center;
		width: 100%;
		height: 100%;
		align-items: center;
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
		// top: 0;
		right: 0;
		flex: 1 1 auto;
		visibility: visible;
		padding-top: 1rem;
		height: auto;
		width: auto;
		background: inherit;
		height: 75%;

		bottom: 4.5rem;
		transition: transform 0.12s cubic-bezier(0.39, 0.58, 0.57, 1);
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
			padding: 4rem 0;
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
		font-family: 'Gill Sans', 'Gill Sans MT', 'Calibri', 'Trebuchet MS',
			sans-serif;
		text-transform: capitalize;
		text-align: center;
		font-size: 4rem;
		letter-spacing: -0.02em;
		font-weight: 500;
		line-height: 1.1;
		max-width: 14rem;
		padding: 1rem 0;
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
		}
	}
</style>
