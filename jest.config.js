/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	// Map asset and CSS imports to inert mocks.
	moduleNameMapper: {
		'\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
			'<rootDir>/src/__mocks__/fileMock.js',
		'\\.(css|less)$': '<rootDir>/src/__mocks__/styleMock.js'
	},
	preset: 'ts-jest/presets/js-with-ts',
	resetMocks: true,
	roots: ['<rootDir>/src'],
	setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
	testEnvironment: 'jest-environment-jsdom',
	// lodash and segseg are ESM-only modules.
	transformIgnorePatterns: ['node_modules/(?!(lodash-es|segseg)/)']
};
