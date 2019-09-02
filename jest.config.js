module.exports = {
	moduleFileExtensions: ['js', 'jsx', 'json', 'vue'],
	transform: {
		'^.+\\.vue$': 'vue-jest',
		'.+\\.(css|styl|less|md|sass|scss|svg|png|jpg|ttf|woff|woff2)$':
			'jest-transform-stub',
		'^.+\\.jsx?$': 'babel-jest'
	},
	transformIgnorePatterns: ['/node_modules/'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1'
	},
	setupFiles: ['jest-useragent-mock'],
	setupTestFrameworkScriptFile: './jest.setup.js',
	snapshotSerializers: ['jest-serializer-vue'],
	testMatch: ['**/__tests__/*.js'],
	testURL: 'http://localhost/',
	watchPlugins: [
		'jest-watch-typeahead/filename',
		'jest-watch-typeahead/testname'
	]
};
