<script lang="ts">
	import { fly, fade, slide } from 'svelte/transition'
	import {
		afterUpdate,
		beforeUpdate,
		createEventDispatcher,
		onMount
	} from 'svelte'
	import { cubicIn, cubicInOut } from 'svelte/easing'
	import { currentTitle } from '$stores/stores'
	import { getSrc } from '$lib/utils'
	import { clickOutside } from '$lib/js/clickOutside'

	export let autoId
	export let mixList = []
	export let show

	$: list = mixList

	let songList
	let items = []
	let active

	const dispatch = createEventDispatcher()

	onMount(() => {
		active = document.getElementById(autoId)
		if (active) active.scrollIntoView(true)
	})
	afterUpdate(() => {
		active = document.getElementById(autoId)

		if (active) active.scrollIntoView(true)
	})
	beforeUpdate(() => {
		active = document.getElementById(autoId)

		if (active) active.scrollIntoView(true)
	})

	$: if (list.length > 1) {
		active = document.getElementById(autoId)
		if (active) active.scrollIntoView(true)
	}

	async function handleClick(i) {
		autoId = i
		const src = await getSrc(mixList[i].videoId).catch((err) =>
			console.log(err)
		)
		currentTitle.set(mixList[autoId].title)
		dispatch('updated', {
			src: `${src}`,
			id: `${autoId}`
		})
	}
	function showList(i) {
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
			showList(show)
		}}
		transition:fly={{ y: 0, duration: 125, easing: cubicInOut }}>
		<div class="list">
			{#if list.length > 1}
				<ul class="list-m" id="list" bind:this={songList}>
					{#each mixList as item, index}
						<li
							id={index}
							bind:this={items[index]}
							class:active={autoId == index}
							transition:fade|local
							class="item"
							on:click={async () => {
								// console.log(`${autoId}`)
								handleClick(index)
							}}>
							<div class="pl-thumbnail" style="min-width:5rem; max-width:5rem;">
								<img
									referrerpolicy="origin-when-cross-origin"
									src={item.thumbnail}
									loading="lazy"
									alt="thumbnail" />
							</div>
							<div class="p-text">
								<span class="p-title">
									<span>{item.title}</span>
								</span>
								<span class="p-artist">
									<span>{item.artist}</span>
								</span>
							</div>
							<span class="p-length">
								<span>{item.length}</span>
							</span>
						</li>
					{/each}
				</ul>
			{:else}
				<div>
					<h1>Empty!</h1>
					<div class="subtitle">Choose a song to see your feed</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style lang="scss">
	.p-length {
		margin-left: auto;
		align-self: center;
		padding-right: 0.2rem;
		white-space: nowrap;
	}
	.listContainer {
		isolation: auto;
		box-shadow: 0.2em 0 3em 0em #00000040;
		position: fixed;
		margin: 0;
		left: 0;
		// bottom: -10em;
		display: flex;
		flex: 1 1 auto;
		visibility: visible;
		height: auto;
		width: auto;

		max-height: 75%;
		// transition: all cubic-bezier(0.23, 1, 0.32, 1) 1300ms;
		min-height: 55%;
		width: 40%;
		z-index: -1;

		/* overflow-y: scroll !important; */
		overflow-y: hidden;
		opacity: 1;
		transition: all 125ms ease-in;
		bottom: 4em;
		&.slide {
			opacity: 1;
		}
		.list {
			// background: #11151c;
			background: theme-color('dim', 'side');
			border-radius: 0.8em 0.8em 0 0;
			border: 1px solid rgb(170 170 170);
			/* overflow-y: scroll; */
			padding: 0;
			/* display: inline; */
			min-width: 100%;
			/* height: 100%;*/
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
		border-radius: 0.2em;

		img {
			aspect-ratio: inherit;
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
	}
	img {
		width: auto;
		height: 100%;
		aspect-ratio: inherit;
		max-width: 100%;
		-o-object-fit: scale-down;
		object-fit: cover;
		// border: 0.2em solid rgb(17 21 28);
		border-radius: 0.2em;
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

		flex-flow: wrap;
		justify-content: center;
		flex-direction: column;
		padding-inline: 0.8em;
	}

	h1 {
		text-transform: capitalize;
		text-align: center;
		font-size: 4rem;
		font-weight: 300;
		line-height: 1.1;
		margin: 4rem auto;
		max-width: 14rem;
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
		.listContainer {
			max-width: 100%;
			width: 100%;
			height: auto;
			max-height: 75%;
		}
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
