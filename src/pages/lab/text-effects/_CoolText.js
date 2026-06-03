/**
 * @author Turtlemay <turtlemay.us>
 * @version 1.0
 * @see https://turtlemay.neocities.org/lab/text-effects
 */

/** @param {number} n */
const waitForMillis = n => new Promise(r => setTimeout(r, n));

const styles = {
	char: css({
		"display": "inline-block",
		"text-decoration": "inherit",
	}),
	chunk: css({
		"white-space": "nowrap",
		"text-decoration": "inherit",
	}),
	space: css({
		"text-decoration": "inherit",
	}),
};

export default class extends HTMLElement {
	#running = false;

	get startDelay() { return this.#getNumProp("--start-delay", 0); }
	get charInterval() { return this.#getNumProp("--char-interval", 100); }
	get charActiveTime() { return this.#getNumProp("--char-active-time", 250); }
	get repeatDelay() { return this.#getNumProp("--repeat-delay", 500); }
	get animDirection() { return this.#getProp("--anim-direction", "forwards"); }

	get disabled() { return this.hasAttribute("disabled"); }
	set disabled(bool) {
		if (bool) this.setAttribute("disabled", "");
		else this.removeAttribute("disabled");
	}

	reset = () => this.dispatchEvent(new CustomEvent("reset"));

	async connectedCallback() {
		for (const v of findTextNodes(this)) {
			const frag = document.createRange().createContextualFragment(
				renderCharsHtml(`${v.textContent}`));
			v.replaceWith(frag);
		}
		while (true) await this.#animRoutine();
	}

	async #animRoutine() {
		if (this.disabled || this.#running) return;
		this.#running = true;

		let reset = false;
		const resetListener = () => reset = true;
		this.addEventListener("reset", resetListener);

		await waitForMillis(this.startDelay);

		const charElems = this.querySelectorAll(".char:not(.space)");

		/** @param {Element} v */
		const updateElem = (v) => {
			v.classList.add("active");
			waitForMillis(this.charActiveTime)
				.then(() => v.classList.remove("active"));
		};

		if (["forwards", "both", "alternate"].some(v => v === this.animDirection)) {
			for (let i = 0; i < charElems.length; i++) {
				if (this.disabled || reset) break;
				updateElem(charElems[i]);
				await waitForMillis(this.charInterval);
			}
		}

		if ("alternate" === this.animDirection)
			if (!this.disabled && !reset)
				await waitForMillis(this.repeatDelay);

		if (["backwards", "both", "alternate"].some(v => v === this.animDirection)) {
			for (let i = charElems.length - 1; i >= 0; i--) {
				if (this.disabled || reset) break;

				if ("both" === this.animDirection)
					if (i === charElems.length - 1)
						continue;

				updateElem(charElems[i]);
				await waitForMillis(this.charInterval);
			}
		}

		this.#running = false;
		this.removeEventListener("reset", resetListener);

		if (!this.disabled && !reset)
			await waitForMillis(this.repeatDelay);
	}

	#getProp(property = "", defaultValue = "") {
		const value = getComputedStyle(this).getPropertyValue(property);
		return value || defaultValue;
	}

	#getNumProp(property = "", defaultValue = 0) {
		const value = getComputedStyle(this).getPropertyValue(property);
		if (value === "") return defaultValue;
		const n = Number(value);
		if (isNaN(n)) return defaultValue;
		return n;
	}
}

function renderCharsHtml(text = "") {
	const resultHtml = [];
	for (const chunk of text.split(/\s+/)) {
		const chars = chunk.split("");
		const charsHtml = chars.map(char =>
			`<span class="char" style="${styles.char}">${char}</span>`);
		resultHtml.push(
			`<span class="chunk" style="${styles.chunk}">${charsHtml.join("")}</span>`);
	}
	return resultHtml.join(
		`<span class="char space" style="${styles.space}">&#32;</span>`);
}

function findTextNodes(elem = document.body) {
	const arr = [];
	const walker = document.createTreeWalker(elem, NodeFilter.SHOW_TEXT);
	while (walker.nextNode()) walker.currentNode instanceof Text &&
		arr.push(walker.currentNode);
	return arr;
}

function css(style = {}) {
	return Object.entries(style).map(([k, v]) => `${k}:${v}`).join(";");
}
