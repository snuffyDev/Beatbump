<script lang="ts">
	import list from '$lib/stores/list'
	import Icon from '$lib/components/Icon/Icon.svelte'
	import { theme } from '$lib/stores/stores'
	import { onMount } from 'svelte'
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
	let opacity = 0
	let img: HTMLImageElement
	type CustomEvent = Event & {
		currentTarget: EventTarget & HTMLImageElement & HTMLPictureElement
		target: EventTarget & HTMLImageElement & HTMLPictureElement
	}
	const imageLoadHandler = (event: CustomEvent) => {
		opacity = 1
		// 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJpc29sYXRpb246aXNvbGF0ZSIgdmlld0JveD0iMCAwIDI1NiAyNTYiIHdpZHRoPSIyNTZwdCIgaGVpZ2h0PSIyNTZwdCI+PGRlZnM+PGNsaXBQYXRoIGlkPSJwcmVmaXhfX2EiPjxwYXRoIGQ9Ik0wIDBoMjU2djI1NkgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNwcmVmaXhfX2EpIj48cGF0aCBmaWxsPSIjYWNhY2FjIiBkPSJNMCAwaDI1NnYyNTZIMHoiLz48ZyBjbGlwLXBhdGg9InVybCgjcHJlZml4X19iKSI+PHRleHQgdHJhbnNmb3JtPSJtYXRyaXgoMS4yOTkgMCAwIDEuMjcgOTUuNjg4IDE4Ni45NzEpIiBmb250LWZhbWlseT0iTGF0byIgZm9udC13ZWlnaHQ9IjQwMCIgZm9udC1zaXplPSIxMjAiIGZpbGw9IiMyODI4MjgiPj88L3RleHQ+PC9nPjxkZWZzPjxjbGlwUGF0aCBpZD0icHJlZml4X19iIj48cGF0aCB0cmFuc2Zvcm09Im1hdHJpeCgxLjI5OSAwIDAgMS4yNyA3OCA0Mi4yODYpIiBkPSJNMCAwaDc3djEzNUgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjwvZz48L3N2Zz4='
	}
	const handler = (e) => {
		if (!browser) return
		if (container) scroll = container.getBoundingClientRect()
		// console.log(scroll)
		if (container) {
			y =
				window.innerWidth < 500
					? Math.min(Math.max((-scroll.top / window.innerHeight) * 2, 0), 10) *
					  175
					: Math.min(Math.max((-scroll.top / window.innerHeight) * 2, 0), 10) *
					  125
		}
	}
	$: isExpanded && handler()
	onMount(() => {
		let start
		if (img) {
			img.decode().then(() => {
				opacity = 1
			})

			img.addEventListener('load', () => {})
			// console.log(img)
		}
		wrapper = document.getElementById('wrapper')
		wrapper.addEventListener('scroll', () =>
			window.requestAnimationFrame(handler)
		)
		return () => {
			window.cancelAnimationFrame(y)
			img.removeEventListener('load', () => {
				opacity = 1
			})
			wrapper.removeEventListener('scroll', () =>
				window.cancelAnimationFrame(y)
			)
		}
	})
</script>

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
		<picture class="header-thumbnail">
			{#each thumbnail as img, i (img)}
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
				bind:this={img}
				class="header-thumbnail"
				style="opacity:{opacity};"
				loading="eager"
				src={thumbnail[1]?.url}
				id="artist_img"
				alt="Artist Thumbnail"
			/>
		</picture>
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
			font-size: 1rem;
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
			letter-spacing: -0.0125rem;
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
		padding-top: 16vh;
		overflow: hidden;
		@media only screen and (min-width: 1080px) and (max-width: 1600px) {
			padding-top: 18rem;
		}
		@media only screen and (min-width: 1601px) {
			padding-top: 38rem;
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
		transition: opacity 0.75s linear;
		// transition: all 5000ms cubic-bezier(0.455, 0.03, 0.515, 0.955);
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

		// padding-left: 3.5rem;
		@include padding;
		margin: 0 auto;

		.content-wrapper {
			display: inline-flex;
			flex-wrap: wrap;
			flex-direction: column;
			align-items: flex-start;
			width: 80%;

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
		max-width: $content-width-mobile;
		@media only screen and (min-width: 1080px) and (max-width: 1366px) {
			max-width: $content-width-md;
		}
		@media only screen and (min-width: 1367px) and (max-width: 1600px) {
			max-width: $content-width-lg;
		}
		@media only screen and (min-width: 1601px) {
			max-width: $content-width-xl;
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
