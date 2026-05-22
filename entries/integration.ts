import url from "url";
import path from "path";
import fs from "fs-extra/esm";
import * as entries from "./entries.js";

const DATA_SOURCES = ["http://tm.trtl.in/api/entries.json"];

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function dataFetcher() {
	return {
		name: "entries-data-fetcher",
		hooks: {
			"astro:config:setup": async () => {
				const data = await Promise.any(DATA_SOURCES
					.filter(Boolean).map(entries.fetchEntriesData));

				fs.writeJSON(`${__dirname}/data.json`, data);
			},
		},
	};
}
