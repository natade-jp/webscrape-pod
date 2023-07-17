//@ts-check

import HTTP from "../lib/HTTP.js";
import Format from "../lib/Format.js";
import konpeito from "konpeito";
const Matrix = konpeito.Matrix;

/**
 * @typedef {Object} SimpleTenkiYohoRecord
 * @property {string} timeDefines 日付
 * @property {string} weathers 降水確率
 * @property {string} popsMax 日中最大降水確率
 * @property {string} tempsMax 最高気温
 * @property {string} tempsMin 最低気温
 */

function equalsDateJpn(date1, date2) {
	const date1_jp = new Date(date1);
	const date2_jp = new Date(date2);

	// 9時間先の時間にする
	date1_jp.setUTCHours( date1_jp.getUTCHours() + 9 );
	date2_jp.setUTCHours( date2_jp.getUTCHours() + 9 );

	return 	date1_jp.getUTCFullYear() === date2_jp.getUTCFullYear() &&
			date1_jp.getUTCMonth() === date2_jp.getUTCMonth() &&
			date1_jp.getUTCDate() === date2_jp.getUTCDate();
}



export default class WebscrapeTenkiYoho {

	/**
	 * @typedef {Object} TenkiYohoRecord
	 * @property {string} publishingOffice 気象台名
	 * @property {string} reportDatetime レポート時刻
	 * @property {TimeSeriesData[]} timeSeries レコードデータ
	 */

	/**
	 * @typedef {Object} TimeSeriesData
	 * @property {string[]} timeDefines 時刻情報
	 * @property {AreasData[]} areas エリア情報
	 * @property {Object} tempAverage ?
	 * @property {Object} precipAverage ?
	 */

	/**
	 * @typedef {Object} AreasData
	 * @property {AreaData} area エリア
	 * @property {string[]} weatherCodes 天気コード
	 * @property {string[]} weathers 天気
	 * @property {string[]} winds 風向き
	 * @property {string[]} waves 波の様子
	 * @property {string[]} pops 降水確率
	 * @property {string[]} temps 気温(最低、最高)
	 * @property {string[]} reliabilities 信頼度
	 * @property {string[]} tempsMin 最低気温
	 * @property {string[]} tempsMinUpper 最低気温(予想範囲上限)
	 * @property {string[]} tempsMinLower 最低気温(予想範囲下限)
	 * @property {string[]} tempsMax 最高気温
	 * @property {string[]} tempsMaxUpper 最高気温(予想範囲上限)
	 * @property {string[]} tempsMaxLower 最高気温(予想範囲下限)
	 */

	/**
	 * @typedef {Object} AreaData
	 * @property {string} name 名前
	 * @property {string} code エリアコード
	 */

	/**
	 * 天気予報情報を取得する
	 * @param {number} code_url 天気予報の気象台番
	 * @param {number} code_temps 気温の予報番号
	 * @param {number} code_weathers 天気の予報番号 
	 * @returns {Promise<SimpleTenkiYohoRecord|null>}
	 */
	static async getTenkiYoho(code_url, code_temps, code_weathers) {

		// 天気予報の番号は、以下の番号を指す
		// 愛知県 230000
		// https://www.jma.go.jp/bosai/forecast/#area_type=class20s&area_code=2310000
		// https://www.jma.go.jp/bosai/forecast/data/overview_forecast/230000.json
		// https://www.jma.go.jp/bosai/forecast/data/forecast/230000.json
		// https://anko.education/apps/weather_api

		const now = new Date();
		const next_date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
		next_date.setDate( next_date.getDate() + 1 );

		/**
		 * @type {SimpleTenkiYohoRecord}
		 */
		const simpleyoho = {
			timeDefines : Format.jpdate(next_date),
			weathers : "",
			popsMax : "",
			tempsMax : "",
			tempsMin : ""
		};

		// 指定した箇所の気象台の情報を取得する
		// https://www.jma.go.jp/bosai/forecast/data/forecast/230000.json
		const forecast_url = "https://www.jma.go.jp/bosai/forecast/data/forecast/" + code_url + ".json";
		const forecast_response = await HTTP.wget(forecast_url);
		if(!forecast_response) {
			return null;
		}
		/**
		 * @type {TenkiYohoRecord[]}
		 */
		const forecast_json = JSON.parse(forecast_response);

		{
			// 気温を調査
			const code_temps = 51106;
			//	console.log(forecast_json[0].timeSeries[2].timeDefines);
			//	console.log(forecast_json[0].timeSeries[2].areas);
			const timeDefines = forecast_json[0].timeSeries[2].timeDefines;
			const areas = forecast_json[0].timeSeries[2].areas;
			for(let i = 0; i < areas.length; i++) {
				const areas_record = areas[i];
				if(parseInt( areas_record.area.code, 10) !== code_temps) {
					continue;
				}
				for(let j = 0; j < timeDefines.length; j++) {
					const date = new Date(timeDefines[j]);
					// 次の日の情報のみ抽出する
					if (!equalsDateJpn(date, next_date)) {
						continue;
					}
					// 日本時間にする
					date.setUTCHours( date.getUTCHours() + 9 );
					// 0時と9時の情報を使用する
					if(date.getUTCHours() === 0) {
						simpleyoho.tempsMin = parseInt( areas_record.temps[j], 10).toString();
					}
					else if(date.getUTCHours() === 9) {
						simpleyoho.tempsMax = parseInt( areas_record.temps[j], 10).toString();
					}
				}
			}
		}

		{
			// 降水確率を調査
			// console.log(forecast_json[0].timeSeries[1].timeDefines);
			// console.log(forecast_json[0].timeSeries[1].areas);
			const timeDefines = forecast_json[0].timeSeries[1].timeDefines;
			const areas = forecast_json[0].timeSeries[1].areas;

			let data = "";
			for(let i = 0; i < areas.length; i++) {
				const areas_record = areas[i];
				if(parseInt( areas_record.area.code, 10) !== code_weathers) {
					continue;
				}
				for(let j = 0; j < timeDefines.length; j++) {
					const date = new Date(timeDefines[j]);
					// 次の日の情報のみ抽出する
					if (!equalsDateJpn(date, next_date)) {
						continue;
					}
					// 日本時間にする
					date.setUTCHours( date.getUTCHours() + 9 );
					// 0 時以外の降水確率を取得する
					if( date.getUTCHours() !== 0 ) {
						data += " " + areas_record.pops[j];
					}
				}
			}
			simpleyoho.popsMax = Matrix.create(data).max().toString();
		}

		{
			// 天気を調査
			// console.log(forecast_json[0].timeSeries);
			const timeDefines = forecast_json[0].timeSeries[0].timeDefines;
			const areas = forecast_json[0].timeSeries[0].areas;

			for(let i = 0; i < areas.length; i++) {
				const areas_record = areas[i];
				if(parseInt( areas_record.area.code, 10) !== code_weathers) {
					continue;
				}
				for(let j = 0; j < timeDefines.length; j++) {
					const date = new Date(timeDefines[j]);
					// 次の日の情報のみ抽出する
					if (!equalsDateJpn(date, next_date)) {
						continue;
					}
					simpleyoho.weathers = areas_record.weathers[j];
				}
			}
		}

		return simpleyoho;
	}

}
