export default function longpress(node:Node): SvelteActionReturnType {
	let timer
		function startPress() {
			timer = setTimeout(()=> {
				node.dispatchEvent(new CustomEvent('longpress'))
			}, 750);
		}

		function cancelPress() {
			clearTimeout(timer)
		}


		node.addEventListener('touchstart',startPress);
		node.addEventListener('touchend',cancelPress);
		node.addEventListener('mousedown',startPress);
		node.addEventListener('mouseup',cancelPress);
		return {
			destroy() {
				node.removeEventListener('touchstart',startPress);
				node.removeEventListener('touchend',cancelPress);
			node.removeEventListener('mousedown',startPress);
			node.removeEventListener('mouseup',cancelPress);
		}
		}
}