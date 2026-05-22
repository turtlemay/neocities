const keysDown = new Set();

addEventListener("keydown", event => {
	if (!keysDown.has(event.code))
		dispatchEvent(new CustomEvent("turtlemay:keydownonce", { detail: event }));
	keysDown.add(event.code);
});

addEventListener("keyup", event => {
	keysDown.delete(event.code);
});
