//@ts-check
/// <reference path="../node_modules/@types/jquery/index.d.ts" />

import WebscrapeTenkiYoho from "./WebscrapeTenkiYoho.js";
import WebscrapeAmedasu from "./WebscrapeAmedasu.js";

async function main() {
	const code_url = 230000;
	const code_temps = 51106;
	const code_weathers = 230010;

	const amedasu = await WebscrapeAmedasu.getAmedasu(code_temps);
	const tenkidata = await WebscrapeTenkiYoho.getTenkiYoho(code_url, code_temps, code_weathers);
	
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
