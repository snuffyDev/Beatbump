<script lang="ts">
	import list from '$lib/stores/list'
	import Icon from '$lib/components/Icon/Icon.svelte'
	import { theme } from '$lib/stores/stores'
	import { onMount } from 'svelte'
	import '../../../global/vars.css'
	import { clickOutside } from '$lib/js/clickOutside'
	import { fade } from 'svelte/transition'
	import { browser } from '$app/env'

	export let header
	export let thumbnail = []
	export let description: string
	export let width
	let container: HTMLDivElement
	let y = 0
	let wrapper: HTMLElement
	let isExpanded
	let scroll

	const handler = (e) => {
		if (!browser) return
		if (container) scroll = container.getBoundingClientRect()
		// console.log(scroll)
		if (container) {
			y =
				window.innerWidth < 500
					? Math.min(Math.max((-scroll.top / window.innerHeight) * 4, 0), 10) *
					  150
					: Math.min(Math.max((-scroll.top / window.innerHeight) * 4, 0), 10) *
					  50
		}
	}
	$: isExpanded && handler()
	onMount(() => {
		let start

		wrapper = document.getElementById('wrapper')
		wrapper.addEventListener('scroll', () =>
			window.requestAnimationFrame(handler)
		)
		return () => {
			window.cancelAnimationFrame(y)
			wrapper.removeEventListener('scroll', () =>
				window.cancelAnimationFrame(y)
			)
		}
	})
</script>

