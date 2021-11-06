<script lang="ts">
	import Dropdown from '../Dropdown/Dropdown.svelte'
	import Icon from '../Icon/Icon.svelte'

	import MobilePopper from './MobilePopper.svelte'
	import { PopperStore } from './popperStore'
	export let items = []
	export let type = ''
	export let metadata = {}
	export let isHidden = false
	function Popper(node: HTMLElement) {
		let x, y, bottom
		let isOpen
		let timer
		let initY
		function handleClick(event: MouseEvent) {
			event.stopPropagation()

			// console.log(isOpen)
			// console.log($PopperStore)
			if ($PopperStore.isOpen) {
				PopperStore.reset()

				return
			}
			const rect = node.getBoundingClientRect()
			x = rect.left
			y = rect.top
			initY = rect.top
			bottom = rect.bottom
			PopperStore.set({ items, isOpen: true, type, x, y, metadata, bottom })
			return
			isOpen = false
			PopperStore.reset()
		}
		function handleResize(event: UIEvent) {
			const log = requestAnimationFrame(() => {
				const rect = node.getBoundingClientRect()
				x = rect.left
				y = rect.top
				bottom = rect.bottom
				PopperStore.set({ items, isOpen: true, type, x, y, metadata, bottom })
				return
				isOpen = false
			})
			timer = log
			// console.log(timer)
			if (timer) cancelAnimationFrame(timer)
			PopperStore.reset()
		}
		function handleScroll(event: UIEvent) {
			const rect = node.getBoundingClientRect()
			y = rect.top
			if (y > initY + 50 || y < initY - 50) {
				PopperStore.reset()
			}
			// timer = log
			// console.log(x, y, bottom)
			// PopperStore.reset()
		}
		node.addEventListener('click', handleClick)
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

<div class="dd-button" use:Popper>
	<svelte:component this={Icon} color="#f2f2f2" size="1.5rem" name="dots" />
</div>

<style src="./index.scss" lang="scss">
</style>
