/**
 * @author Turtlemay <turtlemay.us>
 * @version 1.0
 * @see https://turtlemay.neocities.org/lab/text-animation
 */

document.head.prepend(function () {
	const style = document.createElement("style");
	style.classList.add("x-text-animator");
	style.textContent = /*css*/`
			x-text-animator {
				.x-char {
					display: inline;
					transition-property: opacity;
					transition-duration: 200ms;

					&[hidden] {
						opacity: 0;
					}
				}

				&:not(:state(content-visible)) * {
					visibility: hidden;
					user-select: none;
					pointer-events: none;
				}
			}
		`;
	return style;
}());

customElements.define("x-text-animator", class TextAnim extends HTMLElement {
	static #DEFAULT_INTERVAL = 40;

	#internals = this.attachInternals();

	get #contentVisible() {
		return this.#internals.states.has("content-visible");
	}
	set #contentVisible(bool) {
		if (bool) this.#internals.states.add("content-visible");
		else this.#internals.states.delete("content-visible");
	}

	get #playing() {
		return this.#internals.states.has("playing");
	}
	set #playing(bool) {
		if (bool) this.#internals.states.add("playing");
		else this.#internals.states.delete("playing");
	}
	isPlaying = () => this.#playing;

	get autoplay() {
		const attr = this.getAttribute("autoplay");
		if (attr === "visible") return "visible";
		if (attr) return "load";
		return false;
	}
	set autoplay(v) {
		if (v) this.setAttribute("autoplay", v);
		else this.removeAttribute("autoplay");
	}

	get interval() {
		return Number(this.getAttribute("interval")) || TextAnim.#DEFAULT_INTERVAL;
	}
	set interval(v) {
		const valid = !isNaN(v);
		if (valid) this.setAttribute("interval", `${v}`);
	}

	get duration() {
		return Number(this.getAttribute("duration")) || false;
	}
	set duration(v) {
		const valid = v && !isNaN(v) && v > 0;
		if (valid) this.setAttribute("duration", `${v}`);
	}

	connectedCallback() {
		TextAnim.#intersects.observe(this);

		addEventListener("DOMContentLoaded", () => {
			this.#renderAllTextNodeContainers();
			if (this.autoplay === "load") this.play();
		});
	}

	disconnectedCallback() {
		TextAnim.#intersects.unobserve(this);
	}

	async play(force = false) {
		if (this.#playing) {
			if (!force) return;
			await this.reset();
			return void await this.play();
		}

		this.#renderAllTextNodeContainers();
		this.#playing = true;
		this.#contentVisible = true;

		const textEls = Array.from(this.querySelectorAll(".x-text"));
		const wrapText = (arr = textEls) =>
			arr.forEach(v => v.innerHTML = TextAnim.#renderCharsToHtml(v.textContent));
		const unWrapText = (arr = textEls) =>
			arr.forEach(v => v.textContent = v.textContent);

		const charEls = wrapText() ?? Array.from(this.querySelectorAll(".x-char"));

		const lastTransitionEl = charEls[charEls.length - 1];
		const waitForLastTransition = new Promise(r =>
			lastTransitionEl.addEventListener("transitionend", r));

		const finish = () => {
			unWrapText();
			this.#playing = false;
			this.dispatchEvent(new CustomEvent("x-complete"));
		}

		let reset = false;
		this.addEventListener("x-reset", () => reset = true);
		for (const charEl of charEls) {
			if (reset) return void finish();

			charEl.removeAttribute("hidden");

			if (charEl === lastTransitionEl) {
				await waitForLastTransition;
				return void finish();
			}

			const duration = this.duration ? this.duration / charEls.length : false;
			await new Promise(r => setTimeout(r, duration || this.interval));
		}
	}

	async reset(complete = false) {
		this.#contentVisible = false;
		this.dispatchEvent(new CustomEvent("x-reset"));
		while (this.#playing) await new Promise(r => setTimeout(r));
		this.#renderAllTextNodeContainers();
		if (complete) return (this.#contentVisible = true);
		if (this.autoplay === "load") this.play();
	}

	/** Create a container for every text node. */
	#renderAllTextNodeContainers() {
		for (const textNode of TextAnim.#getAllTextNodesUnder(this)) {
			const parent = textNode.parentNode;
			if (!(parent instanceof HTMLElement)) return;
			if (parent.matches(".x-text, .x-char")) return;

			const replaceWith = TextAnim.#renderTextSpan(textNode.textContent || undefined);
			parent.insertBefore(replaceWith, textNode);
			parent.removeChild(textNode);
		}
	}

	static #intersects = new IntersectionObserver((entries) => {
		for (const v of entries) {
			if (!(v.target instanceof TextAnim)) return;
			const el = v.target;

			if (el.autoplay === "visible") {
				if (v.isIntersecting) el.play(true);
				else el.reset();
			}
		}
	});

	/** Wrap text in a span element. */
	static #renderTextSpan(text = "") {
		const span = document.createElement("span");
		span.classList.add("x-text");
		span.textContent = text;
		return span;
	}

	/** Split text into an individual span element per character. */
	static #renderCharsToHtml(text = "") {
		const chars = text.split("");
		const charsHtml = chars.map(v => (
			/*html*/`<span class="x-char" hidden>${v}</span>`));
		return charsHtml.join("");
	}

	/**
	* @param { Node } node
	*/
	static #getAllTextNodesUnder(node) {
		const result = /** @type {Node[]} */ ([]);
		const tw = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
		while (tw.nextNode()) result.push(tw.currentNode);
		return result;
	}
});
