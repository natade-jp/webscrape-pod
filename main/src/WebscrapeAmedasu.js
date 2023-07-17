//@ts-check

import HTTP from "../lib/HTTP.js";
import Format from "../lib/Format.js";

/**
 * @typedef {Object} AmedasuRecord
 * @property {string} timeDefines 日付
 * @property {number[]} pressure 現地気圧[hPa]
 * @property {number[]} normalPressure 海面気圧[hPa]
 * @property {number[]} temp 気温[℃]
 * @property {number[]} humidity 湿度[%]
 * @property {number[]} sun10m 日照時間(前10分)[分]
 * @property {number[]} sun1h 日照時間(前1h)[h]
 * @property {number[]} precipitation10m 降水量(前10分)[mm]
 * @property {number[]} precipitation1h 降水量(前1h)[mm]
 * @property {number[]} precipitation3h 降水量(前3h)[mm]
 * @property {number[]} precipitation24h 降水量(前24h)[mm]
 * @property {number[]} windDirection 風向[16方位]
 * @property {number[]} wind 風速[m/s]
 */

export default class WebscrapeAmedasu {

	/**
	 * アメダス情報を取得する
	 * @param {number} amdno アメダスの番号
	 * @returns {Promise<AmedasuRecord|null>}
	 */
	static async getAmedasu(amdno) {
		
		/**
		 * アメダスの番号（amdno=51106）が必要
		 * https://www.jma.go.jp/bosai/amedas/#amdno=51106&area_type=offices&area_code=230000&format=table1h&elems=70c10
		 */

		// 以下のように取得も可能だが、3時間(00,03,06,09,...)ごとの情報しか取得できない。
		// https://www.jma.go.jp/bosai/amedas/data/point/51106/20230716_03.json

		// 取得しにくいので、最終更新日を用いて取得する
		// 最終更新日を取得する
		// https://www.jma.go.jp/bosai/amedas/data/latest_time.txt
		const latest_time_url = "https://www.jma.go.jp/bosai/amedas/data/latest_time.txt";
		const latest_time_response = await HTTP.wget(latest_time_url);
		if(!latest_time_response) {
			return null;
		}
		const latest_time = new Date(latest_time_response);

		// 最終更新日の情報を取得して、特定の地域の情報を取得する
		// https://www.jma.go.jp/bosai/amedas/data/map/20230207222000.json
		const amedas_url = "https://www.jma.go.jp/bosai/amedas/data/map/" + Format.datef("YYYYMMDDhhmmss", latest_time) + ".json";
		const amedas_response = await HTTP.wget(amedas_url);
		if(!amedas_response) {
			return null;
		}
		const amedas_response_json = JSON.parse(amedas_response);
		/**
		 * @type {AmedasuRecord}
		 */
		const amedas_record = amedas_response_json[amdno];
		if(!amedas_record) {
			return null;
		}
		amedas_record.timeDefines = Format.jpdate(latest_time);

		return amedas_record;
	}

}
