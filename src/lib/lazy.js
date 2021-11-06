/* eslint-disable no-inner-declarations */
function lazy(node, data) {
	let once = true
	if (IntersectionObserver) {
		const observer = new IntersectionObserver(onIntersect, {
			rootMargin: '250px 250px',
			threshold: 0.01
		})
		function onIntersect(entries) {
			entries.forEach((entry) => {
				if (entry.isIntersecting && once) {
					node.setAttribute('src', data.src)
					observer.unobserve(node)
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
