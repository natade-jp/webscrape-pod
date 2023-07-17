//@ts-check
/// <reference path="../node_modules/@types/jquery/index.d.ts" />

import WebscrapeTenkiYoho from "./WebscrapeTenkiYoho.js";
import WebscrapeAmedasu from "./WebscrapeAmedasu.js";

async function main() {
	const amedasu = await WebscrapeAmedasu.getAmedasu();
	const tenkidata = await WebscrapeTenkiYoho.getTenkiYoho();
	console.log(amedasu);
	console.log(tenkidata);
}

async function execute() {
	try {
		await main();
	} catch (e) {
		console.error(e.stack || e);
	}
}

execute();
