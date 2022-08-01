<script lang="ts">
	import viewport from "$lib/actions/viewport";
	import { createEventDispatcher } from "svelte";

	export let items = [];
	export let hasData = false;
	export let isLoading = false;
	const dispatch = createEventDispatcher();
</script>

<div class="list">
	{#each items as item, i}
		<slot {item} index={i} />
	{/each}
	{#if !hasData}
		<div use:viewport on:enterViewport={() => dispatch("getMore")} />

		{#if isLoading}
			<div class="loading-results" style="padding: 0em;">
				<svg
					role="img"
					width="50rem"
					height="6rem"
					aria-labelledby="loading-aria"
					viewBox="0 0 575 90"
					preserveAspectRatio="none"
					class="s-iYjv5-ishYhK s-iYjv5-ishYhK s-iYjv5-ishYhK"
					><rect
						x="5"
						y="0"
						width="100%"
						height="100%"
						clip-path="url(#clip-path)"
						class="s-iYjv5-ishYhK s-iYjv5-ishYhK s-iYjv5-ishYhK"
						style="fill: url(&quot;#fill&quot;);"
					/><defs class="s-iYjv5-ishYhK s-iYjv5-ishYhK s-iYjv5-ishYhK"
						><clipPath id="clip-path" class="s-iYjv5-ishYhK s-iYjv5-ishYhK s-iYjv5-ishYhK"
							><rect
								x="0"
								y="10%"
								rx="0"
								ry="0"
								width="56"
								height="70"
								class="s-iYjv5-ishYhK s-iYjv5-ishYhK s-iYjv5-ishYhK"
							/><rect
								x="67"
								y="17"
								rx="0"
								ry="0"
								width="105"
								height="9"
								class="s-iYjv5-ishYhK s-iYjv5-ishYhK s-iYjv5-ishYhK"
							/><rect
								x="67"
								y="60"
								rx="0"
								ry="0"
								width="94"
								height="9"
								class="s-iYjv5-ishYhK s-iYjv5-ishYhK s-iYjv5-ishYhK"
							/><rect
								x="67"
								y="38"
								rx="0"
								ry="0"
								width="72"
								height="9"
								class="s-iYjv5-ishYhK s-iYjv5-ishYhK s-iYjv5-ishYhK"
							/></clipPath
						><linearGradient id="fill" class="s-iYjv5-ishYhK s-iYjv5-ishYhK s-iYjv5-ishYhK"
							><stop
								offset="0.599964"
								stop-color="#4f4f4f"
								stop-opacity="1"
								class="s-iYjv5-ishYhK s-iYjv5-ishYhK s-iYjv5-ishYhK"
								><animate
									attributeName="offset"
									values="-2; -2; 1"
									keyTimes="0; 0.25; 1"
									dur="2s"
									repeatCount="indefinite"
									class="s-iYjv5-ishYhK s-iYjv5-ishYhK s-iYjv5-ishYhK"
								/></stop
							><stop
								offset="1.59996"
								stop-color="#757575"
								stop-opacity="1"
								class="s-iYjv5-ishYhK s-iYjv5-ishYhK s-iYjv5-ishYhK"
								><animate
									attributeName="offset"
									values="-1; -1; 2"
									keyTimes="0; 0.25; 1"
									dur="2s"
									repeatCount="indefinite"
									class="s-iYjv5-ishYhK s-iYjv5-ishYhK s-iYjv5-ishYhK"
								/></stop
							><stop
								offset="2.59996"
								stop-color="#4f4f4f"
								stop-opacity="1"
								class="s-iYjv5-ishYhK s-iYjv5-ishYhK s-iYjv5-ishYhK"
								><animate
									attributeName="offset"
									values="0; 0; 3"
									keyTimes="0; 0.25; 1"
									dur="2s"
									repeatCount="indefinite"
									class="s-iYjv5-ishYhK s-iYjv5-ishYhK s-iYjv5-ishYhK"
								/></stop
							></linearGradient
						></defs
					></svg
				>
			</div>
		{/if}
	{/if}
</div>

<style src="./index.scss" lang="scss">
</style>
