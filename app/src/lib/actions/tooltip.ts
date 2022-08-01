export function tooltip(element: HTMLElement) {
	let div: HTMLDivElement;
	let title;
	let timer;
	function mouseOver(event: PointerEvent & TouchEvent) {
		if (element.contains(div)) element.removeChild(div);
		timer = () =>
			setTimeout(() => {
				div.style.opacity = "0";
				div.addEventListener("transitionend", () => element.removeChild(div));

				element.removeEventListener("touchcancel", mouseLeave, true);
				element.removeEventListener("touchend", mouseLeave, true);
				element.removeEventListener("pointerout", mouseLeave);
			}, 150);

		const rect = element.getBoundingClientRect();
		title = element.getAttribute("data-tooltip");

		div = document.createElement("div");

		div.className = "tooltip";
		div.setAttribute("data-tooltip", title);
		div.innerText = title;

		element.appendChild(div);
		if (element.contains(div)) {
			const divrect = div.getBoundingClientRect();
			const cX = rect.left - divrect.left;
			const cY = rect.top - divrect.top;
			let x = (cX / window.innerWidth) * 100;
			let y = (cY / window.innerHeight) * 100;
			const w = divrect.width;
			if (divrect.right > window.innerWidth - divrect.width) {
				x -= x / 2;
			}
			if (divrect.left < 0) {
				x += x * 2;
			}
			if (y < 0) {
				y = -y * 2 + divrect.height;
			}

			div.style.cssText = `--tt-pos-y: ${y}px; --tt-pos-x: ${x}px; --tt-w: ${w}px;  opacity: 1;`;
		}
		element.addEventListener("touchcancel", mouseLeave, { passive: true });
		element.addEventListener("touchend", mouseLeave, { passive: true });
		element.addEventListener("pointerout", mouseLeave);
	}
	function mouseLeave() {
		if (timer && element.contains(div)) {
			timer();
		}
		timer = undefined;
	}

	element.addEventListener("touchstart", mouseOver, { passive: true });
	element.addEventListener("pointerover", mouseOver);

	return {
		destroy() {
			if (element.contains(div)) {
				element.removeChild(div);
			}

			element.removeEventListener("touchstart", mouseOver, true);
			element.removeEventListener("pointerover", mouseOver);
		},
	};
}
