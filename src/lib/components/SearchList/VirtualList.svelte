<script>
	import { createEventDispatcher, onMount, tick } from 'svelte'
	import vp from '$lib/actions/viewport'
	const dispatch = createEventDispatcher()
	// props
	export let items
	export let height = '100%'
	export let itemHeight = undefined
	export let isLoading = false
	export let hasData = false
	let foo

	// read-only, but visible to consumers via bind:start
	export let start = 0
	export let end = 0

	// local state
	let height_map = []
	let rows
	let viewport
	let contents
	let viewport_height = 0
	let visible
	let mounted

	let top = 0
	let bottom = 0
	let average_height

	$: visible = items.slice(start, end).map((data, i) => {
		return { index: i + start, data }
	})

	// whenever `items` changes, invalidate the current heightmap
	$: if (mounted) refresh(items, viewport_height, itemHeight)

	async function refresh(items, viewport_height, itemHeight) {
		const { scrollTop } = viewport

		await tick() // wait until the DOM is up to date

		let content_height = top - scrollTop
		let i = start

		while (content_height < viewport_height && i < items.length) {
			let row = rows[i - start]

			if (!row) {
				end = i + 1
				await tick() // render the newly visible row
				row = rows[i - start]
			}

			const row_height = (height_map[i] = itemHeight || row.offsetHeight)
			content_height += row_height
			i += 1
		}

		end = i

		const remaining = items.length - end
		average_height = (top + content_height) / end

		bottom = remaining * average_height
		height_map.length = items.length
	}

	async function handle_scroll() {
		const { scrollTop } = viewport

		const old_start = start

		for (let v = 0; v < rows.length; v += 1) {
			height_map[start + v] = itemHeight || rows[v].offsetHeight
		}

		let i = 0
		let y = 0

		while (i < items.length) {
			const row_height = height_map[i] || average_height
			if (y + row_height > scrollTop) {
				start = i
				top = y

				break
			}

			y += row_height
			i += 1
		}

		while (i < items.length) {
			y += height_map[i] || average_height
			i += 1

			if (y > scrollTop + viewport_height) break
		}

		end = i

		const remaining = items.length - end
		average_height = y / end

		while (i < items.length) height_map[i++] = average_height
		bottom = remaining * average_height

		// prevent jumping if we scrolled up into unknown territory
		if (start < old_start) {
			await tick()

			let expected_height = 0
			let actual_height = 0

			for (let i = start; i < old_start; i += 1) {
				if (rows[i - start]) {
					expected_height += height_map[i]
					actual_height += itemHeight || rows[i - start].offsetHeight
				}
			}

			const d = actual_height - expected_height
			viewport.scrollTo(0, scrollTop + d)
		}

		// TODO if we overestimated the space these
		// rows would occupy we may need to add some
		// more. maybe we can just call handle_scroll again?
	}
	// trigger initial refresh
	onMount(() => {
		rows = contents.getElementsByTagName('svelte-virtual-list-row')
		if (items.length > 1) mounted = true
	})
</script>

<svelte-virtual-list-viewport
	bind:this={viewport}
	bind:offsetHeight={viewport_height}
	on:scroll={handle_scroll}
	style="height: {height};">
	<svelte-virtual-list-contents
		bind:this={contents}
		style="padding-top: {top}px; padding-bottom: {bottom}px;">
		{#each visible as row (row.index)}
			<svelte-virtual-list-row>
				<slot item={row.data}>Missing template</slot>
			</svelte-virtual-list-row>
			<!-- {#if row.index == items.length - 2} -->
			<!-- {/if} -->
		{/each}
	</svelte-virtual-list-contents>

	{#if !hasData}
		<div
			style="padding:1em;"
			use:vp
			on:enterViewport={() => dispatch('endList')} />
		{#if isLoading}
			<div class="loading-results">
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
</svelte-virtual-list-viewport>

<style>
	.loading-results {
		width: 100%;
		padding: 0;
		margin: 0;
		height: auto;
		display: block;
		padding-left: 0.8rem;
	}
	svelte-virtual-list-viewport {
		position: relative;
		overflow-y: auto;
		overflow-x: hidden;
		width: 100%;
		height: 100%;
		top: 0;
		/* bottom: 8rem; */
		-webkit-overflow-scrolling: touch;
		display: block;
	}

	svelte-virtual-list-contents,
	svelte-virtual-list-row {
		display: block;
	}

	svelte-virtual-list-row {
		/* overflow: hidden; */
	}
</style>
