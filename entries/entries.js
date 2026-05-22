// @ts-check

import * as z from "zod";

/** @typedef {Awaited<ReturnType<typeof fetchEntriesData>>} IFetchedData */

/**
 * @param {string} url
 */
export async function fetchEntriesData(url) {
	const schema = z.array(z.object({
		date: z.string().refine(s => new Date(s) instanceof Date),
		content: z.string().refine(s => s.length > 0),
	}));
	const res = await fetch(url);
	const text = await res.text();
	const json = JSON.parse(text);
	return schema.parse(json);
}

/**
 * @param {IFetchedData} data
 */
function getEveryDate(data) {
	const groupedByDay = data.map(v => {
		const d = new Date(v.date);
		d.setHours(0, 0, 0, 0);
		return d.toDateString();
	});
	// @ts-expect-error
	const onlyUnique = (v, i, a) => a.indexOf(v) === i;
	return groupedByDay.filter(onlyUnique);
}

/**
 * @param {IFetchedData} data
 */
export function getDigests(data) {
	return getEveryDate(data).map(v =>
		getDigestForDay(data, new Date(v)));
}

/**
 * @param {IFetchedData} data
 * @param {Date} date
 */
function getDigestForDay(data, date) {
	return {
		date, values: data.filter(v => {
			const d = new Date(v.date);
			const sameYear = date.getFullYear() === d.getFullYear();
			const sameMonth = date.getMonth() === d.getMonth();
			const sameDay = date.getDate() === d.getDate();
			return sameYear && sameMonth && sameDay;
		}),
	};
}
