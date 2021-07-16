<script lang="ts">
	import { getData } from "$lib/utils";
	import { page } from "$app/stores";

	import { onMount } from "svelte";
	export let headerContent;
	export let items = [];
	export let thumbnail = [];
	export let description;
	export let width;
	let container;
	let y = 0;
	onMount(() => {
		let start;

		let gradient = document.getElementById("gradient");

		function handler(event) {
			if (start === undefined) start = event.timestamp;
			const scroll = gradient.getBoundingClientRect();

			const elapsed = event.timestamp - start;

			window.requestAnimationFrame(function (e) {
				y = Math.min(Math.max(-scroll.top / window.innerWidth, 0), 5) * 200;

				// Math.min(-0.2 * scroll.top);
				// console.log(y);
				if (elapsed < 2000) {
					// Stop the animation after 2 seconds
					window.requestAnimationFrame(handler);
				}

				window.cancelAnimationFrame(y);
				// -scroll.top * 2;
				// (-scroll.top Math.max(0, y / 40)0) * 2;
			});

			// console.log(y);
		}
		// window.requestAnimationFrame(handler);
		// window.addEventListener("scroll", handler);
		let wrapper = document.getElementById("wrapper");

		wrapper.addEventListener("scroll", handler, { passive: true });
		return () => window.removeEventListener("scroll", handler);
	});
</script>

<!-- <svelte:window bind:scrollY={y} /> -->
<div class="artist-header">
	<div class="artist-thumbnail">
		<div
			bind:this={container}
			style={`background-image: linear-gradient(0turn, var(--ytm-base) ${Math.min(
				y,
				75
			)}%, transparent); transition: cubic-bezier(0.6, -0.28, 0.74, 0.05) background-image 125ms`}
			id="gradient"
			class="gradient" />
		<picture class="header-thumbnail">
			<img
				referrerpolicy="origin-when-cross-origin"
				class="header-thumbnail"
				loading="eager"
				src={thumbnail[1].url}
				alt="Artist Thumbnail" />
		</picture>
	</div>
	<div class="artist-content">
		<div class="content-wrapper">
			<div class="name">{headerContent.name}</div>
			{#if width > 500 && !!description}
				<div class="description">{description[0]}</div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	@import "../../../global/vars.css";
	.artist-body {
		padding: 0 1rem;
	}
	button {
		flex-wrap: nowrap;
		display: flex;
		place-items: center;
		color: #09090a !important;
		font-weight: 500;
		border: #09090a;
		background: white !important;
		margin-bottom: 0.8rem;

		padding: 0.3rem;
	}
	.radio-button {
		background: transparent !important;
		border: white 0.1rem solid !important;
		color: white !important;
		svg > * {
			fill: white;
		}

		&:active,
		&:hover {
			border: rgb(158, 158, 158) 0.1rem solid !important;
			background: rgba(255, 255, 255, 0.027) !important;
			box-shadow: 0 0 0.1em 0 inset black;
			color: rgb(236, 236, 236) !important;
		}
	}
	.btn-text {
		margin-left: 0.25rem;
	}
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
			content: "";
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
				font-family: "Commissioner", sans-serif;

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
	main {
		margin: 0;
		padding: 0;
	}
</style>
