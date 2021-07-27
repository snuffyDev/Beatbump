// export default function longpress(node: Node): SvelteActionReturnType {
// 	let timer
// 	function startPress(e) {
// 		if (node && node.contains(e.target))
// 			timer = setTimeout(() => {
// 				node.dispatchEvent(new CustomEvent('longpress', node))
// 			}, 750)
// 	}

// 	function cancelPress() {
// 		clearTimeout(timer)
// 	}

// 	node.addEventListener('touchstart', startPress, { passive: true })
// 	node.addEventListener('touchend', cancelPress, { passive: true })
// 	node.addEventListener('mousedown', startPress, { passive: true })
// 	node.addEventListener('mouseup', cancelPress, { passive: true })
// 	return {
// 		destroy() {
// 			node.removeEventListener('touchstart', startPress)
// 			node.removeEventListener('touchend', cancelPress)
// 			node.removeEventListener('mousedown', startPress)
// 			node.removeEventListener('mouseup', cancelPress)
// 		}
// 	}
// }
