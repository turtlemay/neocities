import { gsap } from "gsap";
import { XSpeechBubble } from "./_XSpeechBubble.ts";

const titleEl = document.querySelector(".siteHeader") as HTMLElement;
const mainEl = document.querySelector(".siteMain") as HTMLElement;
const pickleEl = document.querySelector(".pickle-animator") as HTMLElement;
const lidEl = document.querySelector(".jar-lid-animator") as HTMLElement;
const labelEl = document.querySelector(".jar-label-animator") as HTMLElement;
const jarEl = document.querySelector(".jar") as HTMLElement;
const speechEl = document.querySelector("x-speech-bubble") as XSpeechBubble;

let runningIntro = false;
let runningFortune = false;

addEventListener("DOMContentLoaded", () => {
	pickleEl.addEventListener("click", startFortune);

	if (import.meta.env.DEV) {
		document.querySelector("h1")?.addEventListener("click", startIntro);
	} else {
		startIntro();
	}
});

async function startFortune() {
	while (speechEl.isOpen()) {
		speechEl.close();
		await new Promise(r => setTimeout(r, 1000));
	}
	if (runningFortune) return;
	if (runningIntro) return;
	runningFortune = true;
	const onComplete = () => runningFortune = false;
	await new Promise(r => setTimeout(r, 500));
	speechEl.open();
	return gsap.timeline()
		.to(pickleEl, { rotation: 5, y: 10, duration: 0.2 })
		.to(pickleEl, { rotation: -5, duration: 0.2 })
		.to(pickleEl, { rotation: 5, duration: 0.2 })
		.to(pickleEl, { rotation: 0, y: 0, duration: 0.5, onComplete });
}

function startIntro() {
	if (runningIntro) return;
	runningIntro = true;
	speechEl.close();
	const onComplete = () => runningIntro = false;
	return gsap.timeline()
		.from(titleEl, { y: -100, opacity: 0, duration: 1, ease: "elastic.out(i, 1)" })
		.from(jarEl, { x: 1000, rotation: 4, duration: 1, delay: 1, ease: "elastic.out(i, 0.5)" })
		.to(lidEl, { x: 100, y: -100, rotation: 55, duration: 1, delay: 0.5, ease: "elastic.out(i, 1)" })
		.from(pickleEl, { x: -50, y: -700, rotation: -45, duration: 1, delay: 0.5, ease: "elastic.out(i, 0.95)" })
		.to(lidEl, { x: 0, y: 0, rotation: 0, duration: 0.5, ease: "power3.inout" })
		.from(labelEl, { x: -400, y: 0, scaleX: 0.75, duration: 1 })
		.from(mainEl, { y: -100, opacity: 0, duration: 1, delay: 1, ease: "elastic.out(i, 1)", onComplete });
}
