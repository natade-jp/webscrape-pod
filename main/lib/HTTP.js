/**
 * HTTP.js
 * Copyright 2013-2023 natade < https://github.com/natade-jp >
 *
 * The MIT license.
 * https://opensource.org/licenses/MIT
 */

//@ts-check

import request from "request";

/**
 * HTTPクラス
 */
export default class HTTP {

	/**
	 * @param {string} url 
	 * @returns {Promise<string|null>}
	 */
	static async wget(url) {
		const param = {
			url: url,
			method: "GET"
		};
		let ret = null;
		await new Promise((resolve, reject) => {
			request(param, function (error, response, body) {
				if (error) {
					reject(error);
				}
				else if (response.statusCode !== 200) {
					reject(error);
				}
				else {
					ret = body;
					resolve("ok");
				}
			});
		});
		return ret;
	}

}

