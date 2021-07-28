<script lang="ts">
	import { fly } from 'svelte/transition'
	import { afterUpdate, createEventDispatcher, onMount } from 'svelte'
	import { cubicInOut } from 'svelte/easing'
	import { clickOutside } from '$lib/js/clickOutside'
	import list from '$lib/stores/list'
	import QueueListItem from './QueueListItem.svelte'

	export let curTheme
	export let autoId
	export let mixList = []
	export let show

	$: mixList = $list.mix

	let songList
	let active = document.getElementById(autoId)

	const dispatch = createEventDispatcher()
	// import slide from '$lib/actions/slide'
	onMount(() => {
		if (active) active.scrollIntoView(true)
	})
	$: if (active) active.scrollIntoView(true)
	afterUpdate(() => {
		let active = document.getElementById(autoId)
		if (active) active.scrollIntoView(true)
	})

	function showList() {
		dispatch('hide', {
			showing: false
		})
	}
</script>

{#if show}
	<!-- content here -->
	<div
		class="listContainer"
		use:clickOutside
		on:click_outside={() => {
			show = false
			showList()
		}}
		transition:fly={{ y: 0, duration: 125, easing: cubicInOut }}>
		<div class="list">
			{#if mixList.length > 0}
				<ul class="list-m" id="list" bind:this={songList}>
					{#each mixList as item, index}
						<QueueListItem on:updated {item} {index} />
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
{/if}

<style lang="scss">
	.empty > * {
		color: white;
	}
	.empty {
		display: inline-flex;
		flex-direction: column;
		/* place-items: center; */
		/* flex-wrap: nowrap; */
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.listContainer {
		isolation: auto;
		box-shadow: 0.1em -0.1em 0.1em 0em #00000040;
		position: fixed;
		margin: 0;
		left: 0;
		border-radius: 0.8em 0.8em 0 0;
		color: white;
		// bottom: -10em;
		display: flex;
		flex: 1 1 auto;
		visibility: visible;
		height: auto;
		width: auto;
		background: inherit;

		max-height: 75%;
		// transition: all cubic-bezier(0.23, 1, 0.32, 1) 1300ms;
		min-height: 55%;
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
		/* overflow-y: scroll !important; */
		overflow-y: hidden;
		opacity: 1;
		transition: all 250ms ease-in-out;
		bottom: 4em;
		&.slide {
			opacity: 1;
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
		.list {
			// background: #11151c;
			border-radius: 0.8em 0.8em 0 0;
			border: 1px solid #aaa;
			color: #fff;
			padding: 0;
			min-width: 100%;
			/* height: 100%; */
			/* overflow: scroll; */
			padding-bottom: 0.8rem;
		}
	}

	.list-m {
		padding: 0;
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
