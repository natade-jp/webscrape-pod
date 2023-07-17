//@ts-check
/// <reference path="../node_modules/@types/jquery/index.d.ts" />

import File from "../lib/File.js";
import CSV from "../lib/CSV.js";

const env = File.getEnvironmentFile("../environment.sh");

/**
 * 情報を更新する
 * @param {string} filename 
 * @param {アメダスデータ[]|天気データ[]} jsonarray_data 
 */
async function updateJSON(filename, jsonarray_data) {
	if(jsonarray_data === null) {
		return;
	}

	/**
	 * @typedef {アメダスデータ[]|天気データ[]}
	 */
	let data_array = [];
	
	// 以前のデータがあったらロードする
	if(File.isExist(filename)) {
		data_array = JSON.parse(File.loadTextFile(filename));
	}

	// 古いデータを削除する
	{
		const old_time = (new Date()).getTime() - (7 * 24 * 60 * 60 * 1000);
		for(let i = 0; i < data_array.length; i++) {
			const data = data_array[i];
			const time = (new Date(data["日付"])).getTime();
			if(time < old_time) {
				data_array.splice(i, 1);
				i--;
			}
		}
	}

	// 最新の情報を追加する
	{
		for(let i = 0; i < jsonarray_data.length; i++) {
			const add_data = jsonarray_data[i];
			const add_time = add_data["日付"];
			let is_hit = false;
			for(let j = 0; j < data_array.length; j++) {
				if(data_array[j]["日付"] === add_time) {
					// 新しい情報に書き換える
					data_array[j] = add_data;
					is_hit = true;
					break;
				}
			}
			if(!is_hit) {
				// 新しい情報を追加する
				data_array.push(add_data);
			}
		}
	}

	const json_text = JSON.stringify(data_array);
	File.saveTextFile(filename, json_text);
}

async function main() {
//	const kiondata = await getAmedasu();
	const tenkidata = await getTenkiYoho();
}

async function execute() {
	try {
		await main();
	} catch (e) {
		console.error(e.stack || e);
	}
}

execute();
