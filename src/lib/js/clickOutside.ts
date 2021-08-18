export const clickOutside = (node) => {
	function detect({ target }) {
		if (!node.contains(target)) {
			node.dispatchEvent(new CustomEvent('click_outside'))
		}
	}
	document.addEventListener('click', detect, { passive: true, capture: true })
	return {
		destroy() {
			document.removeEventListener('click', detect)
		}
	}
}
