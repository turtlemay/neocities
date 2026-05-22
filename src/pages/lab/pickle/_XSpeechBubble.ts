import lines from "./lines.json";

const DISMISS_SPEECH_TIMEOUT = 7000;
const ANIM_TEXT_INTERVAL = 20;

const lineGenerator = function* () {
	const shuffled = lines
		.map(value => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value);
	while (true) {
		const next = shuffled.shift() as string;
		shuffled.push(next);
		yield next;
	}
}();

export class XSpeechBubble extends HTMLElement {
	#text = this.querySelector(`[data-name="text"]`) as HTMLElement;
	#closeEl = this.querySelector(`[data-name="close-speech"]`) as HTMLElement;
	#lastOpenTime = performance.now();

	#isOpen = false;
	#isHovered = false;
	#updateInterval = 0;

	isOpen = () => this.#isOpen;

	connectedCallback() {
		this.#updateInterval = window.setInterval(this.#update);
		this.#closeEl.addEventListener("pointerdown", this.close);
		addEventListener("keydown", this.#handleKey);
		addEventListener("pointerover", this.#handlePointer);
	}

	disconnectedCallback() {
		window.clearInterval(this.#updateInterval);
		this.#closeEl.removeEventListener("pointerdown", this.close);
		removeEventListener("keydown", this.#handleKey);
		removeEventListener("pointerover", this.#handlePointer);
	}

	open = (text?: string) => {
		text ||= lineGenerator.next().value;
		if (this.#isOpen) return;
		this.#isOpen = true;
		this.#lastOpenTime = performance.now();
		document.getSelection()?.removeAllRanges();
		this.#animText(text);
	}

	close = () => this.#isOpen = false;

	#update = () => {
		if (this.#isOpen) this.setAttribute("open", "true");
		else this.removeAttribute("open");

		const sinceLastOpen = performance.now() - this.#lastOpenTime;
		const shouldDismiss = sinceLastOpen > DISMISS_SPEECH_TIMEOUT;

		if (this.#isOpen && !this.#isHovered && shouldDismiss)
			this.close();
	}

	#animText = async (text: string) => {
		const chars = text.split("");
		const html = chars.map(v => `<span class="anim-char hidden">${v}</span>`);
		this.#text.innerHTML = html.join("");

		for (const v of this.querySelectorAll(".anim-char")) {
			if (!this.#isOpen) return;
			v.classList.remove("hidden");
			await new Promise(r => setTimeout(r, ANIM_TEXT_INTERVAL));
		}
	}

	#handleKey = (event: KeyboardEvent) => {
		if (event.key === "Escape" && this.#isOpen)
			this.close();
	}

	#handlePointer = (event: PointerEvent) => {
		const { clientX: x, clientY: y } = event;
		const hoveredEl = document.elementFromPoint(x, y);
		this.#isHovered = this.contains(hoveredEl);
	}
}
