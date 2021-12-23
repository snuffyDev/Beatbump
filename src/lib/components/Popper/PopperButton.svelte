<script lang="ts">
	import Icon from '../Icon/Icon.svelte'

	import { PopperStore } from './popperStore'
	export let items = []
	export let type = ''
	export let metadata = {}
	export let size = '1.5rem'
	export let tabindex: string | number = '0'
	function Popper(node: HTMLElement) {
		let x, y, bottom
		let isOpen
		let timer
		let initY
		function handleClick(
			event: MouseEvent & { target: HTMLElement & EventTarget }
		) {
			// if (!node.contains(event.target)) {
			// 	PopperStore.reset()
			// 	isOpen = false
			// }
			// console.log(event)
			event.stopPropagation()

			const rect = node.getBoundingClientRect()
			x = rect.left
			y = rect.top
			initY = rect.top
			bottom = rect.bottom
			isOpen = true
			PopperStore.set({
				items,
				srcNode: node,
				direction: 'normal',
				isOpen: true,
				type,
				x,
				y,
				metadata,
				bottom
			})
			return
		}
		function handleResize(event: UIEvent) {
			const log = requestAnimationFrame(() => {
				const rect = node.getBoundingClientRect()
				x = rect.left
				y = rect.top
				bottom = rect.bottom
				PopperStore.set({
					items,
					isOpen: true,
					direction: 'normal',
					type,
					x,
					y,
					metadata,
					bottom
				})
				return
				isOpen = false
			})
			timer = log
			// console.log(timer)
			if (timer) cancelAnimationFrame(timer)
			PopperStore.reset()
		}
		function handleScroll(event: UIEvent) {
			if (!isOpen) return
			const rect = node.getBoundingClientRect()
			y = rect.top
			if (y > initY + 50 || y < initY - 50) {
				PopperStore.reset()
			}
			// timer = log
			// console.log(x, y, bottom)
			// PopperStore.reset()
		}
		node.addEventListener('click', handleClick, {
			passive: true,
			capture: true
		})
		node.addEventListener(
			'keydown',
			(e) => {
				if (e.code !== 'Space') return
				node.click()
			},
			{ capture: true }
		)
		window.addEventListener('resize', handleResize)
		window.addEventListener('scroll', handleScroll, {
			capture: true,
			passive: true
		})
		return {
			destroy() {
				node.removeEventListener('click', handleClick)
				window.removeEventListener('resize', handleResize)
				window.removeEventListener('scroll', handleScroll, true)
			}
		}
	}
</script>

<div class="dd-button" role="button" aria-label="menu" use:Popper {tabindex}>
	<svelte:component this={Icon} color="#f2f2f2" {size} name="dots" />
</div>

<style src="./index.scss" lang="scss">
</style>
