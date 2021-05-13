module.exports = {
	style: {
		postcss: {
			plugins: [
				require('postcss'),
				require('craco-plugin-scoped-css'),
				require('postcss-import'),
				require('tailwindcss'),
				require('autoprefixer')
			]
		}
	}
};
