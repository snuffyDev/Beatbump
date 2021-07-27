<script lang="ts">
	export let items
	export let isLoading = false
	export let hasData = false
	import vp from '$lib/actions/viewport'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()
</script>

<div class="list">
	{#each items as item (item.hash	)}
		<slot name="item" {item} />
	{/each}
</div>
{#if !hasData}
	<div
		use:vp
		on:enterViewport={() =>
			dispatch('getMore')
		} />
	{#if isLoading}
		<div class="loading-results" style="padding: 0em 1em 1em 1em;">
			<svg
				role="img"
				width="39.0714rem"
				height="5.7143rem"
				aria-labelledby="loading-aria"
				viewBox="0 0 575 90"
				preserveAspectRatio="none"
				class="s-iYjv5-ishYhK"
				><rect
					x="2"
					y="0"
					width="100%"
					height="100%"
					clip-path="url(#clip-path)"
					class="s-iYjv5-ishYhK"
					style="fill: url(&quot;#fill&quot;);" /><defs class="s-iYjv5-ishYhK"
					><clipPath id="clip-path" class="s-iYjv5-ishYhK"
						><rect
							x="0"
							y="19"
							rx="0"
							ry="0"
							width="56"
							height="56"
							class="s-iYjv5-ishYhK" /><rect
							x="75"
							y="43"
							rx="0"
							ry="0"
							width="177"
							height="9"
							class="s-iYjv5-ishYhK" /><rect
							x="75"
							y="64"
							rx="0"
							ry="0"
							width="94"
							height="9"
							class="s-iYjv5-ishYhK" /><rect
							x="75"
							y="21"
							rx="0"
							ry="0"
							width="72"
							height="9"
							class="s-iYjv5-ishYhK" /></clipPath
					><linearGradient id="fill" class="s-iYjv5-ishYhK"
						><stop
							offset="0.599964"
							stop-color="#4f4f4f"
							stop-opacity="1"
							class="s-iYjv5-ishYhK"
							><animate
								attributeName="offset"
								values="-2; -2; 1"
								keyTimes="0; 0.25; 1"
								dur="2s"
								repeatCount="indefinite"
								class="s-iYjv5-ishYhK" /></stop
						><stop
							offset="1.59996"
							stop-color="#757575"
							stop-opacity="1"
							class="s-iYjv5-ishYhK"
							><animate
								attributeName="offset"
								values="-1; -1; 2"
								keyTimes="0; 0.25; 1"
								dur="2s"
								repeatCount="indefinite"
								class="s-iYjv5-ishYhK" /></stop
						><stop
							offset="2.59996"
							stop-color="#4f4f4f"
							stop-opacity="1"
							class="s-iYjv5-ishYhK"
							><animate
								attributeName="offset"
								values="0; 0; 3"
								keyTimes="0; 0.25; 1"
								dur="2s"
								repeatCount="indefinite"
								class="s-iYjv5-ishYhK" /></stop
						></linearGradient
					></defs
				></svg>
		</div>
	{/if}
{/if}

<style>
	.list {
		height: 100%;
		display: block;
	}
	.loading-results {
		position: absolute;
		bottom: 5rem;
	}
</style>
