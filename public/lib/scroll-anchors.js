// @ts-check

addEventListener("DOMContentLoaded", () => {
	document.body.addEventListener("click", event => {
		if (!(event.target instanceof HTMLElement)) return;

		if (event.target?.matches(`a[href^="#"]`)) {
			event.preventDefault();
			const selector = event.target.getAttribute("href");
			if (!selector) return;
			const scrollToEl = document.querySelector(selector);
			scrollToEl?.scrollIntoView({ behavior: "smooth" });
		}
	});
});
