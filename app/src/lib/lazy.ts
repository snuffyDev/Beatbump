function lazy(node: HTMLImageElement, data: { src?: string; placeholder?: string }): SvelteActionReturnType {
	let frame: number = undefined;
	let once = true;
	// Error Handling
	function handleErr(e: ErrorEvent & { target: HTMLImageElement & EventTarget }) {
		console.error(e.error, e.message);

		node.setAttribute(
			"src",
			"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJpc29sYXRpb246aXNvbGF0ZSIgdmlld0JveD0iMCAwIDI1NiAyNTYiIHdpZHRoPSIyNTZwdCIgaGVpZ2h0PSIyNTZwdCI+PGRlZnM+PGNsaXBQYXRoIGlkPSJwcmVmaXhfX2EiPjxwYXRoIGQ9Ik0wIDBoMjU2djI1NkgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNwcmVmaXhfX2EpIj48cGF0aCBmaWxsPSIjNDI0MjQyIiBkPSJNMCAwaDI1NnYyNTZIMHoiLz48ZyBjbGlwLXBhdGg9InVybCgjcHJlZml4X19iKSI+PHRleHQgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTA1LjU0IDE2Ni43OTQpIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLC1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LCZxdW90O1NlZ29lIFVJJnF1b3Q7LFJvYm90byxPeHlnZW4sVWJ1bnR1LENhbnRhcmVsbCwmcXVvdDtPcGVuIFNhbnMmcXVvdDssJnF1b3Q7SGVsdmV0aWNhIE5ldWUmcXVvdDssc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjQwMCIgZm9udC1zaXplPSIxMDAiIGZpbGw9IiNmYWZhZmEiPj88L3RleHQ+PC9nPjxkZWZzPjxjbGlwUGF0aCBpZD0icHJlZml4X19iIj48cGF0aCB0cmFuc2Zvcm09InRyYW5zbGF0ZSg5MiA1NC44MzkpIiBkPSJNMCAwaDcydjE0Ni4zMjNIMHoiLz48L2NsaXBQYXRoPjwvZGVmcz48L2c+PC9zdmc+",
		);
	}

	if (IntersectionObserver) {
		const intersectionObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry, i) => {
					const target = entry.target as HTMLImageElement;
					if (entry.isIntersecting && once === true) {
						target.src = data.src;
						once = false;
						intersectionObserver.unobserve(node);
					}
				});
			},
			{
				rootMargin: "85px 200px",
				threshold: 0.1,
			},
		);

		intersectionObserver.observe(node);
		return {
			update(data) {
				// console.log(data)
				frame = requestAnimationFrame(() => node.setAttribute("src", data?.src));
			},
			destroy() {
				if (frame !== undefined) {
					cancelAnimationFrame(frame);
				}
				intersectionObserver && intersectionObserver.unobserve(node);
			},
		};
	}
	node.addEventListener("error", handleErr);
}
export default lazy;
