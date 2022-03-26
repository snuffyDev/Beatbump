<script lang="ts">
	import { browser } from "$app/env";
	import drag from "$lib/actions/drag";
	import list from "$lib/stores/list";
	import { tick } from "svelte";
	import { fly } from "svelte/transition";

	import { createEventDispatcher } from "svelte";
	import { quartOut } from "svelte/easing";
	const dispatch = createEventDispatcher();
	export let autoId;
	export let showing = false;

	const ctxKey = {};
	let active;
	let sliding = false;
	let posY = 0;
	let listHeight = 0;
	let queueHeight = 0;

	$: if (browser) active = document.getElementById(autoId);

	function startHandler({ detail }) {
		sliding = true;
	}

	function release() {
		if (sliding) {
			if (posY < listHeight * 0.3) {
				open();
			} else {
				close();
			}
		}
		sliding = false;
	}
	function trackMovement({ y }) {
		if (y <= listHeight && y >= 0) {
			posY = y;
		} else if (y < listHeight * 0.7) {
			trackOpen();
		} else {
			close();
		}
		// console.log(y, 'dy: ' + dy)
	}
	function trackOpen() {
		posY = posY;
	}
	function open() {
		posY = 0;
	}
	async function close() {
		showing = false;
		sliding = false;
		dispatch("close", { showing });
		await tick();
		posY = 0;

		// posY = 0
	}
	async function scrollIntoView() {
		await tick();
		document.getElementById(autoId).scrollIntoView(true);
	}
	$: if (
		queueHeight !== undefined &&
		autoId !== undefined &&
		$list.mix.length !== 0
	)
		scrollIntoView();
	$: transition = sliding
		? ""
		: "transition: transform 300ms cubic-bezier(0.895, 0.03, 0.685, 0.22);";
	$: height =
		queueHeight !== undefined && `calc(${listHeight - queueHeight}px)`;

	// : `calc(${(listHeight / 20.2) * 3}px - 0.5rem)`
</script>

<svelte:window bind:innerHeight={listHeight} />
<svelte:body on:scroll|preventDefault={() => {}} />
<!-- on:click={console.log} -->
<div
	class="backdrop"
	on:click|stopPropagation|self={() => dispatch("close", { showing: false })}
	on:scroll|preventDefault
	in:fly|local={{ duration: 800, delay: 400, y: queueHeight, easing: quartOut }}
	out:fly|local={{ duration: 400, y: listHeight, easing: quartOut }}
>
	<div
		class="listContainer"
		id="listContainer"
		bind:clientHeight={queueHeight}
		style="transform: translate(0, {posY}px); top: {height}; {transition};"
	>
		<div
			use:drag
			on:dragstart={startHandler}
			on:dragmove={(e) => trackMovement({ y: e.detail.y })}
			on:dragend={release}
			class="handle"
		>
			<hr />
		</div>
		<div class="list">
			{#if $list.mix.length > 0}
				<ul
					class="list-m"
					id="list"
					on:touchstart|stopPropagation={() => {
						sliding = true;
					}}
					on:mousedown|stopPropagation={() => {
						sliding = false;
					}}
				>
					{#each $list.mix as item, index}
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
</div>

<style lang="scss">
	.backdrop {
		position: fixed;
		inset: 0;
		// background: rgba(255, 255, 255, 0);
		min-height: 100vh;
		max-height: 100%;
		min-width: 100%;
		max-width: 100%;
		width: 100%;
		height: 100vh;
		user-select: none;
		background: #0000;
		z-index: -5;
		isolation: isolate;
	}
	hr {
		&::before {
			position: absolute;
			inset: 0;
			content: "";
			margin: 0 auto;
			width: 35%;
			color: hsl(0deg 0% 80%);
			background: hsl(0deg 0% 100%);
			height: 0.0625rem;

			line-height: inherit;
			z-index: 5;
		}
		width: 90%;
		border: none;
		position: relative;
	}
	.handle {
		width: 100%;

		border-bottom: 0.0175rem groove rgba(171, 171, 171, 0.151);
		border-top: 0.0175rem groove rgba(171, 171, 171, 0.151);
		border-top-left-radius: inherit;
		border-top-right-radius: inherit;
		box-shadow: 0 -0.4rem 0.8rem 0.5rem hsl(0deg 0% 100% / 9%);
		background: linear-gradient(
			to bottom,
			hsl(240, 10%, 10%),
			hsl(240, 2%, 7%) 50%,
			hsl(240, 1%, 6%) 90%
		);
		z-index: 1;
		height: 2rem;
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
		box-shadow: 0.1em -0.1em 0.1em 0em #00000040,
			0.1rem -0.1rem 0.05rem 0 rgba(255, 255, 255, 0.048);
		position: absolute;
		margin: 0;
		left: 0;
		border-radius: 0.8em 0.8em 0 0;

		display: grid;
		grid-template-rows: 2rem 1fr;
		visibility: visible;
		contain: layout;
		background: var(--bottom-bg);
		height: 75vh;
		transform: translate(0px, 0px);
		min-height: 0;
		width: 40%;
		z-index: 1;
		&::before {
			position: absolute;
			content: "";
			inset: 0;
			filter: brightness(0.5) saturate(0.5);
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
		// min-height: 23rem;
		margin: 0;
		min-width: 100%;
		width: 100%;
		position: relative;
		max-height: 100%;
		overflow-y: auto;
	}
	.list-m {
		padding: 0;
		list-style-type: none;
		touch-action: pan-y;
		padding-top: 0.125rem;
		height: 100%;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		margin: 0;
		// height: 100%;
		width: 100%;
		padding-left: 0;
		padding: 0.225rem 0.6rem;
		padding-bottom: 0.6rem;
		overflow-x: hidden;
	}

	.empty-title {
		font-family: "Gill Sans", "Gill Sans MT", "Calibri", "Trebuchet MS",
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
			margin: 0 auto;
			right: 0;
			max-width: 100%;
			width: 100%;
		}
	}
</style>
