export function tooltip(element: HTMLElement) {
	let div: HTMLDivElement
	let title

	function mouseOver(event: MouseEvent) {
		if (element.contains(div)) element.removeChild(div)
		const rect = element.getBoundingClientRect()
		// NOTE: remove the `title` attribute, to prevent showing the default browser tooltip
		// remember to set it back on `mouseleave`
		title = element.getAttribute('data-tooltip')

		div = document.createElement('div')

		div.className = 'tooltip'
		div.setAttribute('data-tooltip', title)
		div.innerText = title

		element.appendChild(div)
		if (element.contains(div)) {
			// console.log(div.getBoundingClientRect());
			// console.dir(div);
			const divrect = div.getBoundingClientRect()
			const cX = rect.left - divrect.left
			const cY = rect.top - divrect.top
			let x = (cX / window.innerWidth) * 100
			let y = (cY / window.innerHeight) * 100
			const w = divrect.width
			if (divrect.right > window.innerWidth - divrect.width) {
				// console.log('right');
				x -= x / 2
			}
			if (divrect.left < 0) {
				x += x * 2
				// console.log('less');
			}
			if (y < 0) {
				y = -y * 2 + divrect.height
			}
			console.log(x, y, divrect)
			// const y = window.innerHeight * ((100 - _y) / 100);
			// div.style.setProperty('tt-pos-x', `${window.innerWidth / div.clientWidth}px`);
			div.style.cssText = `--tt-pos-y: ${y}px; --tt-pos-x: ${x}px; --tt-w: ${w}px;`
		}
	}
	function mouseMove(event) {
		// div.style.left = `${event.clientX + 5}px`;
		// div.style.top = `${event.clientY + 5}px`;
	}
	function mouseLeave() {
		element.removeChild(div)
		// NOTE: restore the `title` attribute
	}

	element.addEventListener('mouseenter', mouseOver)
	element.addEventListener('mousemove', mouseMove)
	element.addEventListener('mouseleave', mouseLeave)

	return {
		destroy() {
			if (element.contains(div)) element.removeChild(div)

			element.removeEventListener('mouseenter', mouseOver)
			element.removeEventListener('mouseleave', mouseLeave)
			element.removeEventListener('mousemove', mouseMove)
		}
	}
}
