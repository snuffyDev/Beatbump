<script lang="ts">
	import '../../../global/vars.css'
	import { onDestroy, onMount } from 'svelte'
	import { theme } from '$lib/stores/stores'
	export let headerContent
	export let thumbnail = []
	export let description
	export let width
	let container
	let y = 0
	let handler = (event) => {}
	onMount(() => {
		let start

		let gradient = document.getElementById('gradient')

		handler = (event) => {
			if (start === undefined) start = event.timestamp
			const scroll = gradient.getBoundingClientRect()

			const elapsed = event.timestamp - start

			window.requestAnimationFrame(function (e) {
				y = Math.min(Math.max(-scroll.top / window.innerHeight, 0), 1) * 125
				if (elapsed < 200) {
					window.requestAnimationFrame(handler)
				}

				window.cancelAnimationFrame(y)
			})
		}
		let wrapper = document.getElementById('wrapper')

		wrapper.addEventListener('scroll', handler, { passive: true })
		return () => {
			window.removeEventListener('scroll', handler)
			wrapper.removeEventListener('scroll', handler)
		}
	})
	onDestroy(() => {
		window.removeEventListener('scroll', handler)
	})
</script>

<div class="artist-header">
	<div class="artist-thumbnail">
		<div
			bind:this={container}
			style={`background-image: linear-gradient(0turn, var(--${$theme}-base) ${Math.min(
				y,
				75
			)}%, transparent); transition: cubic-bezier(0.6, -0.28, 0.74, 0.05) all 120ms`}
			id="gradient"
			class="gradient" />
		<picture class="header-thumbnail">
			<img
				referrerpolicy="origin-when-cross-origin"
				class="header-thumbnail"
				loading="eager"
				src={thumbnail[1]?.url}
				alt="Artist Thumbnail" />
		</picture>
	</div>
	<div
		class="artist-content"
		style="		box-shadow:0rem 0rem 0.5rem 0.5rem var(--{$theme}-base), 1.5rem 0.5rem 0.8rem 0.5rem inset var(--{$theme}-base);">
		<div class="content-wrapper">
			<div class="name">{headerContent?.name}</div>
			{#if width > 500 && !!description}
				<div class="description">{description[0]}</div>
			{/if}
		</div>
	</div>
</div>

<!--  -->
<style lang="scss">
	// @import "../../../global/vars.css";

	.artist-header {
		display: block;
		margin-bottom: 0.5rem;
	}
	.artist-thumbnail {
		display: block;
		position: relative;
		height: 100%;
		min-height: 13rem;
		&::before {
			position: absolute;
			content: '';
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
		}
	}

	.gradient {
		z-index: 0;
		width: 100%;
		height: inherit;
		position: absolute;

		top: 0;
	}
	.header-thumbnail {
		z-index: -1;
		top: 0;
		width: 100%;
		max-height: 25%;
		overflow: hidden;
	}
	.artist-content {
		position: relative;
		z-index: 1;
		height: 0.25rem;
		.content-wrapper {
			position: absolute;
			bottom: 0;
			margin-bottom: 0.5rem;

			.description {
				display: block;
				padding: 0 2rem 2rem 2rem;
			}
			.name {
				font-weight: 700;
				font-size: 2.5rem;
				display: inline-block;
				font-family: 'Commissioner', sans-serif;

				// white-space: pre;
				text-shadow: rgba(0, 0, 0, 0.171) 0.2rem -0.12rem 0.5rem;

				letter-spacing: -0.02em;
				padding: 0.8em 0 0.8rem 0.5rem;

				@media (min-width: 320px) and (max-width: 499px) {
					padding: 0.8em 0 0.8rem 0.5rem;
				}
				@media (min-width: 500px) and (max-width: 640px) {
					padding: 0.8em 0 0.8rem 1.8rem;
				}
				@media screen and (min-width: 642px) and (max-width: 839px) {
					font-size: 2rem;
					// color: pink;
					padding: 0.8em 0 0.8rem 2rem;
				}
				@media screen and (min-width: 840px) and (max-width: 960px) {
					font-size: 3.5rem;
					// color: orange;
					inline-size: 100%;
					overflow-wrap: break-word;

					// font-size: 2.75em;
					padding: 0 2rem 0.8rem 2rem;
				}
				@media screen and (min-width: 961px) {
					padding: 0 2rem 0.8rem 2rem;
					font-size: 4.5rem;
				}
			}
		}
		@media screen and (max-width: 500px) {
			padding: 0.8rem;
		}
	}
</style>
