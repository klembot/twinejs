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
	setupFilesAfterEnv: ['./jest.setup.js'],
	snapshotSerializers: ['jest-serializer-vue'],
	testMatch: ['**/__tests__/*.js'],
	coveragePathIgnorePatterns: ['node_modules', '__stories__'],
	testURL: 'http://localhost/',
	watchPlugins: [
		'jest-watch-typeahead/filename',
		'jest-watch-typeahead/testname'
	]
};
