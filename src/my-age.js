export const myAge = function (bd = "1995") {
	const d = new Date(Date.now() - new Date(bd).getTime());
	return Math.abs(d.getUTCFullYear() - 1970);
}();
