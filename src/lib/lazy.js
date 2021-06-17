function lazy(node, data) {
	const datasrc = node.dataset.src
	node.setAttribute('src', datasrc)
	if (IntersectionObserver) {
		const observer = new IntersectionObserver(onIntersect, {
			rootMargin: '250px 250px',
			threshold: 0.1
		})
		function onIntersect(entries) {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					node.setAttribute('src', data.src)
				}
			})
		}
		observer.observe(node)
		return {
			destroy() {
				observer && observer.unobserve(node)
			}
		}
	} else {
		// fallback
		let lazyLoadThrottleTimeout = undefined
		function polyfillLazyLoad() {
			if (lazyLoadThrottleTimeout) {
				clearTimeout(lazyLoadThrottleTimeout)
			}
			lazyLoadThrottleTimeout = setTimeout(function () {
				var scrollTop = window.pageYOffset
				if (node.offsetTop < window.innerHeight + scrollTop) {
					node.setAttribute('src', src)
				}
			}, 20)
		}
		document.addEventListener('scroll', polyfillLazyLoad)
		window.addEventListener('resize', polyfillLazyLoad)
		window.addEventListener('orientationChange', polyfillLazyLoad)
		return {
			destroy() {
				document.removeEventListener('scroll', polyfillLazyLoad)
				window.removeEventListener('resize', polyfillLazyLoad)
				window.removeEventListener('orientationChange', polyfillLazyLoad)
			}
		}
	}
}
export default lazy
