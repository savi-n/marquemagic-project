/* This util function is used in app.config file to concat string
  like host/server and api endpoint */
export default function template(strings, ...keys) {
	return function(...values) {
		let dict = values[values.length - 1] || {};
		let result = [strings[0]];
		keys.forEach(function(key, i) {
			let value = Number.isInteger(key) ? values[key] : dict[key];
			result.push(value ?? key, strings[i + 1]);
		});
		return result.join('');
	};
}
