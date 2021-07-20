<script lang="ts">
	import vp from '$lib/actions/viewport'

	import { onMount, tick } from 'svelte'
	import type { SearchContents } from '$lib/types'
	import { createEventDispatcher } from 'svelte'

	export let items
	export let hasData = false
	export let isLoading = false
	$: items = items
	// props
	// export let items;
	export let height = '100%'
	export let itemHeight = undefined
	export let start = 0
	export let ending = 0
	// export let itemHeight = undefined

	let totalH = []
	let viewport
	let contents
	let mounted
	let visible
	let vHeight = 0
	let rows

	let top = 0
	let bottom = 0

	let meanHeight
	$: visible = items.slice(start, ending).map((data, i) => {
		return { index: i + start, data }
	})

	$: if (mounted) refresh(items, vHeight, itemHeight)
	async function refresh(items, vHeight, itemHeight) {
		const { scrollTop } = viewport
		rows = contents.getElementsByTagName('list-row')
		await tick()
		console.log(scrollTop)

		let fullH = top - scrollTop
		let i = start

		while (fullH < vHeight && i < items.length) {
			let row = rows[i - start]
			if (!row) {
				ending = i + 1
				await tick() // render the newly visible row
				row = rows[i - start]
			}
			const row_height = (totalH[i] = itemHeight || row.offsetHeight)
			fullH += row_height
			i += 1
		}
		ending = i

		const leftover = items.length - ending

		bottom = leftover * meanHeight
		totalH.length = items.length
	}
	async function handle_scroll() {
		const { scrollTop } = viewport
		console.log(scrollTop)
		const old_start = start
		for (let v = 0; v < rows.length; v += 1) {
			totalH[start + v] = itemHeight || rows[v].offsetHeight
		}
		let i = 0
		let y = 0
		while (i < items.length) {
			const row_height = totalH[i] || meanHeight
			if (y + row_height > scrollTop) {
				start = i
				top = y
				break
			}
			y += row_height
			i += 1
		}
		while (i < items.length) {
			y += totalH[i] || meanHeight
			i += 1
			if (y > scrollTop + vHeight) break
		}
		ending = i
		const remaining = items.length - ending
		meanHeight = y / ending
		while (i < items.length) totalH[i++] = meanHeight
		bottom = remaining * meanHeight
		// prevent jumping if we scrolled up into unknown territory
		if (start < old_start) {
			await tick()
			let expected_height = 0
			let actual_height = 0
			for (let i = start; i < old_start; i += 1) {
				if (rows[i - start]) {
					expected_height += totalH[i]
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
	$: y = 0
	onMount(async () => {
		mounted = true
		viewport = document.getElementById('viewport')

		let contents = document.getElementsByTagName('list-row')
		let stamp
		function handler(event) {
			if (stamp === undefined) stamp = event.timestamp
			const scroll = contents.item(start).getBoundingClientRect()
			const elapsed = event.timestamp - start
			// console.log('scrolling')
			refresh(contents, window.innerHeight, itemHeight)
			window.requestAnimationFrame(async function (e) {
				const { scrollTop } = viewport
				console.log(scrollTop)
				const old_start = start
				for (let v = 0; v < rows.length; v += 1) {
					totalH[start + v] = itemHeight || rows[v].offsetHeight
				}
				let i = 0
				let y = 0
				while (i < items.length) {
					const row_height = totalH[i] || meanHeight
					if (y + row_height > scrollTop) {
						start = i
						top = y
						break
					}
					y += row_height
					i += 1
				}
				while (i < items.length) {
					y += totalH[i] || meanHeight
					i += 1
					if (y > scrollTop + vHeight) break
				}
				ending = i
				const remaining = items.length - ending
				meanHeight = y / ending
				while (i < items.length) totalH[i++] = meanHeight
				bottom = remaining * meanHeight
				// prevent jumping if we scrolled up into unknown territory
				if (start < old_start) {
					await tick()
					let expected_height = 0
					let actual_height = 0
					for (let i = start; i < old_start; i += 1) {
						if (rows[i - start]) {
							expected_height += totalH[i]
							actual_height += itemHeight || rows[i - start].offsetHeight
						}
					}
					const d = actual_height - expected_height
					viewport.scrollTo(0, scrollTop + d)
				}
				// TODO if we overestimated the space these
				// rows would occupy we may need to add some
				// more. maybe we can just call handle_scroll again?

				if (elapsed < 200) {
					// Stop the animation after 2 seconds
					window.requestAnimationFrame(handler)
				}

				window.cancelAnimationFrame(y)
				// -scroll.top * 2;
				// (-scroll.top Math.max(0, y / 40)0) * 2;
			})

			// console.log(y);
		}
		// window.requestAnimationFrame(handler);
		// window.addEventListener("scroll", handler);
		viewport.addEventListener('scroll', handler, { passive: true })
		return () => window.removeEventListener('scroll', handler) // rows = document.getElementById('list-row')
	})
	$: console.log(y)
	const dispatch = createEventDispatcher()
</script>

<!-- {#each items as item (item.hash)}
	{#if items !== undefined}
		<slot name="item" {item} />
	{/if}
{/each} -->
<!-- <list-body
	bind:this={view}
	bind:offsetHeight={viewport_height}
	on:scroll={handle_scroll}
	style="height: {height};width:100%; z-index: 5;">
	<list-contents
		bind:this={contents}
		style="padding-top: {top}px; width:100%; padding-bottom: {bottom}px;"> -->
<div
	id="viewport"
	bind:this={viewport}
	bind:offsetHeight={vHeight}
	style="height: {height}; ">
	{#if items !== undefined}
		<div
			id="contents"
			bind:this={contents}
			style="padding-top: {top}px; padding-bottom: {bottom}px;">
			{#each visible as item (item.index)}
				<!-- <list-row> -->
				<list-row id="list-row">
					{y}
					<slot name="item" item={item.data} />
				</list-row>
				<!-- </list-row> -->
			{/each}
		</div>
	{/if}
</div>
<!-- </list-contents> -->
<div />
{#if !hasData}
	<div
		use:vp
		on:enterViewport={() => {
			dispatch('end')
			// items_map.push()
		}} />
	{#if isLoading}
		<div class="loading-results">
			<svg
				role="img"
				width="41.0714rem"
				height="5.7143rem"
				aria-labelledby="loading-aria"
				viewBox="0 0 575 90"
				preserveAspectRatio="none">
				<rect
					x="0"
					y="0"
					width="100%"
					height="100%"
					clip-path="url(#clip-path)"
					style="fill: url('#fill');" />
				<defs>
					<clipPath id="clip-path">
						<rect x="0" y="19" rx="0" ry="0" width="56" height="56" />
						<rect x="63" y="43" rx="0" ry="0" width="177" height="11" />
						<rect x="63" y="64" rx="0" ry="0" width="94" height="11" />
						<rect x="63" y="21" rx="0" ry="0" width="72" height="11" />
					</clipPath>
					<linearGradient id="fill">
						<stop offset="0.599964" stop-color="#4f4f4f" stop-opacity="1">
							<animate
								attributeName="offset"
								values="-2; -2; 1"
								keyTimes="0; 0.25; 1"
								dur="2s"
								repeatCount="indefinite" />
						</stop>
						<stop offset="1.59996" stop-color="#757575" stop-opacity="1">
							<animate
								attributeName="offset"
								values="-1; -1; 2"
								keyTimes="0; 0.25; 1"
								dur="2s"
								repeatCount="indefinite" />
						</stop>
						<stop offset="2.59996" stop-color="#4f4f4f" stop-opacity="1">
							<animate
								attributeName="offset"
								values="0; 0; 3"
								keyTimes="0; 0.25; 1"
								dur="2s"
								repeatCount="indefinite" />
						</stop>
					</linearGradient>
				</defs>
			</svg>
		</div>
	{/if}
{/if}

<!-- </list-body> -->
<style>
	div,
	.loading-results {
		/* position: relative; */
		/* left: 0; */
		/* bottom: 5rem; */
		width: 100%;
		padding: 0 0.65rem 0 0.65rem;
		margin: 0;
		/* position: relative; */
		height: auto;
		/* bottom: 4rem; */
	}
	#viewport {
		position: relative;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		display: block;
	}
	#contents {
		display: block;
	}
	list-row {
		display: block;
		overflow: hidden;
	}
</style>