<!--
{#if showModal}
	<div class="modal-wrapper" transition:fade={{ duration: 150 }}>
		<div
			class="modal"
			use:clickOutside
			on:click_outside={() => (showModal = false)}
		>
			<h1 class="modal-name">{header?.name}</h1>
		</div>
	</div>
{/if} -->
<div class="artist-header">
	<div class="artist-thumbnail">
		<div
			bind:this={container}
			style={`background-image: linear-gradient(1turn, var(--${
				browser ? $theme : 'midnight'
			}-base) ${Math.min(
				Math.max(10, y),
				70
			)}%, transparent); transition: cubic-bezier(0.6, -0.28, 0.74, 0.05) all 120ms`}
			id="gradient"
			class="gradient"
		/>
		{#if thumbnail !== undefined}
			<picture class="header-thumbnail">
				{#each thumbnail as img, i}
					{#if i == 0}
						<source
							media="(max-width:{img.width}px)"
							srcset={img.url}
							type="image/jpeg"
						/>
						<source
							media={`(min-width:${img.width + 1}px) and (max-width:${
								thumbnail[i + 1].width
							}px)`}
							srcset={img.url}
							type="image/jpeg"
						/>
					{:else if i == thumbnail.length - 1}
						<!-- <source
							media="(min-width:{thumbnail[i - 1]
								.width}px) and (max-width:{img.width}px)"
							srcset={img.url}
							type="image/jpeg" /> -->
					{:else}
						<source
							media={`(min-width:${img.width + 1}px) and (max-width:${
								thumbnail[i + 1].width
							}px)`}
							srcset={thumbnail[i + 1].url}
							type="image/jpeg"
						/>
					{/if}
				{/each}
				<img
					referrerpolicy="origin-when-cross-origin"
					class="header-thumbnail"
					loading="eager"
					src={thumbnail[1]?.url}
					alt="Artist Thumbnail"
				/>
			</picture>
		{/if}
		<div class="artist-content">
			<div class="content-wrapper">
				<div class="name">{header?.name}</div>
				{#if description}
					<div class="description" class:expanded={isExpanded}>
						{description}
					</div>
					<div class="show-more" on:click={() => (isExpanded = !isExpanded)}>
						<span class="btn-text">Show {isExpanded ? 'Less' : 'More'}</span>
					</div>
				{/if}
				<div class="btn-wrpr">
					<button
						class="outlined"
						on:click={list.startPlaylist(header.mixInfo.playlistId)}
						><Icon size="1.25em" name="radio" /><span class="button-text">
							Play Radio</span
						></button
					>
				</div>
			</div>
		</div>
	</div>
</div>

<!--  -->
<style lang="scss">
	.show-more {
		display: inline-flex;
		font-size: 1em;
		font-family: system-ui;
		cursor: pointer;
		color: rgb(156, 156, 156);
		font-variant: all-small-caps;
		align-items: center;
		margin-bottom: 0.8rem;
		font-weight: 600;
		margin-bottom: 1.7rem;
		font-weight: 600;
		line-height: 1;
		&:hover {
			color: rgb(194, 194, 194);
			text-decoration: underline 0.05rem solid;
		}
		@media screen and (max-width: 53.333333rem) {
			display: none !important;
			visibility: none !important;
		}
	}
	.description {
		--line-height: 1.4;
		display: none;
		visibility: hidden;
		@media screen and (min-width: 53.333333rem) {
			--lines: 3;
			font-family: Roboto, Noto Naskh Arabic UI, Arial, sans-serif;
			font-size: 14px;
			line-height: var(--line-height);
			font-weight: 400;
			color: #fff;
			display: block;
			visibility: visible;
			display: -webkit-box;
			-webkit-line-clamp: 3;
			-webkit-box-orient: vertical;
			overflow: hidden;
			white-space: normal;

			white-space: normal;
			max-height: calc(var(--lines) * 14px * var(--line-height));
			margin-bottom: 0.8rem;
			&.expanded {
				--lines: 12;
				--max-lines: var(--lines);
				-webkit-line-clamp: var(--max-lines);
				max-height: calc(var(--max-lines) * 14px * var(--line-height));
			}
		}
	}
	details {
		// position: static;
	}

	.modal {
		position: absolute;
		top: 0%;
		// transform: translate(25%, 0%);
		right: 0;
		left: 0%;
		bottom: 0;
		width: 80%;
		// height: 90%;
		align-self: center;

		max-height: 100%;
		overflow-y: scroll;
		margin: auto;
		padding: 1rem;
		z-index: 5;
		height: 80%;
		border-radius: var(--md-radius);
		// backdrop-filter: blur(1rem);
		background: var(--color-med);
	}
	.modal-wrapper {
		position: fixed;
		top: 0%;
		// transform: translate(25%, 0%);
		right: 0;
		left: 0%;
		bottom: 0;
		width: 100%;
		height: 100%;
		z-index: 5;
		&::before {
			background: rgba(0, 0, 0, 0.438);
			position: absolute;
			z-index: -1;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			content: '';
			width: 100%;
			height: 100%;
			backdrop-filter: blur(0.05rem);
		}
	}

	.artist-header {
		display: block;
		// margin-bottom: 0.5rem;
		// height: 100%;
		position: relative;
		// max-height: 50vh;
		@media only screen and (min-width: 640px) {
			// max-height: 75vh;
		}
	}
	.artist-thumbnail {
		display: block;
		position: relative;
		height: 100%;
		/* min-height: 13rem; */
		/* max-height: 30rem; */
		padding-top: 15rem;
		overflow: hidden;
		@media only screen and (min-width: 640px) {
			padding-top: 18rem;
		}
		// box-shadow: 0 0 0.5rem 0.5rem #000;

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
		height: 100%;
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		&::before {
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: -5;
			content: '';
			// background-image: linear-gradient(
			// 	1turn,
			// 	var(--midnight-base),
			// 	transparent
			// );
		}

		top: 0;
	}
	.header-thumbnail {
		z-index: -1;
		top: 0;
		/* left: 0; */
		/* right: 0; */
		/* bottom: 0; */
		width: 100%;
		height: 100%;
		/* max-width: 100%; */
		max-height: 100%;
		-o-object-fit: cover;
		object-fit: cover;
		position: absolute;
		transition: all 5000ms cubic-bezier(0.455, 0.03, 0.515, 0.955);
		overflow: hidden;
		/* transform: scale(1.1); */
		border-radius: 0;
		-o-object-position: top;
		object-position: top;
		/* max-height: inherit;*/
	}
	.artist-content {
		position: relative;
		z-index: 1;

		padding-left: 3.5rem;
		width: 80%;
		.content-wrapper {
			display: inline-flex;
			flex-wrap: wrap;
			flex-direction: column;
			align-items: flex-start;

			.name {
				font-weight: 700;
				font-size: 2.5rem;
				display: inline-block;
				font-family: 'Commissioner', sans-serif;

				text-shadow: rgba(0, 0, 0, 0.171) 0.2rem -0.12rem 0.5rem;

				letter-spacing: -0.02em;
				padding-bottom: 1rem;

				@media (min-width: 320px) and (max-width: 499px) {
					// padding: 0.8em 0 0.8rem 0.5rem;
				}
				@media (min-width: 500px) and (max-width: 640px) {
					// padding: 0.8em 0 0.8rem 1.8rem;
				}
				@media screen and (min-width: 642px) and (max-width: 839px) {
					font-size: 2rem;

					// padding: 0.8em 0 0.8rem 2rem;
				}
				@media screen and (min-width: 840px) and (max-width: 960px) {
					font-size: 3.5rem;

					inline-size: 100%;
					overflow-wrap: break-word;

					// padding: 0 2rem 0.8rem 2rem;
				}
				@media screen and (min-width: 961px) {
					// padding: 0 2rem 0.8rem 2rem;
					font-size: 4.5rem;
				}
			}
		}
		@media screen and (max-width: 500px) {
			padding-left: 2rem;
		}
	}
	// .btn-wrpr {
	// 	@media (min-width: 320px) and (max-width: 499px) {
	// 		padding: 0 0 0.8rem 0.5rem;
	// 	}
	// 	@media (min-width: 500px) and (max-width: 640px) {
	// 		padding: 0 0 0.8rem 1.8rem;
	// 	}
	// 	@media screen and (min-width: 642px) and (max-width: 839px) {
	// 		padding: 0 0 0.8rem 2rem;
	// 	}
	// 	@media screen and (min-width: 840px) and (max-width: 960px) {
	// 		padding: 0 2rem 0.8rem 2rem;
	// 	}
	// 	@media screen and (min-width: 961px) {
	// 		padding: 0 2rem 0.8rem 2rem;
	// 	}
	// }
</style>
